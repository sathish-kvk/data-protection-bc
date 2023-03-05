package main

import (
	"fmt"
	"path"
	"path/filepath"
)

type CloudFunctionInfo struct {
	Actions       Actions
	Triggers      Triggers
	ProvisionInfo ProvisionInfo
}

func ProvisionCloudFunctions(c *CloudFunctionInfo) error {

	packages := make(map[string]string)

	// Get actions
	// actions, err := GetActionsFromFile(provisionInfo.cloudFunctionPath)
	// if err != nil {
	// 	log.Fatal(err)
	// }
	for _, actionConfig := range c.Actions {
		packages[actionConfig.Package] = actionConfig.Package
	}
	// Provision packages
	if err := ProvisionPackages(packages, c.ProvisionInfo); err != nil {
		return err
	}
	// Provision Cloud Functions
	if err := ProvisionActions(c.Actions, c.ProvisionInfo); err != nil {
		return err
	}

	// Get Trigers configuration
	// triggers, err := GetTriggersFromFile(provisionInfo.cloudFunctionPath)
	// if err != nil {
	// 	log.Fatal(err)
	// }
	if err := ProvisionTriggers(c.Triggers, c.ProvisionInfo); err != nil {
		return err
	}

	return nil
}

func ProvisionPackages(packages map[string]string, provisionInfo ProvisionInfo) error {
	for packageName, _ := range packages {
		call := fmt.Sprintf("wsk package update %v", packageName)
		if err := provisionInfo.provisioner.CallBluemixWithArgs(call); err != nil {
			return err
		}
	}
	return nil
}

func ProvisionActions(actions Actions, provisionInfo ProvisionInfo) error {
	for actionName, actionConfig := range actions {
		filePath := path.Join(provisionInfo.workspace, actionConfig.File)
		// format path slash to work cross OS
		file := filepath.FromSlash(filePath)
		var call string
		extension := path.Ext(file)
		if extension == ".zip" {
			call = fmt.Sprintf("wsk action update %v/%v --kind nodejs:6 %v", actionConfig.Package, actionName, file)
		} else {
			call = fmt.Sprintf("wsk action update %v/%v %v", actionConfig.Package, actionName, file)
		}

		if err := provisionInfo.provisioner.CallBluemixWithArgs(call); err != nil {
			return err
		}
	}
	return nil
}

func ProvisionTriggers(triggers Triggers, provisionInfo ProvisionInfo) error {
	for triggerName, triggerConfig := range triggers {
		// Create trigger
		call := fmt.Sprintf("wsk trigger update %v", triggerName)
		if err := provisionInfo.provisioner.CallBluemixWithArgs(call); err != nil {
			call := fmt.Sprintf("wsk trigger create %v", triggerName)
			if err := provisionInfo.provisioner.CallBluemixWithArgs(call); err != nil {
				return err
			}
		}
		// loop rule
		for _, rule := range triggerConfig.Rules {
			call := fmt.Sprintf("wsk rule update %v %v %v", rule.Name, triggerName, rule.Action)
			if err := provisionInfo.provisioner.CallBluemixWithArgs(call); err != nil {
				return err
			}
		}
	}
	return nil
}
