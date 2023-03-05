package main

func DeleteDBAdminApp(provisionInfo ProvisionInfo) error {
	for userName, _ := range provisionInfo.users {
		if err := provisionInfo.provisioner.CallBluemixWithArgs("target -s", userName); err != nil {
			return err
		}
		if err := provisionInfo.provisioner.CallBluemixWithArgs("cf delete -r -f", removeSpaces(userName)+"-admin"); err != nil {
			return err
		}
	}
	return nil
}
