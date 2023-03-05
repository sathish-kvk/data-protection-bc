package main

import "strings"

func GetCloudFunctionApiKey(provisionInfo ProvisionInfo) (map[string]string, error) {
	var apiKeys = make(map[string]string)
	for userName, _ := range provisionInfo.users {
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
