package main

import (
	"fmt"
	"log"
	"os"
	"strings"
)

const (
	MYSQLDB = "compose-for-mysql"
	DB2DB   = "db2oncloud"
)
const DEFAULT_PACKAGE = "common-ow"
const CF_DIGITAL_LOCKER_NAME = "digital-locker"
const DUPPLICATE_ERROR = "exit status 246"

type Provisioner interface {
	CallBluemixWithArgs(args ...string) error
	CallBluemixWithArgsOutput(args ...string) ([]byte, error)
}

type ProvisionInfo struct {
	users                 Users
	deploymentFunctions   map[string]*ActionFileConfig
	org                   string
	coreCloudFunctionPath string
	workspace             string
	provisioner           Provisioner
}

func addQuotes(name string) string {
	return `"` + name + `"`
}

func removeSpaces(name string) string {
	return strings.Replace(name, " ", "", -1)
}

func Provision(provisionInfo ProvisionInfo) error {
	// Install openwhisk CLI
	if err := provisionInfo.provisioner.CallBluemixWithArgs("plugin install Cloud-Functions -r Bluemix -f"); err != nil {
		return err
	}
	// Target specified org
	err := provisionInfo.provisioner.CallBluemixWithArgs("target -o", provisionInfo.org)
	if err != nil {
		return err
	}
	var newSpaces []string
	for userName, _ := range provisionInfo.users {
		err := provisionInfo.provisioner.CallBluemixWithArgs("target -s", userName)
		if err != nil {
			// there is no space created
			if err.Error() == EXPECTEDERROR {
				newSpaces = append(newSpaces, userName)
			} else {
				return err
			}
		} else {
			// -----------Get new spaces -------------------------------------
			//Check to verify the new created party space
			// if there is "digital-locker" available or not
			call := fmt.Sprintf("wsk action get %v/%v", DEFAULT_PACKAGE, CF_DIGITAL_LOCKER_NAME)
			if err := provisionInfo.provisioner.CallBluemixWithArgs(call); err != nil {
				newSpaces = append(newSpaces, userName)
			}
			// ----------- END get new spaces -------------------------------------
		}
	}

	if len(newSpaces) > 0 {

		// Vertical pipeline step - create space, create cloudant
		if err := ProvisionVertical(provisionInfo, newSpaces); err != nil {
			return err
		}

		// Horizontal pipeline - Deploy cloud functions
		if err := ProvisionHorizontal(provisionInfo, newSpaces); err != nil {
			return err
		}

		// Update new parties to the existing space (Party table)
		for userName, _ := range provisionInfo.users {
			if IsExistingSpace(userName, newSpaces) {
				if err := AddNewSpacesToParty(userName, newSpaces, provisionInfo); err != nil {
					if err.Error() != DUPPLICATE_ERROR {
						return err
					}
				}
			}
		}

		// Push db admin app in each new space
		//Change directory to manifest one
		if err := os.Chdir(*pDatabaseAdminDir); err != nil {
			return err
		}
		if err := PushDbAdminApp(provisionInfo, newSpaces); err != nil {
			return err
		}

	} else {
		log.Println("There is no new space created")
	}

	return nil
}

func ProvisionVertical(provisionInfo ProvisionInfo, newSpaces []string) error {

	// Vertical pipeline
	for _, userName := range newSpaces {

		err := provisionInfo.provisioner.CallBluemixWithArgs("cf create-space", userName)
		if err != nil {
			return err
		}

		if err = provisionInfo.provisioner.CallBluemixWithArgs("target -s", userName); err != nil {
			return err
		}

		if err = provisionInfo.provisioner.CallBluemixWithArgs("service create cloudantNoSQLDB Lite", removeSpaces(userName)+"-cloudant"); err != nil {
			return err
		}
		userConfig := provisionInfo.users[userName]
		if userConfig.Database != nil && userConfig.Type != "Innovator" {
			serviceCall := fmt.Sprintf("service create %v %v %v-%v", userConfig.Database.Name, userConfig.Database.Plan, removeSpaces(userName), userConfig.Database.Name)
			if err = provisionInfo.provisioner.CallBluemixWithArgs(serviceCall); err != nil {
				return err
			}
		}

		if err = provisionInfo.provisioner.CallBluemixWithArgs("service create APIConnect Lite", removeSpaces(userName)+"-apiconnect"); err != nil {
			return err
		}
	}
	return nil
}

func ProvisionHorizontal(provisionInfo ProvisionInfo, newSpaces []string) error {

	//var prevSpace string
	// Get actions
	actions, err := GetActionsFromFile(provisionInfo.coreCloudFunctionPath)
	if err != nil {
		log.Fatal(err)
	}
	// Get Trigers configuration
	triggers, err := GetTriggersFromFile(provisionInfo.coreCloudFunctionPath)
	if err != nil {
		log.Fatal(err)
	}
	cloudFunctionInfo := &CloudFunctionInfo{
		Actions:       actions,
		Triggers:      triggers,
		ProvisionInfo: provisionInfo,
	}

	for _, userName := range newSpaces {
		/*
			userConfig := provisionInfo.users[userName]
			for path, actionConfig := range provisionInfo.deploymentFunctions {

				if actionConfig.PublishToAll() || actionConfig.PublishToUser(userName) || actionConfig.PublishToType(userConfig.Type) {

					if userName != prevSpace {
						err := provisionInfo.provisioner.CallBluemixWithArgs("target -s", userName)
						if err != nil {
							return err
						}
						prevSpace = userName
					}

					call := fmt.Sprintf("wsk action update %v %v/%v", actionConfig.ActionName, path, actionConfig.ActionFile)

					if err := provisionInfo.provisioner.CallBluemixWithArgs(call); err != nil {
						return err
					}
				}
			}
		*/
		// Provision core Cloud Functions
		err := provisionInfo.provisioner.CallBluemixWithArgs("target -s", userName)
		if err != nil {
			return err
		}
		if err := ProvisionCloudFunctions(cloudFunctionInfo); err != nil {
			return err
		}
	}
	return nil
}

func IsExistingSpace(spaceName string, newSpaces []string) bool {
	for _, newSpace := range newSpaces {
		if newSpace == spaceName {
			return false
		}
	}
	return true
}

func AddNewSpacesToParty(spaceName string, newSpaces []string, provisionInfo ProvisionInfo) error {
	err := provisionInfo.provisioner.CallBluemixWithArgs("target -s", spaceName)
	if err != nil {
		return err
	}
	for _, newSpace := range newSpaces {
		userConfig := provisionInfo.users[newSpace]
		params := fmt.Sprintf("-p partyID \"%v\" -p partyName \"%v\" -p partyRole \"%v\"", userConfig.Uuid, newSpace, userConfig.Type)
		call := fmt.Sprintf("wsk action invoke common-ow/insertParty --blocking --result %v", params)
		if err := provisionInfo.provisioner.CallBluemixWithArgs(call); err != nil {
			return err
		}
	}
	return nil
}
