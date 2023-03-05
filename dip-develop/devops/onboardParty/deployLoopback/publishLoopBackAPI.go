package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strings"
)

const APP_CONTEXT = "X-IBM-APIManagement-Context"
const DEV_ORG_NAME = "InternaldevOrg"
const END_POINT = "eu.apiconnect.ibmcloud.com"
const MYSQL_PRODUCT_NAME = "mysql-loopback"
const CLOUDANT_PRODUCT_NAME = "cloudant-loopback"
const VERSION = "1.0.0"
const LB_API_MYSQL_APP_NAME = "LB-API-MYSQL-App"
const LB_API_COULDANT_APP_NAME = "LB-API-Cloudant-App"

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

func PublishLoopBackAPIs(provisionInfo ProvisionInfo, newSpaceInfos []NewSpaceInfo, apiKeys map[string]string) error {
	var appCredentials = make(map[string]map[string]AppCredential)
	for _, newSpaceInfo := range newSpaceInfos {
		organization := newSpaceInfo.Organization
		log.Printf("Org: %v", organization)
		appCredential, err := PublishLoopBackAPI(provisionInfo, organization, CATALOG_NAME)
		if err != nil {
			return err
		}
		appCredentials[newSpaceInfo.Name] = appCredential
	}
	for _, newSpaceInfo := range newSpaceInfos {
		log.Println(newSpaceInfo.Name)
		privateKey, publicKey, err := GenerateRSAKey()
		if err != nil {
			return err
		}
		appCredential := appCredentials[newSpaceInfo.Name]
		digitalLockerDetail := DigitalLockerDetail{
			PartyName:  newSpaceInfo.Name,
			ApiKey:     apiKeys[newSpaceInfo.Name],
			CFPath:     fmt.Sprintf("%v_%v", *pOrg, newSpaceInfo.Name),
			PrivateKey: privateKey,
			PublicKey:  publicKey,
		}
		for appName, credential := range appCredential {
			log.Printf("App Name: %v", appName)
			log.Printf("Client ID: %v", "***********")
			log.Printf("ClientSecret: %v", "***********")

			if appName == LB_API_MYSQL_APP_NAME {
				digitalLockerDetail.MySQLApiPath = strings.ToLower(fmt.Sprintf("%v/%v/api", newSpaceInfo.Organization, CATALOG_NAME))
				digitalLockerDetail.MySQLClientID = credential.ClientID
				digitalLockerDetail.MySQLClientSecret = credential.ClientSecret
			} else {
				digitalLockerDetail.CloudantApiPath = strings.ToLower(fmt.Sprintf("%v/%v/api/cloudant", newSpaceInfo.Organization, CATALOG_NAME))
				digitalLockerDetail.CloudantClientID = credential.ClientID
				digitalLockerDetail.CloudantClientSecret = credential.ClientSecret
			}
		}
		digitalLockerInfo := &DigitalLockerInfo{
			DigitalLockerDetail:   digitalLockerDetail,
			DigitalLockerTemplate: fmt.Sprintf("%v/actions/%v", *pCloudFunctionPath, DIGITAL_LOCKER_TEMPLATE_NAME),
			OutputDir:             fmt.Sprintf("%v/actions/%v", *pCloudFunctionPath, DIGITAL_LOCKER_FOLDER),
			ProvisionInfo:         provisionInfo,
		}
		if err = GenerateCFDigitalLocker(digitalLockerInfo); err != nil {
			return err
		}
	}
	return nil
}

func PublishLoopBackAPI(provisionInfo ProvisionInfo, organization string, catalogName string) (map[string]AppCredential, error) {
	var appCredentials = make(map[string]AppCredential)
	apiManagementContext := fmt.Sprintf("%v.%v", organization, catalogName)
	log.Printf("X-IBM-APIManagement-Context: %v", apiManagementContext)
	// return if the dev org is already existed
	devOrg, err := GetDevOrgs(apiManagementContext, provisionInfo)
	if err != nil {
		return appCredentials, err
	}
	var orgID string

	if devOrg.ID != "" {
		log.Printf("The developer org has been created in %v", apiManagementContext)
		apps, err := GetApplications(devOrg.ID, apiManagementContext, provisionInfo)
		if err != nil {
			return appCredentials, err
		}
		for _, app := range apps {
			if app.Name == LB_API_MYSQL_APP_NAME {
				// Reset client secret
				log.Println("Reset secret for my sql app")
				appUrl := app.AppCredentials[0].URL
				appCredential, err := ResetClientSecret(appUrl, apiManagementContext, provisionInfo)
				if err != nil {
					return appCredentials, err
				}
				mysqlCredential := AppCredential{
					ClientID:     appCredential.ClientID,
					ClientSecret: appCredential.ClientSecret,
				}
				appCredentials[LB_API_MYSQL_APP_NAME] = mysqlCredential
			}
			if app.Name == LB_API_COULDANT_APP_NAME {
				// Reset client secret
				log.Println("Reset secret for cloudant app")
				appUrl := app.AppCredentials[0].URL
				appCredential, err := ResetClientSecret(appUrl, apiManagementContext, provisionInfo)
				if err != nil {
					return appCredentials, err
				}
				cloudantCredential := AppCredential{
					ClientID:     appCredential.ClientID,
					ClientSecret: appCredential.ClientSecret,
				}
				appCredentials[LB_API_COULDANT_APP_NAME] = cloudantCredential
			}
		}
	} else {
		// Create Developer Org
		createDevOrgRes, err := CreateDeveloperOrg(apiManagementContext, provisionInfo)
		if err != nil {
			return appCredentials, err
		}
		orgID = createDevOrgRes.Id
	}
	// Check if the app for sql and cloudant has been created or not. if not, will create
	_, hasmySQLApp := appCredentials[LB_API_MYSQL_APP_NAME]
	if hasmySQLApp == false {
		// Create Dev App & subscribe plan for MYSQL LB
		mySQLAppCredential, err := CreateAppAndSubscribePlan(orgID, LB_API_MYSQL_APP_NAME, MYSQL_PRODUCT_NAME, VERSION, apiManagementContext, provisionInfo)
		if err != nil {
			return appCredentials, err
		}
		appCredentials[LB_API_MYSQL_APP_NAME] = mySQLAppCredential
	}
	_, hasCloudantApp := appCredentials[LB_API_COULDANT_APP_NAME]
	if hasCloudantApp == false {
		myCloudantAppCredential, err := CreateAppAndSubscribePlan(orgID, LB_API_COULDANT_APP_NAME, CLOUDANT_PRODUCT_NAME, VERSION, apiManagementContext, provisionInfo)
		if err != nil {
			return appCredentials, err
		}
		appCredentials[LB_API_COULDANT_APP_NAME] = myCloudantAppCredential
	}
	return appCredentials, nil
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
		Description:      "This is internal loopback API app",
		OauthRedirectURI: "",
		Public:           1,
	}
	createAppRequest.Credentials.ClientID = "true"
	createAppRequest.Credentials.ClientSecret = "true"
	createAppRequest.Credentials.Description = "LB app credentials"

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
	log.Printf("App ID: %v --- Name: %v", createApplicationResponse.ID, createApplicationResponse.Name)
	return createApplicationResponse, nil
}

func SubcribeApplicationToPlan(orgID string, appID string, apiManagementContext string, productName string, version string, provisionInfo ProvisionInfo) (SubscribeAppResponse, error) {
	apiCall := fmt.Sprintf("https://%v/v1/portal/orgs/%v/apps/%v/subscriptions", END_POINT, orgID, appID)

	subscribeAppRequest := SubscribeAppRequest{
		Plan: "default",
	}
	subscribeAppRequest.Product.Name = productName
	subscribeAppRequest.Product.Version = version

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
