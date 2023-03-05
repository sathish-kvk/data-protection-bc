package main

import (
	"fmt"
	"log"
	"os"
	"strings"
)

const MYSQL = "MYSQL"
const CLOUNDANT = "CLOUDANT"

type LoopBackAppInfo struct {
	AppName       string
	Type          string
	ProjectFolder string
	YamlFileName  string
}

const MYSQL_LOOPBACK_YAML_FILE = "dxc-dip-loopback"
const MYSQL_LOOPBACK_PROJECT_FOLDER = "template-loopback"

//template-cloudant-loopback/definitions/template-cloudant-loopback.yaml
const CLOUDANT_LOOPBACK_YAML_FILE = "template-cloudant-loopback"
const CLOUDANT_LOOPBACK_PROJECT_FOLDER = "template-cloudant-loopback"

func ProvisionLoopbackAPIs(provisionInfo ProvisionInfo, newSpaceInfos []NewSpaceInfo) error {
	for _, newSpaceInfo := range newSpaceInfos {
		if err := provisionInfo.provisioner.CallCFWithArgs("target -s", newSpaceInfo.Name); err != nil {
			return err
		}
		log.Printf("%v --- %v", newSpaceInfo.Name, newSpaceInfo.Organization)
		organization := newSpaceInfo.Organization
		//create catalog
		catalogDisplayName := fmt.Sprintf("%v-LB-Prod", removeSpaces(newSpaceInfo.Name))
		// due to the max length of catalog name is 30 characters.
		// So we need to use the static catalog name
		catalogName := CATALOG_NAME
		serviceCall := fmt.Sprintf("catalogs:create %v --name %v --organization %v -s %v", catalogDisplayName, catalogName, organization, provisionInfo.server)
		err := provisionInfo.provisioner.CallApicWithArgs(serviceCall)
		if err != nil {
			if err.Error() != EXPECTEDERROR {
				return err
			}
		} else {
			// update Portal User Registry to IBM ID
			err = UpdateUserRegistry(organization, provisionInfo)
			if err != nil {
				return err
			}
			log.Println("Updated portal user registry to IBM ID successfully!")
		}
		// Get My SQL Credentials & publish MySQL Loopback API
		userConfig := provisionInfo.users[newSpaceInfo.Name]
		if userConfig.Database != nil && userConfig.Type != "Innovator" {
			mySQLLoopBackAppInfo := LoopBackAppInfo{
				AppName:       fmt.Sprintf("%v-loopback-mySQL", removeSpaces(newSpaceInfo.Name)),
				Type:          MYSQL,
				ProjectFolder: MYSQL_LOOPBACK_PROJECT_FOLDER,
				YamlFileName:  MYSQL_LOOPBACK_YAML_FILE,
			}
			if err := provisionLoopBackAPI(newSpaceInfo.Name, mySQLLoopBackAppInfo, provisionInfo, organization, catalogName); err != nil {
				if err.Error() != EXPECTEDERROR {
					return err
				}
			}
		}
		//publish cloudant loopback API
		cloudantLoopBackAppInfo := LoopBackAppInfo{
			AppName:       fmt.Sprintf("%v-loopback-cloudant", removeSpaces(newSpaceInfo.Name)),
			Type:          CLOUNDANT,
			ProjectFolder: CLOUDANT_LOOPBACK_PROJECT_FOLDER,
			YamlFileName:  CLOUDANT_LOOPBACK_YAML_FILE,
		}
		// Publish loopback API
		if err := provisionLoopBackAPI(newSpaceInfo.Name, cloudantLoopBackAppInfo, provisionInfo, organization, catalogName); err != nil {
			if err.Error() != EXPECTEDERROR {
				return err
			}
		}
	}

	return nil
}

func provisionLoopBackAPI(userName string, loopBackAppInfo LoopBackAppInfo, provisionInfo ProvisionInfo, organization string, catalogName string) error {
	log.Printf("Provision loopback for %v", loopBackAppInfo.Type)

	if loopBackAppInfo.Type == MYSQL {
		if err := GenerateMySQLDatasource(userName, provisionInfo); err != nil {
			return err
		}
	} else if loopBackAppInfo.Type == CLOUNDANT {
		if err := GenerateCloudantDatasource(userName, provisionInfo); err != nil {
			return err
		}
	}

	// move to loopback app folder
	loopBackFolder := fmt.Sprintf("%v/%v", provisionInfo.templateLbPath, loopBackAppInfo.ProjectFolder)
	if err := os.Chdir(loopBackFolder); err != nil {
		return err
	}
	// Create loopback app using apic app:publish
	setApp := fmt.Sprintf("config:set app=apic-app://%v/orgs/%v/apps/%v", provisionInfo.server, organization, strings.ToLower(loopBackAppInfo.AppName))
	if err := provisionInfo.provisioner.CallApicWithArgs(setApp); err != nil {
		return err
	}
	//call publish
	out, err := provisionInfo.provisioner.CallApicWithArgsOutput("apps:publish")
	if err != nil {
		return err
	}
	var targetUrl string
	for _, line := range strings.Split(string(out), "\n") {
		if line != "" && strings.Contains(line, `API target urls:`) {
			url := strings.TrimSpace(strings.Split(line, "urls:")[1])
			targetUrl = fmt.Sprintf("https://%v", url)
			break
		}
	}
	log.Printf("API Target Urls: %v", targetUrl)
	// // Create Loopback App using cf push (just temporary solution)
	// //loopbackAppName := fmt.Sprintf("%v-loopback-mySQL", removeSpaces(userName))
	// createLoopbackAppCall := fmt.Sprintf("cf push %v -m 512M", loopBackAppInfo.AppName)
	// log.Println(createLoopbackAppCall)

	// if err := provisionInfo.provisioner.CallCFWithArgs(createLoopbackAppCall); err != nil {
	// 	if err.Error() != EXPECTEDERROR {
	// 		return err
	// 	}
	// }
	//back to root folder
	if err := os.Chdir(provisionInfo.workspace); err != nil {
		return err
	}
	// Target URL
	//targetUrl := fmt.Sprintf("https://%v.eu-gb.mybluemix.net", strings.ToLower(loopBackAppInfo.AppName))
	loopBackYamlFile := fmt.Sprintf("%v/definitions/%v.yaml", loopBackAppInfo.ProjectFolder, loopBackAppInfo.YamlFileName)
	if err := GenerateProductYaml(userName, loopBackYamlFile, targetUrl, provisionInfo); err != nil {
		return err
	}
	// Publish API to product
	productYamlFilePath := fmt.Sprintf("%v/%v/definitions/%v-product.yaml", provisionInfo.templateLbPath, loopBackAppInfo.ProjectFolder, loopBackAppInfo.YamlFileName)
	publishProductToCatalog := fmt.Sprintf("publish %v --catalog %v --organization %v --server %v", productYamlFilePath, strings.ToLower(catalogName), organization, provisionInfo.server)
	if err := provisionInfo.provisioner.CallApicWithArgs(publishProductToCatalog); err != nil {
		if err.Error() != EXPECTEDERROR {
			return err
		}
	}

	return nil
}
