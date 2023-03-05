package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
)

type Orgs []struct {
	ID                         string `json:"id"`
	Name                       string `json:"name"`
	DisplayName                string `json:"displayName"`
	OrgType                    string `json:"orgType"`
	Status                     string `json:"status"`
	AdvPortalOverride          bool   `json:"advPortalOverride"`
	ExtUaaAuthenticated        bool   `json:"extUaaAuthenticated"`
	RequiresSSLClientCertCheck bool   `json:"requiresSSLClientCertCheck"`
	Dormant                    bool   `json:"dormant"`
	URL                        string `json:"url"`
	ExternalOrgID              string `json:"externalOrgId"`
	ExternalInviteOverride     string `json:"externalInviteOverride"`
	ExternalSpaceID            string `json:"externalSpaceId"`
	ExternalNativeOrgID        string `json:"externalNativeOrgId"`
}

type Environments []struct {
	ID        string `json:"id"`
	OrgID     string `json:"orgId"`
	Name      string `json:"name"`
	ShortName string `json:"shortName"`
	Owner     struct {
		ID        string `json:"id"`
		Username  string `json:"username"`
		Context   string `json:"context"`
		IdpID     string `json:"idpId"`
		Email     string `json:"email"`
		FirstName string `json:"firstName"`
		LastName  string `json:"lastName"`
		Status    string `json:"status"`
		URL       string `json:"url"`
	} `json:"owner"`
	APICenter    bool   `json:"apiCenter"`
	PortalType   string `json:"portalType"`
	PortalURL    string `json:"portalUrl"`
	AdvPortalURL string `json:"advPortalUrl"`
	GatewayType  string `json:"gatewayType"`
	GwServices   []struct {
		ID          string `json:"id"`
		EndpointURL string `json:"endpointUrl"`
	} `json:"gwServices"`
	Idp                  string   `json:"idp"`
	Idps                 []string `json:"idps"`
	AvailableRoles       []string `json:"availableRoles"`
	Default              bool     `json:"default"`
	AutoDeploy           bool     `json:"autoDeploy"`
	RestrictedDeployment bool     `json:"restrictedDeployment"`
	InvitationEnabled    bool     `json:"invitationEnabled"`
	SelfSignUpEnabled    bool     `json:"selfSignUpEnabled"`
	SpaceEnabled         bool     `json:"spaceEnabled"`
	SpaceIds             []string `json:"spaceIds"`
	TestAppEnabled       bool     `json:"testAppEnabled"`
	TestAppCredentials   struct {
		ClientID     string `json:"clientId"`
		ClientSecret string `json:"clientSecret"`
	} `json:"testAppCredentials,omitempty"`
	CreatedAt                               string        `json:"createdAt"`
	UpdatedAt                               string        `json:"updatedAt"`
	CreatedBy                               string        `json:"createdBy"`
	UpdatedBy                               string        `json:"updatedBy"`
	URL                                     string        `json:"url"`
	ApplicationLifecycleEnabled             bool          `json:"applicationLifecycleEnabled"`
	ProductDeploymentApprovalRequiredStates []interface{} `json:"productDeploymentApprovalRequiredStates"`
}

type Registries []struct {
	URL        string   `json:"url"`
	ID         string   `json:"id"`
	CreatedAt  string   `json:"createdAt"`
	UpdatedAt  string   `json:"updatedAt"`
	CreatedBy  string   `json:"createdBy"`
	UpdatedBy  string   `json:"updatedBy"`
	Name       string   `json:"name"`
	Type       string   `json:"type"`
	Scope      []string `json:"scope"`
	Writable   bool     `json:"writable"`
	Title      string   `json:"title"`
	SamlConfig struct {
		SignerCertificate string `json:"signerCertificate"`
	} `json:"samlConfig,omitempty"`
	CaseSensitive bool   `json:"caseSensitive"`
	OrgID         string `json:"orgId,omitempty"`
	EnvID         string `json:"envId,omitempty"`
}

type EnvironmentIncludeSpace struct {
	ID        string `json:"id"`
	OrgID     string `json:"orgId"`
	Name      string `json:"name"`
	ShortName string `json:"shortName"`
	Owner     struct {
		ID            string `json:"id"`
		Username      string `json:"username"`
		Context       string `json:"context"`
		IdpID         string `json:"idpId"`
		Email         string `json:"email"`
		FirstName     string `json:"firstName"`
		LastName      string `json:"lastName"`
		Status        string `json:"status"`
		LastLoginTime string `json:"lastLoginTime"`
		URL           string `json:"url"`
	} `json:"owner"`
	APICenter    bool   `json:"apiCenter"`
	PortalType   string `json:"portalType"`
	PortalURL    string `json:"portalUrl"`
	AdvPortalURL string `json:"advPortalUrl"`
	GatewayType  string `json:"gatewayType"`
	GwServices   []struct {
		ID          string `json:"id"`
		EndpointURL string `json:"endpointUrl"`
	} `json:"gwServices"`
	Idp                                     string        `json:"idp"`
	Idps                                    []string      `json:"idps"`
	AvailableRoles                          []string      `json:"availableRoles"`
	Default                                 bool          `json:"default"`
	AutoDeploy                              bool          `json:"autoDeploy"`
	RestrictedDeployment                    bool          `json:"restrictedDeployment"`
	InvitationEnabled                       bool          `json:"invitationEnabled"`
	SelfSignUpEnabled                       bool          `json:"selfSignUpEnabled"`
	SpaceEnabled                            bool          `json:"spaceEnabled"`
	SpaceIds                                []string      `json:"spaceIds"`
	Spaces                                  []interface{} `json:"spaces"`
	TestAppEnabled                          bool          `json:"testAppEnabled"`
	CreatedAt                               string        `json:"createdAt"`
	UpdatedAt                               string        `json:"updatedAt"`
	CreatedBy                               string        `json:"createdBy"`
	UpdatedBy                               string        `json:"updatedBy"`
	URL                                     string        `json:"url"`
	ApplicationLifecycleEnabled             bool          `json:"applicationLifecycleEnabled"`
	ProductDeploymentApprovalRequiredStates []interface{} `json:"productDeploymentApprovalRequiredStates"`
}

func GetOrgNameUrl(newSpaces []string, provisionInfo ProvisionInfo) ([]NewSpaceInfo, error) {
	var newSpaceInfos []NewSpaceInfo
	orgsResponse, err := GetOrgs(provisionInfo)
	if err != nil {
		return newSpaceInfos, err
	}
	//Get the org
	for _, newSpace := range newSpaces {
		newSpaceInfo := NewSpaceInfo{
			Name: newSpace,
		}
		for _, orgRes := range orgsResponse {
			if orgRes.DisplayName == fmt.Sprintf("%v (%v)", provisionInfo.org, newSpace) {
				// Get the latest org url
				newSpaceInfo.Organization = orgRes.Name
			}
		}
		newSpaceInfos = append(newSpaceInfos, newSpaceInfo)
	}
	return newSpaceInfos, nil
}

func GetOrgs(provisionInfo ProvisionInfo) (Orgs, error) {
	var orgsResponse Orgs

	apiCall := fmt.Sprintf("https://%v/v1/me/orgs", END_POINT)

	req, err := http.NewRequest("GET", apiCall, nil)
	req.Header.Set("Authorization", provisionInfo.basicAuthKey)
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	response, err := client.Do(req)
	if err != nil {
		return orgsResponse, err
	} else {
		data, _ := ioutil.ReadAll(response.Body)
		if err := json.Unmarshal(data, &orgsResponse); err != nil {
			return orgsResponse, err
		}
	}
	return orgsResponse, nil
}

func GetOrgId(organization string, provisionInfo ProvisionInfo) (string, error) {
	orgID := ""
	orgsResponse, err := GetOrgs(provisionInfo)
	if err != nil {
		return orgID, err
	}
	//Get the org ID
	for _, orgRes := range orgsResponse {
		if orgRes.Name == organization {
			orgID = orgRes.ID
			break
		}
	}
	return orgID, nil
}

func GetCatalogId(orgID string, catalogName string, provisionInfo ProvisionInfo) (string, error) {
	catalogID := ""
	var environmentResponse Environments

	apiCall := fmt.Sprintf("https://%v/v1/orgs/%v/environments", END_POINT, orgID)

	req, err := http.NewRequest("GET", apiCall, nil)
	req.Header.Set("Authorization", provisionInfo.basicAuthKey)
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	response, err := client.Do(req)
	if err != nil {
		return "", err
	} else {
		data, _ := ioutil.ReadAll(response.Body)
		if err := json.Unmarshal(data, &environmentResponse); err != nil {
			return catalogID, err
		}
	}

	//Get the Catalog ID
	for _, env := range environmentResponse {
		if env.ShortName == catalogName {
			catalogID = env.ID
			break
		}
	}
	return catalogID, nil
}

func GetIBMId(orgID string, catalogId string, provisionInfo ProvisionInfo) (string, error) {
	IBMID := ""
	var registriesResponse Registries

	apiCall := fmt.Sprintf("https://%v/v1/orgs/%v/registries?catalog=%v&scope=portal", END_POINT, orgID, catalogId)

	req, err := http.NewRequest("GET", apiCall, nil)
	req.Header.Set("Authorization", provisionInfo.basicAuthKey)
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	response, err := client.Do(req)
	if err != nil {
		return "", err
	} else {
		data, _ := ioutil.ReadAll(response.Body)
		if err := json.Unmarshal(data, &registriesResponse); err != nil {
			return IBMID, err
		}
	}

	//Get the IBM ID
	for _, registry := range registriesResponse {
		if registry.Title == "IBM ID" {
			IBMID = registry.ID
			break
		}
	}
	return IBMID, nil
}

func GetEnvironmentIncludeSpace(orgID string, catalogId string, provisionInfo ProvisionInfo) (EnvironmentIncludeSpace, error) {

	var environmentIncludeSpaceResponse EnvironmentIncludeSpace

	apiCall := fmt.Sprintf("https://%v/v1/orgs/%v/environments/%v?includeSpaces=true", END_POINT, orgID, catalogId)

	req, err := http.NewRequest("GET", apiCall, nil)
	req.Header.Set("Authorization", provisionInfo.basicAuthKey)
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	response, err := client.Do(req)
	if err != nil {
		return environmentIncludeSpaceResponse, err
	} else {
		data, _ := ioutil.ReadAll(response.Body)
		if err := json.Unmarshal(data, &environmentIncludeSpaceResponse); err != nil {
			return environmentIncludeSpaceResponse, err
		}
	}
	return environmentIncludeSpaceResponse, nil
}

func UpdateCatalogUserRegistry(orgID string, catalogId string, environment EnvironmentIncludeSpace, provisionInfo ProvisionInfo) error {
	apiCall := fmt.Sprintf("https://%v/v1/orgs/%v/environments/%v?includeSpaces=true", END_POINT, orgID, catalogId)

	jsonUpdateCatalogReqeust, _ := json.Marshal(environment)
	req, err := http.NewRequest("PUT", apiCall, bytes.NewBuffer(jsonUpdateCatalogReqeust))
	req.Header.Set("Authorization", provisionInfo.basicAuthKey)
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	response, err := client.Do(req)
	if err != nil {
		return err
	} else {
		_, err := ioutil.ReadAll(response.Body)
		if err != nil {
			return err
		}
	}
	return nil
}

func UpdateUserRegistry(organization string, provisionInfo ProvisionInfo) error {
	// Get org ID
	orgId, err := GetOrgId(organization, provisionInfo)
	if err != nil {
		return err
	}
	log.Printf("Org ID: %v", orgId)

	catalogId, err := GetCatalogId(orgId, CATALOG_NAME, provisionInfo)
	if err != nil {
		return err
	}
	log.Printf("Catalog ID: %v", catalogId)
	ibmId, err := GetIBMId(orgId, catalogId, provisionInfo)
	if err != nil {
		return err
	}
	log.Printf("IBM ID: %v", ibmId)
	updatedEnvironment, err := GetEnvironmentIncludeSpace(orgId, catalogId, provisionInfo)
	if err != nil {
		return err
	}
	log.Printf("Environment Name: %v", updatedEnvironment.Name)
	updatedEnvironment.Idp = ibmId
	updatedEnvironment.Idps = []string{ibmId}

	err = UpdateCatalogUserRegistry(orgId, catalogId, updatedEnvironment, provisionInfo)

	if err != nil {
		return err
	}

	return nil
}
