package main

import (
	"fmt"
	"io"
	"os"
	"text/template"
)

type DigitalLockerDetail struct {
	PartyName            string
	MySQLApiPath         string
	MySQLClientID        string
	MySQLClientSecret    string
	CloudantApiPath      string
	CloudantClientID     string
	CloudantClientSecret string
	CFPath               string
	ApiKey               string
	PrivateKey           string
	PublicKey            string
}

const DIGITAL_LOCKER_TEMPLATE_NAME = "digital-locker-template.js"
const DIGITAL_LOCKER_NAME = "digital-locker.js"
const CF_DIGITAL_LOCKER_NAME = "digital-locker"
const DIGITAL_LOCKER_FOLDER = "digital-locker"

type DigitalLockerInfo struct {
	DigitalLockerDetail   DigitalLockerDetail
	T                     *template.Template
	DigitalLockerTemplate string
	Writer                io.Writer
	ProvisionInfo         ProvisionInfo
	OutputDir             string
}

func (m *DigitalLockerInfo) WriteToBuffer() error {
	return m.T.ExecuteTemplate(m.Writer, DIGITAL_LOCKER_TEMPLATE_NAME, m.DigitalLockerDetail)
}

func GenerateCFDigitalLocker(m *DigitalLockerInfo) error {
	file, err := os.Create(m.OutputDir + "/" + DIGITAL_LOCKER_NAME)
	if err != nil {
		return err
	}
	defer file.Close()

	m.T = template.Must(template.New("digital-locker-template").ParseFiles(m.DigitalLockerTemplate))

	m.Writer = file

	if err := m.WriteToBuffer(); err != nil {
		return err
	}
	//Zip files
	files := []string{m.OutputDir + "/" + DIGITAL_LOCKER_NAME, m.OutputDir + "/" + "package.json"}

	if err := ZipFiles("digital-locker.zip", files); err != nil {
		return err
	}

	// Deploy to Cloud Function to Party's space
	if err := m.ProvisionInfo.provisioner.CallCFWithArgs("target -s", m.DigitalLockerDetail.PartyName); err != nil {
		return err
	}
	call := fmt.Sprintf("wsk action update %v/%v --kind nodejs:6 %v", DEFAULT_PACKAGE, CF_DIGITAL_LOCKER_NAME, "digital-locker.zip")

	if err := m.ProvisionInfo.provisioner.CallCFWithArgs(call); err != nil {
		return err
	}
	return nil
}
