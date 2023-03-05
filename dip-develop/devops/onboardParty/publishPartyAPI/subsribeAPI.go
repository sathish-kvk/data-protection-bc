package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
)

const APP_CONTEXT = "X-IBM-APIManagement-Context"
const DEV_ORG_NAME = "Internal Org"
const END_POINT = "eu.apiconnect.ibmcloud.com"

type CreateDevOrgResponse struct {
	Id   string `json:"id"`
	Name string `json:"name"`
	Url  string `json:"url"`
}

type CreateApplicationRequest struct {
	Name        string `json:"name"`
	AppImageURL string `json:"appImageURL"`
	Credentials struct {
		ClientID     string `json:"clientID"`
		ClientSecret string `json:"clientSecret"`
		Description  string `json:"description"`
	} `json:"credentials"`
	Description      string `json:"description"`
	OauthRedirectURI string `json:"oauthRedirectURI"`
	Public           int    `json:"public"`
}

type CreateApplicationResponse struct {
	Type        string      `json:"type"`
	PromoteTo   interface{} `json:"promoteTo"`
	ID          string      `json:"id"`
	Name        string      `json:"name"`
	OrgID       string      `json:"orgID"`
	Public      bool        `json:"public"`
	Description string      `json:"description"`
	Credentials struct {
		ClientID     string `json:"clientID"`
		ClientSecret string `json:"clientSecret"`
		Description  string `json:"description"`
		URL          string `json:"url"`
	} `json:"credentials"`
	AppCredentials []struct {
		ID           string `json:"id"`
		Description  string `json:"description"`
		URL          string `json:"url"`
		ClientID     string `json:"clientID"`
		ClientSecret string `json:"clientSecret"`
	} `json:"appCredentials"`
	Enabled          bool        `json:"enabled"`
	State            string      `json:"state"`
	ImageURL         interface{} `json:"imageURL"`
	AppImageURL      string      `json:"appImageURL"`
	OauthRedirectURI string      `json:"oauthRedirectURI"`
	Certificate      interface{} `json:"certificate"`
	CreatedAt        string      `json:"createdAt"`
	UpdatedAt        string      `json:"updatedAt"`
	URL              string      `json:"url"`
}

type SubscribeAppRequest struct {
	Plan    string `json:"plan"`
	Product struct {
		Name    string `json:"name"`
		Version string `json:"version"`
	} `json:"product"`
}

type SubscribeAppResponse struct {
	ID  string `json:"id"`
	App struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	} `json:"app"`
	Product struct {
		ID      string `json:"id"`
		Name    string `json:"name"`
		Version string `json:"version"`
	} `json:"product"`
	Plan      string `json:"plan"`
	Approved  bool   `json:"approved"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
	URL       string `json:"url"`
}

type GetDevOrgResponse struct {
	Roles []string `json:"roles"`
	ID    string   `json:"id"`
	Name  string   `json:"name"`
	URL   string   `json:"url"`
	Owner bool     `json:"owner"`
}

type ResetClientSecretResponse struct {
	ID           string `json:"id"`
	Description  string `json:"description"`
	URL          string `json:"url"`
	ClientID     string `json:"clientID"`
	ClientSecret string `json:"clientSecret"`
}

type AppCredential struct {
	ClientID     string
	ClientSecret string
}

func SubscribeAPIs(provisionInfo ProvisionInfo, organization string, catalogName string, newParties []string) error {
	var appCredentials = make(map[string]AppCredential)
	if err := provisionInfo.provisioner.CallCFWithArgs("target -s", DIP_SERVICE_CATALOGUE); err != nil {
		return err
	}
	// Get existing apps
	appCredentials, err := GetExistAppsCredential(provisionInfo, organization, catalogName)
	if err != nil {
		return err
	}

	for _, partyName := range newParties {
		appCredential, err := PublishLoopBackAPI(provisionInfo,
			organization,
			catalogName,
			partyName)
		if err != nil {
			return err
		}
		// only set if new app was created...
		if appCredential.ClientID != "" {
			appCredentials[partyName] = appCredential
		}
	}

	// Create and deploy digital-locker
	var partyAppCredentials []PartyAppCredential
	for partyName, appCredential := range appCredentials {
		partyAppCredential := PartyAppCredential{
			ClientID:           appCredential.ClientID,
			ClientSecret:       appCredential.ClientSecret,
			PartyName:          partyName,
			FormateddPartyName: formatSpaces(partyName),
		}
		partyAppCredentials = append(partyAppCredentials, partyAppCredential)
	}

	digitalLockerDetails := &DigitalLockerDetails{
		PartyAppCredentials:    partyAppCredentials,
		DigitalLockerTemplate:  fmt.Sprintf("%v/actions/%v", provisionInfo.cloudFunctionPath, DIGITAL_LOCKER_TEMPLATE_NAME),
		OutputDir:              fmt.Sprintf("%v/actions/%v", *pCloudFunctionPath, DIGITAL_LOCKER_FOLDER),
		DIPServiceCatalogSpace: DIP_SERVICE_CATALOGUE,
		ProvisionInfo:          provisionInfo,
	}

	if err := GenerateCFDigitalLocker(digitalLockerDetails); err != nil {
		return err
	}

	//email
	if provisionInfo.sendGridAPIKey != "NA" {
		var sortedPartyAppCredentials []PartyAppCredential
		for _, partyAppCredential := range partyAppCredentials {
			if contains(newParties, partyAppCredential.PartyName) == false {
				sortedPartyAppCredentials = append(sortedPartyAppCredentials, partyAppCredential)
			}
		}
		for _, partyAppCredential := range partyAppCredentials {
			if contains(newParties, partyAppCredential.PartyName) == true {
				partyAppCredential.IsNew = true
				sortedPartyAppCredentials = append(sortedPartyAppCredentials, partyAppCredential)
			}
		}
		if err := SendEmail(sortedPartyAppCredentials, provisionInfo); err != nil {
			return err
		}
	}
	return nil
}

func contains(slice []string, item string) bool {
	set := make(map[string]struct{}, len(slice))
	for _, s := range slice {
		set[s] = struct{}{}
	}
	_, ok := set[item]
	return ok
}

func GetExistAppsCredential(provisionInfo ProvisionInfo, organization string, catalogName string) (map[string]AppCredential, error) {
	var appCredentials = make(map[string]AppCredential)

	apiManagementContext := fmt.Sprintf("%v.%v", organization, catalogName)
	// return if the dev org is already existed
	devOrg, err := GetDevOrgs(apiManagementContext, provisionInfo)
	if err != nil {
		return appCredentials, err
	}
	if devOrg.ID != "" {
		apps, err := GetApplications(devOrg.ID, apiManagementContext, provisionInfo)
		if err != nil {
			return appCredentials, err
		}
		for _, app := range apps {
			log.Printf("Party app: %v has been created with ClientId: %v", app.Name, app.Credentials.ClientID)
			appCredential, err := GetExistingAppCredential(app.Credentials.ClientID, provisionInfo)
			if err != nil {
				return appCredentials, err
			}
			// reset client secret
			if appCredential.ClientSecret == "" {
				log.Printf("Reset client secret for party: %v", app.Name)
				appUrl := app.AppCredentials[0].URL
				resetAppCredential, err := ResetClientSecret(appUrl, apiManagementContext, provisionInfo)
				if err != nil {
					return appCredentials, err
				}
				appCredential.ClientID = resetAppCredential.ClientID
				appCredential.ClientSecret = resetAppCredential.ClientSecret
			}
			// check to see if app has been subsribed "product"
			//PartyName ==== app.Name
			formatedPartyName := formatSpaces(app.Name)
			version, err := GetProductVersion(app.Name, provisionInfo)
			if err != nil {
				return appCredentials, err
			}
			if version == "" {
				log.Printf("There is no product name: %v or it has multiple versions", formatedPartyName)
			} else {
				hasSubscribedProduct, err := IsSubscribedApp(devOrg.ID, app.ID, apiManagementContext, formatedPartyName, version, provisionInfo)
				if err != nil {
					return appCredentials, err
				}

				if hasSubscribedProduct == true {
					log.Printf("Product: %v --- version: %v has been subcribed with clientId: %v", formatedPartyName, version, app.Credentials.ClientID)
				} else {
					_, err := SubcribeApplicationToPlan(devOrg.ID, app.ID, apiManagementContext, formatedPartyName, version, provisionInfo)
					if err != nil {
						return appCredentials, err
					}
				}
			}
			appCredentials[app.Name] = appCredential
		}
	}
	return appCredentials, nil
}

func PublishLoopBackAPI(provisionInfo ProvisionInfo, organization string, catalogName string, partyName string) (AppCredential, error) {
	var appCredential = AppCredential{}
	apiManagementContext := fmt.Sprintf("%v.%v", organization, catalogName)
	// return if the dev org is already existed
	devOrg, err := GetDevOrgs(apiManagementContext, provisionInfo)
	if err != nil {
		return appCredential, err
	}
	var orgID string
	orgID = devOrg.ID
	var hasExistApp bool = false

	if devOrg.ID != "" {
		apps, err := GetApplications(devOrg.ID, apiManagementContext, provisionInfo)
		if err != nil {
			return appCredential, err
		}
		for _, app := range apps {
			if app.Name == partyName {
				hasExistApp = true
				break
			}
		}
	} else {
		// Create Developer Org
		createDevOrgRes, err := CreateDeveloperOrg(apiManagementContext, provisionInfo)
		if err != nil {
			return appCredential, err
		}
		orgID = createDevOrgRes.Id
	}
	// create app and subcribe plan if app does not exist
	if hasExistApp == false {
		// Create Dev App & subscribe plan
		formatedPartyName := formatSpaces(partyName)

		version, err := GetProductVersion(partyName, provisionInfo)
		if err != nil {
			return appCredential, err
		}
		// There is no Product API
		if version == "" {
			log.Printf("There is no product name: %v or it has multiple versions", formatedPartyName)
		} else {
			// AppName == PartyName
			appCredential, err = CreateAppAndSubscribePlan(orgID, partyName, formatedPartyName, version, apiManagementContext, provisionInfo)
			if err != nil {
				return appCredential, err
			}
		}
	}
	return appCredential, nil
}

func ResetClientSecret(appCredentialUrl string, apiManagementContext string, provisionInfo ProvisionInfo) (ResetClientSecretResponse, error) {
	apiCall := fmt.Sprintf("%v/reset-secret", appCredentialUrl)
	req, err := http.NewRequest("PUT", apiCall, nil)
	req.Header.Set("Authorization", provisionInfo.basicAuthKey)
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-IBM-APIManagement-Context", apiManagementContext)

	client := &http.Client{}
	response, err := client.Do(req)
	var responseObject ResetClientSecretResponse
	if err != nil {
		log.Fatal(err)
		return responseObject, err
	} else {
		data, _ := ioutil.ReadAll(response.Body)
		if err := json.Unmarshal(data, &responseObject); err != nil {
			log.Fatal(err)
			return responseObject, err
		}
	}
	return responseObject, nil
}

func CreateAppAndSubscribePlan(orgID string, appName string, productName string, version string, apiManagementContext string, provisionInfo ProvisionInfo) (AppCredential, error) {
	var appCredential AppCredential
	createAppRes, err := CreateApplication(orgID, appName, apiManagementContext, provisionInfo)
	if err != nil {
		return appCredential, err
	}
	appID := createAppRes.ID
	appCredential.ClientID = createAppRes.Credentials.ClientID
	appCredential.ClientSecret = createAppRes.Credentials.ClientSecret

	//Subscribe app with plan
	_, err = SubcribeApplicationToPlan(orgID, appID, apiManagementContext, productName, version, provisionInfo)
	if err != nil {
		return appCredential, err
	}
	return appCredential, nil
}

func CreateDeveloperOrg(apiManagementContext string, provisionInfo ProvisionInfo) (CreateDevOrgResponse, error) {
	orgAPICall := fmt.Sprintf("https://%v/v1/portal/orgs/", END_POINT)
	params := map[string]string{"name": DEV_ORG_NAME}
	jsonBody, _ := json.Marshal(params)

	req, err := http.NewRequest("POST", orgAPICall, bytes.NewBuffer(jsonBody))
	//req.SetBasicAuth(provisionInfo.apiUser, provisionInfo.apiPwd)
	req.Header.Set("Authorization", provisionInfo.basicAuthKey)
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-IBM-APIManagement-Context", apiManagementContext)

	client := &http.Client{}
	response, err := client.Do(req)
	var responseObject CreateDevOrgResponse
	if err != nil {
		log.Fatal(err)
		return responseObject, err
	} else {
		data, _ := ioutil.ReadAll(response.Body)

		if err := json.Unmarshal(data, &responseObject); err != nil {
			return responseObject, err
		}
	}
	log.Printf("Org ID: %v --- Name: %v", responseObject.Id, responseObject.Name)
	return responseObject, nil
}

func CreateApplication(orgID string, appName string, apiManagementContext string, provisionInfo ProvisionInfo) (CreateApplicationResponse, error) {
	apiCall := fmt.Sprintf("https://%v/v1/portal/orgs/%v/apps", END_POINT, orgID)
	createAppRequest := CreateApplicationRequest{
		Name:             appName,
		AppImageURL:      "",
		Description:      "This is internal API app",
		OauthRedirectURI: "",
		Public:           1,
	}
	createAppRequest.Credentials.ClientID = "true"
	createAppRequest.Credentials.ClientSecret = "true"
	createAppRequest.Credentials.Description = "app credentials"

	jsonCreateAppRequest, _ := json.Marshal(createAppRequest)
	req, err := http.NewRequest("POST", apiCall, bytes.NewBuffer(jsonCreateAppRequest))
	//req.SetBasicAuth(provisionInfo.apiUser, provisionInfo.apiPwd)
	req.Header.Set("Authorization", provisionInfo.basicAuthKey)
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-IBM-APIManagement-Context", apiManagementContext)

	client := &http.Client{}
	response, err := client.Do(req)
	var createApplicationResponse CreateApplicationResponse
	if err != nil {
		log.Fatal(err)
		return createApplicationResponse, err
	} else {
		data, _ := ioutil.ReadAll(response.Body)
		if err := json.Unmarshal(data, &createApplicationResponse); err != nil {
			return createApplicationResponse, err
		}
	}
	log.Printf("App ID: %v --- Name: %v -- ClientID: %v", createApplicationResponse.ID, createApplicationResponse.Name, createApplicationResponse.Credentials.ClientID)
	return createApplicationResponse, nil
}

func SubcribeApplicationToPlan(orgID string, appID string, apiManagementContext string, productName string, version string, provisionInfo ProvisionInfo) (SubscribeAppResponse, error) {
	apiCall := fmt.Sprintf("https://%v/v1/portal/orgs/%v/apps/%v/subscriptions", END_POINT, orgID, appID)

	subscribeAppRequest := SubscribeAppRequest{
		Plan: "default",
	}
	subscribeAppRequest.Product.Name = productName
	subscribeAppRequest.Product.Version = version
	log.Printf("App ID: %v - Subcribe product name: %v -- version: %v", appID, productName, version)

	jsonSubscribeAppRequest, _ := json.Marshal(subscribeAppRequest)
	req, err := http.NewRequest("POST", apiCall, bytes.NewBuffer(jsonSubscribeAppRequest))
	//req.SetBasicAuth(provisionInfo.apiUser, provisionInfo.apiPwd)
	req.Header.Set("Authorization", provisionInfo.basicAuthKey)
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-IBM-APIManagement-Context", apiManagementContext)

	client := &http.Client{}
	response, err := client.Do(req)
	var subscribeAppResponse SubscribeAppResponse
	if err != nil {
		log.Fatal(err)
		return subscribeAppResponse, err
	} else {
		data, _ := ioutil.ReadAll(response.Body)
		if err := json.Unmarshal(data, &subscribeAppResponse); err != nil {
			return subscribeAppResponse, err
		}
	}
	log.Printf("Subscribe ID: %v", subscribeAppResponse.ID)
	return subscribeAppResponse, nil
}

func GetDevOrgs(apiManagementContext string, provisionInfo ProvisionInfo) (GetDevOrgResponse, error) {
	var devOrgResponse = GetDevOrgResponse{}
	apiCall := fmt.Sprintf("https://%v/v1/portal/orgs/", END_POINT)
	req, err := http.NewRequest("GET", apiCall, nil)
	//req.SetBasicAuth(provisionInfo.apiUser, provisionInfo.apiPwd)
	req.Header.Set("Authorization", provisionInfo.basicAuthKey)
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-IBM-APIManagement-Context", apiManagementContext)

	client := &http.Client{}
	response, err := client.Do(req)
	var responseObject []GetDevOrgResponse
	if err != nil {
		log.Fatal(err)
		return devOrgResponse, err
	} else {
		data, _ := ioutil.ReadAll(response.Body)
		if err := json.Unmarshal(data, &responseObject); err != nil {
			log.Fatal(err)
			return devOrgResponse, err
		}
	}
	for _, devOrg := range responseObject {
		if devOrg.Name == DEV_ORG_NAME {
			return devOrg, nil
		}
	}
	return devOrgResponse, nil
}

func GetApplications(orgID string, apiManagementContext string, provisionInfo ProvisionInfo) ([]CreateApplicationResponse, error) {
	var applicationResponse []CreateApplicationResponse

	apiCall := fmt.Sprintf("https://%v/v1/portal/orgs/%v/apps", END_POINT, orgID)

	req, err := http.NewRequest("GET", apiCall, nil)
	//req.SetBasicAuth(provisionInfo.apiUser, provisionInfo.apiPwd)
	req.Header.Set("Authorization", provisionInfo.basicAuthKey)
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-IBM-APIManagement-Context", apiManagementContext)

	client := &http.Client{}
	response, err := client.Do(req)
	if err != nil {
		log.Fatal(err)
		return applicationResponse, err
	} else {
		data, _ := ioutil.ReadAll(response.Body)
		if err := json.Unmarshal(data, &applicationResponse); err != nil {
			return applicationResponse, err
		}
	}
	return applicationResponse, nil
}

func IsSubscribedApp(orgID string, appID string, apiManagementContext string,
	productName string, version string, provisionInfo ProvisionInfo) (bool, error) {
	var subscribed bool = false
	apiCall := fmt.Sprintf("https://%v/v1/portal/orgs/%v/apps/%v/subscriptions", END_POINT, orgID, appID)

	req, err := http.NewRequest("GET", apiCall, nil)
	req.Header.Set("Authorization", provisionInfo.basicAuthKey)
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-IBM-APIManagement-Context", apiManagementContext)

	client := &http.Client{}
	response, err := client.Do(req)
	var subscribeAppResponse []SubscribeAppResponse
	if err != nil {
		log.Fatal(err)
		return subscribed, err
	} else {
		data, _ := ioutil.ReadAll(response.Body)
		if err := json.Unmarshal(data, &subscribeAppResponse); err != nil {
			return subscribed, err
		}
	}
	for _, subscribeApp := range subscribeAppResponse {
		if subscribeApp.Product.Name == productName && subscribeApp.Product.Version == version {
			subscribed = true
			break
		}
	}
	return subscribed, nil
}
