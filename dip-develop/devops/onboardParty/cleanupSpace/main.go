package main

import (
	"flag"
	"log"
)

var pOrg *string
var pUsersFile *string

type Provisioner interface {
	CallBluemixWithArgs(args ...string) error
}

type ProvisionInfo struct {
	users       Users
	org         string
	provisioner Provisioner
}

func init() {
	// Set up command line flag parsing parameters.
	pOrg = flag.String("o", "", "Your bluemix organisation")
	pUsersFile = flag.String("usersFile", "", "The file describing brokers, insurers and innovators")
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

	provisionInfo := ProvisionInfo{
		users:       users,
		org:         *pOrg,
		provisioner: &LiveProvisioner{},
	}

	// delete DB admin app
	if err := DeleteDBAdminApp(provisionInfo); err != nil {
		log.Fatal(err)
	}

}
