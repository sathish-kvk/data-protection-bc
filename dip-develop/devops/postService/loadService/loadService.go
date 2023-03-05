package main

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
)

const EXPECTEDERROR = "exit status 1"
const RESOURCE_NO_EXIST_ERROR = "exit status 148"
const TEST_SERVICE_APP_NAME = "testservice"
const NEW_ACTIONS_FILE = "newActions.json"
const MOCHA_REPORTER = "mocha-simple-html-reporter"
const MOCHAR_RPT_OUTPUT = "test-report.html"

func removeSpaces(name string) string {
	return strings.Replace(name, " ", "", -1)
}

func LoadService(provisionInfo ProvisionInfo) error {
	// Install openwhisk CLI
	if err := provisionInfo.provisioner.CallBluemixWithArgs("plugin install Cloud-Functions -r Bluemix -f"); err != nil {
		return err
	}
	// Target specified org
	err := provisionInfo.provisioner.CallBluemixWithArgs("target -o", provisionInfo.org)
	if err != nil {
		return err
	}

	// Publish testservice
	if err := PublishTestService(provisionInfo); err != nil {
		return err
	}

	for spaceName, actions := range provisionInfo.deploymentFunctions {
		log.Printf("Innovator space name: %v", spaceName)
		err := provisionInfo.provisioner.CallBluemixWithArgs("target -s", spaceName)
		if err != nil {
			return err
		}
		var newActions []*ActionFileConfig

		// Check for new action
		for _, action := range actions {
			call := fmt.Sprintf("wsk action get %v", action.ActionName)
			if err := provisionInfo.provisioner.CallBluemixWithArgs(call); err != nil {
				newActions = append(newActions, action)
			}
		}
		// Provision new action
		for _, action := range newActions {
			err := ProvisionAction(action, provisionInfo)
			if err != nil {
				return err
			}
			// update end point url
			actionFile := filepath.Base(action.ActionFile)
			actionFileWithoutExt := strings.Split(actionFile, ".")[0]
			endPoint := fmt.Sprintf("%v?innovator=%v&folder=%v&action=%v", provisionInfo.testServiceHost, spaceName, filepath.Base(action.BasePath), actionFileWithoutExt)
			action.EndPoint = endPoint
		}
		/*
			//Write new actions to file so that we can read in later step to send email notification
			actionsJson, _ := json.MarshalIndent(newActions, "", "  ")
			//fmt.Println(string(actionsJson))
			err = ioutil.WriteFile(NEW_ACTIONS_FILE, actionsJson, 0644)
			if err != nil {
				return err
			}
		*/
		// Prepare for Mocha Tests - only run tests for new actions
		// Copy all test files of new actions and test for all service to a new folder
		for _, action := range newActions {
			testFolderSrc := fmt.Sprintf("%v/%v", action.BasePath, "test")
			testFolderDest := fmt.Sprintf("%v/%v/%v/%v", provisionInfo.innovatorPath, spaceName, "test", action.ActionName)
			os.MkdirAll(testFolderDest, os.ModePerm)
			err := Copy(testFolderSrc, testFolderDest)
			if err != nil {
				log.Fatal(err)
			}
		}
		// Copy all test files in dip/commonTests to innovator/<innovatorSpace>/test folder
		commonTestFolderSrc := "commonTests"
		commonTestFolderDest := fmt.Sprintf("%v/%v/%v/%v", provisionInfo.innovatorPath, spaceName, "test", "commonTests")
		os.MkdirAll(commonTestFolderDest, os.ModePerm)
		err = Copy(commonTestFolderSrc, commonTestFolderDest)
		if err != nil {
			log.Fatal(err)
		}

		// Run mocha test
		hasTestError := false
		call := fmt.Sprintf("innovator/%v/test --recursive --reporter %v --reporter-options output=%v", spaceName, MOCHA_REPORTER, MOCHAR_RPT_OUTPUT)
		if err := provisionInfo.provisioner.CallMochaWithArgs(call); err != nil {
			hasTestError = true
			if err.Error() != EXPECTEDERROR {
				return err
			}
		}
		// Send email notification for each new actions
		for _, action := range newActions {
			// delete all new action if any test fail
			if hasTestError {
				call := fmt.Sprintf("wsk action delete %v", action.ActionName)
				if err := provisionInfo.provisioner.CallBluemixWithArgs(call); err != nil {
					if err.Error() != RESOURCE_NO_EXIST_ERROR {
						return err
					}
				}
			}
			// Set Innovator Name space
			action.Innovator = spaceName
			if err := SendEmailForNewAction(action, provisionInfo, hasTestError); err != nil {
				return err
			}
		}
	}

	return nil
}

func PublishTestService(provisionInfo ProvisionInfo) error {
	err := provisionInfo.provisioner.CallBluemixWithArgs("target -s", provisionInfo.spaceToDeployTestService)
	if err != nil {
		return err
	}
	//move to TestService folder
	if err := os.Chdir(provisionInfo.testServiceWebPath); err != nil {
		return err
	}
	if err := provisionInfo.provisioner.CallBluemixWithArgs("cf push"); err != nil {
		if err.Error() != EXPECTEDERROR {
			return err
		}
	}
	//back to root folder
	if err := os.Chdir(provisionInfo.workspace); err != nil {
		return err
	}
	return nil
}

func ProvisionAction(action *ActionFileConfig, provisionInfo ProvisionInfo) error {
	file := filepath.Join(action.BasePath, action.ActionFile)
	call := fmt.Sprintf("wsk action update %v %v", action.ActionName, file)
	if err := provisionInfo.provisioner.CallBluemixWithArgs(call); err != nil {
		return err
	}
	return nil
}
