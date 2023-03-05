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
var pTemplateLbPath *string
var pBasicAuthKey *string
var pCloudFunctionPath *string
var currentDir string

//basicAuthKey will generate from https://www.base64encode.org/
// input: user:pw
// output: basicAuthKey

func init() {
	// Set up command line flag parsing parameters.
	pOrg = flag.String("o", "", "Your bluemix organisation")
	pUsersFile = flag.String("usersFile", "", "The file describing brokers, insurers and innovators")
	pApiServer = flag.String("apiServer", "", "The API server")
	pTemplateLbPath = flag.String("templateLbPath", "", "The path to Loopback project")
	pCloudFunctionPath = flag.String("cloudFunctionPath", "", "The path to Cloud Function folder")
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
		templateLbPath:    *pTemplateLbPath,
		workspace:         currentDir,
		cloudFunctionPath: *pCloudFunctionPath,
		provisioner:       &LiveProvisioner{},
	}

	// Provision relevant spaces and functions
	if err := Provision(provisionInfo); err != nil {
		log.Fatal(err)
	}
}
