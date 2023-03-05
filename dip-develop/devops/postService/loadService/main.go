package main

import (
	"flag"
	"log"
	"os"
	"path/filepath"
	"strings"
)

var pOrg *string
var pInnovatorPath *string
var pTestServiceWebPath *string
var pEmailTemplatePath *string
var pTestServiceHost *string
var pSendGridAPIKey *string
var pSpaceToDeployTestService *string

var functionsToDeploy map[string][]*ActionFileConfig

type Provisioner interface {
	CallBluemixWithArgs(args ...string) error
	CallBluemixWithArgsOutput(args ...string) ([]byte, error)
	CallMochaWithArgs(args ...string) error
}

type ProvisionInfo struct {
	deploymentFunctions      map[string][]*ActionFileConfig
	org                      string
	testServiceWebPath       string
	innovatorPath            string
	workspace                string
	emailTemplatePath        string
	testServiceHost          string
	sendGridAPIKey           string
	spaceToDeployTestService string
	provisioner              Provisioner
}

func init() {
	functionsToDeploy = make(map[string][]*ActionFileConfig)
	// Set up command line flag parsing parameters.
	pOrg = flag.String("o", "", "Your bluemix organisation")
	pInnovatorPath = flag.String("innovatorPath", "", "The file path to innovator folder")
	pTestServiceWebPath = flag.String("testServiceWebPath", "", "The file path to TestService web folder")
	pEmailTemplatePath = flag.String("emailTemplatePath", "", "The file path to email template file")
	pTestServiceHost = flag.String("testServiceHost", "", "The host url of TestService Web App")
	pSendGridAPIKey = flag.String("sendGridAPIKey", "", "SendGrid API Key")
	pSpaceToDeployTestService = flag.String("spaceToDeployTestService", "", "Space where is deployed TestService")
}

func main() {
	// Parse the flags.
	flag.Parse()

	// Capture any flags which have not been set.
	flag.VisitAll(func(f *flag.Flag) {
		if f.Value.String() == "" {
			flag.PrintDefaults()
			log.Fatalf("Required flag -%v (%v) was not set.", f.Name, f.Usage)
		}
	})

	// Get functions
	if err := filepath.Walk(*pInnovatorPath, readInActionConfigs); err != nil {
		log.Fatal(err)
	}

	for spaceName, actions := range functionsToDeploy {
		log.Printf("Innovator space name: %v", spaceName)
		for _, action := range actions {
			log.Printf("Action name: %v - file: %v -- Notify email: %v -- Base Path: %v", action.ActionName, action.ActionFile, action.NotifyEmail, action.BasePath)
		}
	}
	// Get current working dir
	goDir, err := os.Getwd()
	if err != nil {
		log.Fatal(err)
	}
	currentDir := strings.Split(goDir, "goinstall")[0]
	log.Printf("Workspace dir: %v", currentDir)

	provisionInfo := ProvisionInfo{
		deploymentFunctions:      functionsToDeploy,
		org:                      *pOrg,
		workspace:                currentDir,
		testServiceWebPath:       *pTestServiceWebPath,
		innovatorPath:            *pInnovatorPath,
		emailTemplatePath:        *pEmailTemplatePath,
		testServiceHost:          *pTestServiceHost,
		sendGridAPIKey:           *pSendGridAPIKey,
		spaceToDeployTestService: *pSpaceToDeployTestService,
		provisioner:              &LiveProvisioner{},
	}

	if err := LoadService(provisionInfo); err != nil {
		log.Fatal(err)
	}
}
