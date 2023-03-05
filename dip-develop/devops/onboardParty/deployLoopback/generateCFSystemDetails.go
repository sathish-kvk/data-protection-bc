package main

import (
	"fmt"
	"html/template"
	"io"
	"os"
)

type PartySysDetail struct {
	PartyName string
	ApiKey    string
}

const GET_TARGETSYSTEM_DETAILS_TEMPLATE_NAME = "get-targetsystem-details-template.js"
const GET_TARGETSYSTEM_DETAILS_NAME = "get-targetsystem-details.js"
const DEFAULT_PACKAGE = "common-ow"
const CF_GET_TARGETSYSTEM_DETAILS_NAME = "get-targetsystem-details"
const GET_TARGETSYSTEM_DETAILS_FOLDER = "get-targetsystem-details"

type TargetSystemDetails struct {
	PartySysDetails            []PartySysDetail
	T                          *template.Template
	TargetSystemDetailTemplate string
	Writer                     io.Writer
	ProvisionInfo              ProvisionInfo
	OutputDir                  string
}

func (m *TargetSystemDetails) WriteManifestToBuffer() error {
	return m.T.ExecuteTemplate(m.Writer, GET_TARGETSYSTEM_DETAILS_TEMPLATE_NAME, m)
}

func GenerateCFSystemDetails(m *TargetSystemDetails) error {
	file, err := os.Create(m.OutputDir + "/" + GET_TARGETSYSTEM_DETAILS_NAME)
	if err != nil {
		return err
	}
	defer file.Close()

	m.T = template.Must(template.New("get-targetsystem-details-template").ParseFiles(m.TargetSystemDetailTemplate))

	m.Writer = file

	if err := m.WriteManifestToBuffer(); err != nil {
		return err
	}
	//Zip files
	files := []string{m.OutputDir + "/" + GET_TARGETSYSTEM_DETAILS_NAME, m.OutputDir + "/" + "package.json"}

	if err := ZipFiles("get-targetsystem-details.zip", files); err != nil {
		return err
	}

	// Deploy to Cloud Function to Party's space
	for _, partyDetail := range m.PartySysDetails {
		if err := m.ProvisionInfo.provisioner.CallCFWithArgs("target -s", partyDetail.PartyName); err != nil {
			return err
		}
		call := fmt.Sprintf("wsk action update %v/%v --kind nodejs:6 %v", DEFAULT_PACKAGE, CF_GET_TARGETSYSTEM_DETAILS_NAME, "get-targetsystem-details.zip")

		if err := m.ProvisionInfo.provisioner.CallCFWithArgs(call); err != nil {
			return err
		}
	}

	return nil
}
