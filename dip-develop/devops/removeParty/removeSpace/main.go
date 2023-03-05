package main

import (
	"flag"
	"log"
	"os"
	"strings"
)

var pOrg *string
var pPartiesFile *string

type Provisioner interface {
	CallBluemixWithArgs(args ...string) error
	CallBluemixWithArgsOutput(args ...string) ([]byte, error)
}

type ProvisionInfo struct {
	parties     Parties
	org         string
	provisioner Provisioner
}

//basicAuthKey will generate from https://www.base64encode.org/
// input: user:pw
// output: basicAuthKey

func init() {
	// Set up command line flag parsing parameters.
	pOrg = flag.String("o", "", "Your bluemix organisation")
	pPartiesFile = flag.String("partiesFile", "", "The file describing list of space need to be deleted")
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

	// Get current working dir
	goDir, err := os.Getwd()
	if err != nil {
		log.Fatal(err)
	}
	currentDir := strings.Split(goDir, "goinstall")[0]
	log.Printf("Workspace dir: %v", currentDir)

	parties, err := GetParties(*pPartiesFile)

	if err != nil {
		log.Fatal(err)
	}

	provisionInfo := ProvisionInfo{
		parties:     parties,
		org:         *pOrg,
		provisioner: &LiveProvisioner{},
	}
	if err := DeleteSpace(provisionInfo); err != nil {
		log.Fatal(err)
	}
}
