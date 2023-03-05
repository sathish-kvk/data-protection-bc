package main

import (
	"fmt"
	"strings"
)

const CF_NOT_AVAILABLE = "exit status 148"

func GetExistingAppCredential(clientId string, provisionInfo ProvisionInfo) (AppCredential, error) {
	var appCredential = AppCredential{}
	//
	call := fmt.Sprintf("wsk action invoke digital-locker --blocking --result -p clientId %v", clientId)
	out, err := provisionInfo.provisioner.CallCFWithArgsOutput(call)
	if err != nil {
		if err.Error() != CF_NOT_AVAILABLE {
			return appCredential, err
		} else {
			return appCredential, nil
		}
	}
	var clientSecret string = ""
	//"client_secret": "wP6xU2tO6dT0aW1tQ4xT5nY3hU8lD8gF3xP8eQ7qW0uI5sJ3jQ",
	for _, line := range strings.Split(string(out), "\n") {
		if line != "" && strings.Contains(line, "client_secret") {
			clientSecretTrim := strings.TrimSpace(strings.Split(line, ":")[1])
			clientSecret = clientSecretTrim[1 : len(clientSecretTrim)-2]
			break
		}
	}
	appCredential.ClientID = clientId
	appCredential.ClientSecret = clientSecret

	return appCredential, nil
}
