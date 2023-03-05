package main

import (
	"fmt"
	"strings"
)

const EXPECTEDERROR = "exit status 1"
const RESOURCE_NO_EXIST_ERROR = "exit status 148"
const PACKAGE_NAME = "common-ow"

func DeleteSpace(provisionInfo ProvisionInfo) error {
	// Install openwhisk CLI
	if err := provisionInfo.provisioner.CallBluemixWithArgs("plugin install Cloud-Functions -r Bluemix -f"); err != nil {
		return err
	}
	// Target specified org
	err := provisionInfo.provisioner.CallBluemixWithArgs("target -o", provisionInfo.org)
	if err != nil {
		return err
	}
	// delete core CFs, we will delete all CFs in common-ow package
	for _, spaceName := range provisionInfo.parties {
		err := provisionInfo.provisioner.CallBluemixWithArgs("target -s", spaceName)
		if err != nil {
			// there is no space created
			if err.Error() != EXPECTEDERROR {
				return err
			}
		} else {
			if err := DeleteFunctions("trigger", spaceName, provisionInfo); err != nil {
				return err
			}
			// Get all existing Actions
			if err := DeleteFunctions("action", spaceName, provisionInfo); err != nil {
				return err
			}

			// delete API Connect Instance
			out, _ := provisionInfo.provisioner.CallBluemixWithArgsOutput("service list")
			for _, line := range strings.Split(string(out), "\n") {
				if line != "" && strings.Contains(line, "APIConnect") {
					apiConnectInstanceName := strings.TrimSpace(strings.Split(line, "APIConnect")[0])
					if err := provisionInfo.provisioner.CallBluemixWithArgs("service delete -f", apiConnectInstanceName); err != nil {
						if err.Error() != EXPECTEDERROR {
							return err
						}
					}
				}
			}

			//delete space
			call := fmt.Sprintf("cf delete-space %v -o %v -f", spaceName, provisionInfo.org)
			if err := provisionInfo.provisioner.CallBluemixWithArgs(call); err != nil {
				if err.Error() != EXPECTEDERROR {
					return err
				}
			}
		}
	}
	return nil
}

/*
action will be "action" or "trigger"
*/
func DeleteFunctions(action string, spaceName string, provisionInfo ProvisionInfo) error {
	valid := true
	for valid {
		call := fmt.Sprintf("wsk %v list -l 200", action)
		out, err := provisionInfo.provisioner.CallBluemixWithArgsOutput(call)
		count := 0
		if err != nil {
			return err
		}
		for _, line := range strings.Split(string(out), "\n") {
			if line != "" && strings.HasPrefix(line, "/") {
				count = count + 1
				nameWithStatus := strings.Split(line, fmt.Sprintf("_%v/", spaceName))[1]
				name := strings.TrimSpace(strings.Split(nameWithStatus, "private")[0])
				call := fmt.Sprintf("wsk %v delete %v", action, name)
				if err := provisionInfo.provisioner.CallBluemixWithArgs(call); err != nil {
					if err.Error() != RESOURCE_NO_EXIST_ERROR {
						return err
					}
				}
			}
		}
		if len(strings.Split(string(out), "\n")) == 1 || count < 200 {
			valid = false
		}
	}
	return nil
}
