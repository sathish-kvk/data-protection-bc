package main

import (
	"fmt"
	"log"
	"strconv"
	"strings"
)

const EXPECTEDERROR = "exit status 1"
const CATALOG_NAME = "prod"
const DIP_SERVICE_CATALOGUE = "DIP-Service-Catalogue"
const API_ORG = "dxc-digital-innovation-platform-dip-service-catalogue"

type Provisioner interface {
	CallApicWithArgs(args ...string) error
	CallApicWithArgsOutput(args ...string) ([]byte, error)
	CallCFWithArgs(args ...string) error
	CallCFWithArgsOutput(args ...string) ([]byte, error)
}

type ProvisionInfo struct {
	users             Users
	org               string
	server            string
	cloudFunctionPath string
	basicAuthKey      string
	workspace         string
	apiTemplate       string
	updateAPIOnly     string
	newVersion        string
	emailTemplatePath string
	sendGridAPIKey    string
	mailTo            string
	provisioner       Provisioner
}

type NewSpaceInfo struct {
	Name         string
	Organization string
}

func addQuotes(name string) string {
	return `"` + name + `"`
}

func removeSpaces(name string) string {
	return strings.Replace(name, " ", "", -1)
}

func formatSpaces(name string) string {
	return strings.Replace(strings.ToLower(name), " ", "-", -1)
}

func Provision(provisionInfo ProvisionInfo) error {
	// Horizontal pipeline - Deploy cloud functions
	return ProvisionHorizontal(provisionInfo)
}

func ProvisionHorizontal(provisionInfo ProvisionInfo) error {

	// Install openwhisk CLI
	if err := provisionInfo.provisioner.CallCFWithArgs("plugin install Cloud-Functions -r Bluemix -f"); err != nil {
		return err
	}

	var newParties []string

	if strings.ToLower(provisionInfo.updateAPIOnly) == "false" {
		// Find new parties which will be needed to create API
		for partyName, _ := range provisionInfo.users {
			//TODO
			//partyName = "DXCV"
			version, err := GetProductVersion(partyName, provisionInfo)
			if err != nil {
				return err
			}
			if version == "" {
				log.Printf("There is no product name: %v", partyName)
				newParties = append(newParties, partyName)
			}
		}
	} else {
		// will update APIs for all parties in parties.json
		for partyName, _ := range provisionInfo.users {
			newParties = append(newParties, partyName)
		}
	}

	if err := ProvisionPartiesAPI(provisionInfo, newParties); err != nil {
		return err
	}

	if strings.ToLower(provisionInfo.updateAPIOnly) == "false" {
		//subcribe API & also update the digital-locker function
		if err := SubscribeAPIs(provisionInfo, API_ORG, CATALOG_NAME, newParties); err != nil {
			return err
		}
	}
	return nil
}

func ProvisionPartiesAPI(provisionInfo ProvisionInfo, parties []string) error {
	if err := provisionInfo.provisioner.CallCFWithArgs("target -s", DIP_SERVICE_CATALOGUE); err != nil {
		return err
	}

	// Pull API template
	pullCall := fmt.Sprintf("drafts:pull %v --type product --organization %v --server %v",
		formatSpaces(provisionInfo.apiTemplate),
		API_ORG,
		provisionInfo.server)
	if err := provisionInfo.provisioner.CallApicWithArgs(pullCall); err != nil {
		return err
	}

	apiTemplateVersion, err := GetAPIVersion(provisionInfo.apiTemplate, provisionInfo)

	apiTemplate := fmt.Sprintf("%v_%v.yaml", formatSpaces(provisionInfo.apiTemplate), apiTemplateVersion)
	productTemplate := fmt.Sprintf("%v_product_%v.yaml", formatSpaces(provisionInfo.apiTemplate), apiTemplateVersion)

	log.Printf("API template file: %v", apiTemplate)
	log.Printf("Product template file: %v", productTemplate)

	newVersion := "1.0.0"

	// Get API Keys
	apiKeys, err := GetCloudFunctionApiKey(provisionInfo, parties)
	if err != nil {
		return err
	}

	for _, partyName := range parties {
		apiKey := apiKeys[partyName]
		userName := strings.Split(apiKey, ":")[0]
		password := strings.Split(apiKey, ":")[1]

		// Check if product was published if yes, get the current version
		oldVersion, err := GetAPIVersion(partyName, provisionInfo)
		if err != nil {
			return err
		}
		log.Printf("%v -- current version: %v", partyName, oldVersion)
		if oldVersion != "" {
			minorVersion, err := strconv.Atoi(strings.Split(oldVersion, ".")[2])
			if err != nil {
				return err
			}
			minorVersion = minorVersion + 1
			newVersion = fmt.Sprintf("%v.%v.%v", strings.Split(oldVersion, ".")[0], strings.Split(oldVersion, ".")[1], minorVersion)
		}
		//Fixed new version for all APIs
		if provisionInfo.newVersion != "0.0.0" {
			newVersion = provisionInfo.newVersion
		}
		log.Printf("%v -- new version: %v", partyName, newVersion)

		productFileName, err := GenerateProductFile(productTemplate, partyName, newVersion)
		if err != nil {
			return nil
		}
		apiFileName, err := GenerateAPIYamlFromTemplate(apiTemplate, partyName, newVersion, userName, password)
		if err != nil {
			return err
		}

		if err := Push(productFileName, apiFileName, partyName, oldVersion, newVersion, provisionInfo); err != nil {
			return err
		}
		if err := Publish(partyName, provisionInfo); err != nil {
			return err
		}
		if oldVersion != "" {
			if err := Replace(partyName, oldVersion, newVersion, provisionInfo); err != nil {
				return err
			}
		}
	}
	return nil
}

func Push(productFileName string, apiFileName string, partyName string, oldVersion string, newVersion string, provisionInfo ProvisionInfo) error {
	apiName := formatSpaces(partyName)
	if oldVersion != "" {
		// update API
		call := fmt.Sprintf("drafts:push %v -r %v:%v -o %v -s %v", apiFileName, apiName, oldVersion, API_ORG, provisionInfo.server)
		if err := provisionInfo.provisioner.CallApicWithArgs(call); err != nil {
			return err
		}
		// update product
		call = fmt.Sprintf("drafts:push %v -r %v:%v --product-only -o %v -s %v", productFileName, apiName, oldVersion, API_ORG, provisionInfo.server)
		if err := provisionInfo.provisioner.CallApicWithArgs(call); err != nil {
			return err
		}
	} else {
		// push product and its api
		call := fmt.Sprintf("drafts:push %v -o %v -s %v", productFileName, API_ORG, provisionInfo.server)
		if err := provisionInfo.provisioner.CallApicWithArgs(call); err != nil {
			return err
		}
	}
	return nil
}

func Publish(partyName string, provisionInfo ProvisionInfo) error {
	apiName := formatSpaces(partyName)
	call := fmt.Sprintf("drafts:publish %v --catalog %v -o %v -s %v", apiName, CATALOG_NAME, API_ORG, provisionInfo.server)
	if err := provisionInfo.provisioner.CallApicWithArgs(call); err != nil {
		return err
	}
	return nil
}

func Replace(partyName string, oldVersion string, newVersion string, provisionInfo ProvisionInfo) error {
	apiName := formatSpaces(partyName)
	call := fmt.Sprintf("products:replace %v:%v %v:%v --plans default:default -c %v -o %v -s %v",
		apiName, oldVersion,
		apiName, newVersion,
		CATALOG_NAME,
		API_ORG,
		provisionInfo.server)
	if err := provisionInfo.provisioner.CallApicWithArgs(call); err != nil {
		return err
	}
	// delete the old version
	call = fmt.Sprintf("products:delete %v:%v -c %v -o %v -s %v",
		apiName, oldVersion,
		CATALOG_NAME,
		API_ORG,
		provisionInfo.server)
	if err := provisionInfo.provisioner.CallApicWithArgs(call); err != nil {
		return err
	}

	return nil
}

func GetAPIVersion(spaceName string, provisionInfo ProvisionInfo) (string, error) {
	version := ""

	apiName := formatSpaces(spaceName)
	call := fmt.Sprintf("drafts:get %v -o %v -s %v", apiName, API_ORG, provisionInfo.server)

	out, err := provisionInfo.provisioner.CallApicWithArgsOutput(call)
	if err != nil {
		return version, err
	}
	for _, line := range strings.Split(string(out), "\n") {
		if line != "" && strings.Contains(line, "version:") {
			version = strings.TrimSpace(strings.Split(line, "version:")[1])
			break
		}
	}
	return version, nil
}

func GetCloudFunctionApiKey(provisionInfo ProvisionInfo, parties []string) (map[string]string, error) {
	var apiKeys = make(map[string]string)
	for _, userName := range parties {
		if err := provisionInfo.provisioner.CallCFWithArgs("target -s", userName); err != nil {
			return apiKeys, err
		}
		out, err := provisionInfo.provisioner.CallCFWithArgsOutput("wsk property get --auth")
		if err != nil {
			return apiKeys, err
		}
		for _, line := range strings.Split(string(out), "\n") {
			if line != "" {
				apiKey := strings.TrimSpace(strings.Split(line, "auth")[1])
				apiKeys[userName] = apiKey
			}
		}
	}
	return apiKeys, nil
}

func GetProductVersion(partyName string, provisionInfo ProvisionInfo) (string, error) {
	var version string = ""
	apiName := formatSpaces(partyName)
	call := fmt.Sprintf("products:get %v -c %v -o %v -s %v", apiName, CATALOG_NAME, API_ORG, provisionInfo.server)
	out, err := provisionInfo.provisioner.CallApicWithArgsOutput(call)
	if err != nil && err.Error() != EXPECTEDERROR {
		return version, err
	}

	for _, line := range strings.Split(string(out), "\n") {
		if line != "" && strings.Contains(line, "version:") {
			version = strings.TrimSpace(strings.Split(line, "version:")[1])
			break
		}
	}

	return version, nil
}
