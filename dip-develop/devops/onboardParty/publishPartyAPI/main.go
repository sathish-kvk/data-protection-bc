package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"strings"
)

var pOrg *string
var pUsersFile *string
var pApiServer *string
var pBasicAuthKey *string
var pApiTemplate *string
var pCloudFunctionPath *string
var pUpdateAPIOnly *string
var pEmailTemplatePath *string
var currentDir string
var pNewVersion *string
var pSendGridAPIKey *string
var pMailTo *string

//basicAuthKey will generate from https://www.base64encode.org/
// input: user:pw
// output: basicAuthKey

func init() {
	// Set up command line flag parsing parameters.
	pOrg = flag.String("o", "", "Your bluemix organisation")
	pUsersFile = flag.String("usersFile", "", "The file describing brokers, insurers and innovators")
	pApiServer = flag.String("apiServer", "", "The API server")
	pApiTemplate = flag.String("apiTemplate", "", "Party's API template")
	pCloudFunctionPath = flag.String("cloudFunctionPath", "", "The path to Cloud Function folder")
	pUpdateAPIOnly = flag.String("updateAPIOnly", "false", "Flag if true, will update the API only. No change on digital-locker")
	pNewVersion = flag.String("newVersion", "0.0.0", "Fixed the API version for all APIs")
	pEmailTemplatePath = flag.String("emailTemplatePath", "", "Path to email template")
	pSendGridAPIKey = flag.String("sendGridAPIKey", "NA", "SendGrid API Key")
	pMailTo = flag.String("mailTo", "NA", "Email to receive the parties credentil list")
	pBasicAuthKey = flag.String("basicAuthKey", "", "This basic authentication value will use to access API REST")
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

	// Get users
	users, err := GetUsersFromFile(*pUsersFile)
	if err != nil {
		log.Fatal(err)
	}

	// Get current working dir
	goDir, err := os.Getwd()
	if err != nil {
		log.Fatal(err)
	}
	log.Println(goDir)
	currentDir := strings.Split(goDir, "goinstall")[0]
	log.Printf("Workspace dir: %v", currentDir)

	provisionInfo := ProvisionInfo{
		users:             users,
		org:               *pOrg,
		server:            *pApiServer,
		basicAuthKey:      fmt.Sprintf("Basic %v", *pBasicAuthKey),
		workspace:         currentDir,
		apiTemplate:       *pApiTemplate,
		cloudFunctionPath: *pCloudFunctionPath,
		updateAPIOnly:     *pUpdateAPIOnly,
		newVersion:        *pNewVersion,
		emailTemplatePath: *pEmailTemplatePath,
		sendGridAPIKey:    *pSendGridAPIKey,
		mailTo:            *pMailTo,
		provisioner:       &LiveProvisioner{},
	}

	// Provision relevant spaces and functions
	if err := Provision(provisionInfo); err != nil {
		log.Fatal(err)
	}
}
