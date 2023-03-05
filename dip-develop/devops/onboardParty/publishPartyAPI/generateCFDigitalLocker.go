package main

import (
	"fmt"
	"html/template"
	"io"
	"os"
)

type PartyAppCredential struct {
	PartyName          string
	ClientID           string
	ClientSecret       string
	FormateddPartyName string
	IsNew              bool
}

const DIGITAL_LOCKER_TEMPLATE_NAME = "digital-locker-service-catalogue-template.js"
const DIGITAL_LOCKER_NAME = "digital-locker.js"
const CF_DIGITAL_LOCKER_NAME = "digital-locker"
const DIGITAL_LOCKER_FOLDER = "digital-locker-service-catalogue"

type DigitalLockerDetails struct {
	PartyAppCredentials    []PartyAppCredential
	T                      *template.Template
	DigitalLockerTemplate  string
	Writer                 io.Writer
	ProvisionInfo          ProvisionInfo
	OutputDir              string
	DIPServiceCatalogSpace string
}

func (m *DigitalLockerDetails) WriteManifestToBuffer() error {
	return m.T.ExecuteTemplate(m.Writer, DIGITAL_LOCKER_TEMPLATE_NAME, m)
}

func GenerateCFDigitalLocker(m *DigitalLockerDetails) error {
	file, err := os.Create(m.OutputDir + "/" + DIGITAL_LOCKER_NAME)
	if err != nil {
		return err
	}
	defer file.Close()

	m.T = template.Must(template.New("digital-locker-service-catalogue-template").ParseFiles(m.DigitalLockerTemplate))

	m.Writer = file

	if err := m.WriteManifestToBuffer(); err != nil {
		return err
	}
	//Zip files
	files := []string{m.OutputDir + "/" + DIGITAL_LOCKER_NAME, m.OutputDir + "/" + "package.json"}

	if err := ZipFiles("digital-locker.zip", files); err != nil {
		return err
	}

	// Deploy to Cloud Function to Party's space
	if err := m.ProvisionInfo.provisioner.CallCFWithArgs("target -s", m.DIPServiceCatalogSpace); err != nil {
		return err
	}
	call := fmt.Sprintf("wsk action update %v --kind nodejs:6 %v", CF_DIGITAL_LOCKER_NAME, "digital-locker.zip")

	if err := m.ProvisionInfo.provisioner.CallCFWithArgs(call); err != nil {
		return err
	}

	return nil
}
