package main

import (
	"fmt"
	"io/ioutil"
	"log"

	yaml "gopkg.in/yaml.v2"
)

type Product struct {
	Product string `yaml:"product"`
	Info    struct {
		Name    string `yaml:"name"`
		Title   string `yaml:"title"`
		Version string `yaml:"version"`
	} `yaml:"info"`
	Visibility struct {
		View struct {
			Enabled bool          `yaml:"enabled"`
			Type    string        `yaml:"type"`
			Tags    []interface{} `yaml:"tags"`
			Orgs    []interface{} `yaml:"orgs"`
		} `yaml:"view"`
		Subscribe struct {
			Enabled bool          `yaml:"enabled"`
			Type    string        `yaml:"type"`
			Tags    []interface{} `yaml:"tags"`
			Orgs    []interface{} `yaml:"orgs"`
		} `yaml:"subscribe"`
	} `yaml:"visibility"`
	Apis struct {
		Template struct {
			Ref string `yaml:"$ref"`
		} `yaml:"template"`
	} `yaml:"apis"`
	Plans struct {
		Default struct {
			Title       string `yaml:"title"`
			Description string `yaml:"description"`
			Approval    bool   `yaml:"approval"`
			RateLimit   struct {
				HardLimit bool   `yaml:"hard-limit"`
				Value     string `yaml:"value"`
			} `yaml:"rate-limit"`
		} `yaml:"default"`
	} `yaml:"plans"`
}

func GenerateProductFile(templateFile string, spaceName string, version string) (string, error) {
	yamlFile, err := ioutil.ReadFile(templateFile)
	if err != nil {
		log.Printf("Could not read product template yaml file #%v ", err)
		return "", err
	}
	product := Product{}
	if err := yaml.Unmarshal([]byte(yamlFile), &product); err != nil {
		log.Printf("error parsing yaml file: %v", err)
		return "", err
	}
	product.Info.Title = spaceName
	productName := formatSpaces(spaceName)
	product.Info.Name = productName
	product.Info.Version = version

	product.Apis.Template.Ref = fmt.Sprintf("%v_%v.yaml", formatSpaces(spaceName), version)

	// write to new file
	fileContent, err := yaml.Marshal(product)
	outputFileName := fmt.Sprintf("%v_product_%v.yaml", formatSpaces(spaceName), version)
	err = ioutil.WriteFile(outputFileName, fileContent, 0644)
	if err != nil {
		log.Fatalf("error: %v", err)
		return "", err
	}
	log.Printf("%v was created successfully!", outputFileName)

	return outputFileName, nil
}
