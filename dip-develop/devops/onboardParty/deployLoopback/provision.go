package main

import (
	"fmt"
	"log"
	"strings"
)

const EXPECTEDERROR = "exit status 1"
const CATALOG_NAME = "lb-prod"

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
	basicAuthKey      string
	templateLbPath    string
	workspace         string
	cloudFunctionPath string
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
	return strings.Replace(name, " ", "-", -1)
}

func Provision(provisionInfo ProvisionInfo) error {
	// Horizontal pipeline - Deploy cloud functions
	return ProvisionHorizontal(provisionInfo)
}

func ProvisionHorizontal(provisionInfo ProvisionInfo) error {
	var apiKeys = make(map[string]string)
	var newSpaces []string
	//userConfig
	for userName, _ := range provisionInfo.users {
		if err := provisionInfo.provisioner.CallCFWithArgs("target -s", userName); err != nil {
			return err
		}
		//Get API KEY for all spaces
		out, err := provisionInfo.provisioner.CallCFWithArgsOutput("wsk property get --auth")
		if err != nil {
			return err
		}
		for _, line := range strings.Split(string(out), "\n") {
			if line != "" {
				apiKey := strings.TrimSpace(strings.Split(line, "auth")[1])
				apiKeys[userName] = apiKey
			}
		}
		// -----------Get new spaces -------------------------------------
		//Check to verify the new created party space
		// if there is "digital-locker" available or not
		call := fmt.Sprintf("wsk action get %v/%v", DEFAULT_PACKAGE, CF_DIGITAL_LOCKER_NAME)
		if err := provisionInfo.provisioner.CallCFWithArgs(call); err != nil {
			newSpaces = append(newSpaces, userName)
		}
		// ----------- END get new spaces -------------------------------------
	}
	if len(newSpaces) > 0 {
		newSpaceInfos, err := GetOrgNameUrl(newSpaces, provisionInfo)
		if err != nil {
			return err
		}
		// deploy loopback apps for NEW spaces ONLY
		if err := ProvisionLoopbackAPIs(provisionInfo, newSpaceInfos); err != nil {
			log.Fatalln(err)
			return err
		}

		// ---------------------------- Publish Loopback API ---------------------------------
		// just public loopback API & generate RSA key for new space only
		if err := PublishLoopBackAPIs(provisionInfo, newSpaceInfos, apiKeys); err != nil {
			log.Fatalln(err)
			return err
		}
		// Re-generate get-targetsystem-details
		// for all parties in the parties.json
		var partySysDetails []PartySysDetail
		for userName, apiKey := range apiKeys {
			partySysDetail := PartySysDetail{}
			partySysDetail.PartyName = strings.ToLower(userName)
			partySysDetail.ApiKey = apiKey
			partySysDetails = append(partySysDetails, partySysDetail)
		}

		targetSystemDetails := &TargetSystemDetails{
			PartySysDetails:            partySysDetails,
			TargetSystemDetailTemplate: fmt.Sprintf("%v/actions/%v", *pCloudFunctionPath, GET_TARGETSYSTEM_DETAILS_TEMPLATE_NAME),
			OutputDir:                  fmt.Sprintf("%v/actions/%v", *pCloudFunctionPath, GET_TARGETSYSTEM_DETAILS_FOLDER),
			ProvisionInfo:              provisionInfo,
		}
		if err := GenerateCFSystemDetails(targetSystemDetails); err != nil {
			log.Fatal(err)
			return err
		}

	} else {
		log.Println("There is no new party which was added to parties.json.")
	}
	// ----------------------------End Publish Loopback API ---------------------------------
	return nil
}
