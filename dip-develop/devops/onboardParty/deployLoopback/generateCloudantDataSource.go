package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"strings"
)

const CLOUDANT_CONNECTOR = "cloudant"
const CLOUDANT_DATA_SOURCE_NAME = "cloudant-datasource"
const CLOUDAT_SCHEMA = "dip"
const MODEL_INDEX = "loopback_model_name"

type CloudantDataSource struct {
	Name       string `json:"name"`
	Url        string `json:"url"`
	Database   string `json:"database"`
	Password   string `json:"password"`
	Connector  string `json:"connector"`
	User       string `json:"username"`
	ModelIndex string `json:"modelIndex"`
}

func GenerateCloudantDatasource(userName string, provisionInfo ProvisionInfo) error {

	serviceEnvCall := fmt.Sprintf("cf env %v-Admin", removeSpaces(userName))
	out, err := provisionInfo.provisioner.CallCFWithArgsOutput(serviceEnvCall)
	if err != nil {
		return err
	}

	cloudantDataSource := GetCloudantCredentials(string(out))

	mapCloudantDataSource := make(map[string]CloudantDataSource)
	mapCloudantDataSource[cloudantDataSource.Name] = cloudantDataSource
	cloudantDataSourceJson, _ := json.MarshalIndent(mapCloudantDataSource, "", "  ")
	fmt.Println(string(cloudantDataSourceJson))

	err = ioutil.WriteFile(fmt.Sprintf("%v/%v/server/datasources.json", provisionInfo.templateLbPath, CLOUDANT_LOOPBACK_PROJECT_FOLDER), cloudantDataSourceJson, 0644)
	if err != nil {
		return err
	}
	log.Println("Created cloudant datasources.json successfully")
	return nil
}

func GetCloudantCredentials(env string) CloudantDataSource {
	cloudantDataSource := CloudantDataSource{}
	for _, line := range strings.Split(env, "\n") {
		if line != "" && strings.Contains(line, `"url":`) {
			userAndPassword := strings.Split(strings.Split(line, "@")[0], "//")[1]
			cloudantDataSource.Connector = CLOUDANT_CONNECTOR
			cloudantDataSource.Name = CLOUDANT_DATA_SOURCE_NAME
			cloudantDataSource.Database = CLOUDAT_SCHEMA
			cloudantDataSource.User = strings.Split(userAndPassword, ":")[0]
			cloudantDataSource.Password = strings.Split(userAndPassword, ":")[1]
			cloudantDataSource.Url = fmt.Sprintf("https://%v:%v@%v.cloudant.com", cloudantDataSource.User, cloudantDataSource.Password, cloudantDataSource.User)
			cloudantDataSource.ModelIndex = MODEL_INDEX

			break
		}
	}
	return cloudantDataSource
}
