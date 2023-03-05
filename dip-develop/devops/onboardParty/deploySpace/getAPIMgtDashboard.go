package main

import (
	"fmt"
	"strings"
)

func GetAPIMgtDashboard(provisionInfo ProvisionInfo) (map[string]string, error) {
	var apiMgtDashboardUrl = make(map[string]string)
	for userName, _ := range provisionInfo.users {
		if err := provisionInfo.provisioner.CallBluemixWithArgs("target -s", userName); err != nil {
			return apiMgtDashboardUrl, err
		}

		svcCall := fmt.Sprintf("cf service %v-apiconnect", removeSpaces(userName))
		out, err := provisionInfo.provisioner.CallBluemixWithArgsOutput(svcCall)
		if err != nil {
			return apiMgtDashboardUrl, err
		}
		for _, line := range strings.Split(string(out), "\n") {
			if line != "" && strings.HasPrefix(line, "Dashboard:") {
				dashboardUrl := fmt.Sprintf("https://%v", strings.Split(line, "https://")[1])
				apiMgtDashboardUrl[userName] = dashboardUrl
			}
		}
	}
	return apiMgtDashboardUrl, nil
}
