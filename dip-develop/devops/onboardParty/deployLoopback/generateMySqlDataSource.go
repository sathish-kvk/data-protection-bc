package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"strconv"
	"strings"
)

const MYSQL_CONNECTOR = "mysql"
const DATA_SOURCE_NAME = "dxc-dip-mysql"
const SCHEMA = "DIP"
const MY_SQL_USER = "admin"

type DataSource struct {
	Name      string `json:"name"`
	Host      string `json:"host"`
	Port      int    `json:"port"`
	Url       string `json:"url"`
	Database  string `json:"database"`
	Password  string `json:"password"`
	Connector string `json:"connector"`
	User      string `json:"user"`
}

func GenerateMySQLDatasource(userName string, provisionInfo ProvisionInfo) error {
	serviceEnvCall := fmt.Sprintf("cf env %v-Admin", removeSpaces(userName))
	out, err := provisionInfo.provisioner.CallCFWithArgsOutput(serviceEnvCall)
	if err != nil {
		return err
	}

	dataSource := GetMySQLCredentials(string(out))

	mapDataSource := make(map[string]DataSource)
	mapDataSource[dataSource.Name] = dataSource
	dataSourceJson, _ := json.MarshalIndent(mapDataSource, "", "  ")
	fmt.Println(string(dataSourceJson))

	err = ioutil.WriteFile(fmt.Sprintf("%v/template-loopback/server/datasources.json", provisionInfo.templateLbPath), dataSourceJson, 0644)
	if err != nil {
		return err
	}
	log.Println("Created mySQL datasources.json successfully")
	return nil
}

func GetMySQLCredentials(env string) DataSource {
	dataSource := DataSource{}
	for _, line := range strings.Split(env, "\n") {
		if line != "" && strings.Contains(line, `"uri":`) {
			hostPort := strings.Split(strings.Split(strings.Split(line, "@")[1], "/")[0], ":")

			host := hostPort[0]
			port := hostPort[1]

			password := strings.Split(strings.Split(line, "@")[0], "admin:")[1]

			dataSource.Connector = MYSQL_CONNECTOR
			dataSource.Name = DATA_SOURCE_NAME
			dataSource.Host = host
			dataSource.Port, _ = strconv.Atoi(port)
			dataSource.Database = SCHEMA
			dataSource.Url = fmt.Sprintf("mysql://admin:%v@%v:%v/%v", password, host, port, dataSource.Database)
			dataSource.User = MY_SQL_USER
			dataSource.Password = password
			break
		}
	}
	return dataSource
}
