package main

import (
	"os"
	"os/exec"
	"strings"
)

type LiveProvisioner struct {
}

const BLUEMIXCLI = "bluemix"
const MOCHA = "mocha"

func parseArgs(args ...string) []string {
	if len(args) > 1 {
		return append(strings.Split(args[0], " "), args[1])
	}
	return strings.Split(args[0], " ")
}

func (l *LiveProvisioner) CallBluemixWithArgs(args ...string) error {

	cmd := exec.Command(BLUEMIXCLI, parseArgs(args...)...)

	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	return cmd.Run()
}

func (l *LiveProvisioner) CallBluemixWithArgsOutput(args ...string) ([]byte, error) {

	return exec.Command(BLUEMIXCLI, parseArgs(args...)...).Output()
}

func (l *LiveProvisioner) CallMochaWithArgs(args ...string) error {

	cmd := exec.Command(MOCHA, parseArgs(args...)...)

	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	return cmd.Run()
}
