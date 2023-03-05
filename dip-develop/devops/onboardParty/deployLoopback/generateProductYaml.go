package main

import (
	"fmt"
	"io/ioutil"
	"log"

	yaml "gopkg.in/yaml.v2"
)

type IbmConfig struct {
	Testable bool `yaml:"testable"`
	Enforced bool `yaml:"enforced"`
	Cors     struct {
		Enabled bool `yaml:"enabled"`
	} `yaml:"cors"`
	Catalogs map[string]Catalog `yaml:"catalogs"`
	Assembly struct {
		Execute []struct {
			Invoke struct {
				TargetURL  string `yaml:"target-url"`
				TLSProfile string `yaml:"tls-profile"`
			} `yaml:"invoke"`
		} `yaml:"execute"`
	} `yaml:"assembly"`
	Properties struct {
		RuntimeURL struct {
			Value       string `yaml:"value"`
			Description string `yaml:"description"`
			Encoded     bool   `yaml:"encoded"`
		} `yaml:"runtime-url"`
		InvokeTLSProfile struct {
			Value       string `yaml:"value"`
			Description string `yaml:"description"`
			Encoded     bool   `yaml:"encoded"`
		} `yaml:"invoke-tls-profile"`
	} `yaml:"properties"`
}

type Catalog struct {
	Properties Properties `yaml:"properties"`
}

type Properties struct {
	InvokeTlsProfile string `yaml:"invoke-tls-profile,omitempty"`
	RuntimeUrl       string `yaml:"runtime-url"`
}

func GenerateProductYaml(userName string, loopbackYamlFile string, targetUrl string, provisionInfo ProvisionInfo) error {
	yamlFile, err := ioutil.ReadFile(fmt.Sprintf("%v/%v", provisionInfo.templateLbPath, loopbackYamlFile))
	if err != nil {
		log.Printf("Could not read product yaml file #%v ", err)
		return err
	}
	m := make(map[string]interface{})
	if uerr := yaml.Unmarshal([]byte(yamlFile), &m); uerr != nil {
		log.Printf("error parsing yaml file: %v", uerr)
		return uerr
	}
	orginalIbmConfig := m["x-ibm-configuration"]
	//convert to yaml
	d, err := yaml.Marshal(orginalIbmConfig)
	if err != nil {
		log.Fatalf("error: %v", err)
		return err
	}
	//convert to object
	ibmConfig := IbmConfig{}

	if err := yaml.Unmarshal([]byte(string(d)), &ibmConfig); err != nil {
		fmt.Println(err.Error())
		return err
	}
	//fmt.Printf("--- ibmConfig: %v\n\n", ibmConfig.Enforced)

	//New catalog value
	newCategory := Catalog{
		Properties: Properties{
			RuntimeUrl:       targetUrl,
			InvokeTlsProfile: "client:Loopback-client",
		},
	}
	//categoryName := strings.ToLower(fmt.Sprintf("%v-LB-Prod", removeSpaces(userName)))
	categoryName := CATALOG_NAME
	ibmConfig.Catalogs[categoryName] = newCategory
	//convert to yaml
	d, err = yaml.Marshal(ibmConfig)
	if err != nil {
		log.Fatalf("error: %v", err)
		return err
	}
	//update yaml file & convert to yaml
	m["x-ibm-configuration"] = ibmConfig
	d, err = yaml.Marshal(m)
	if err != nil {
		log.Fatalf("error: %v", err)
		return err
	}
	err = ioutil.WriteFile(fmt.Sprintf("%v/%v", provisionInfo.templateLbPath, loopbackYamlFile), d, 0644)
	if err != nil {
		log.Fatalf("error: %v", err)
		return err
	}
	log.Println("Update yaml file successfuly!")
	return nil
}
