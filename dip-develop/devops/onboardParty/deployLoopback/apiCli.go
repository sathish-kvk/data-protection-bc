package main

import (
	"os"
	"os/exec"
	"strings"
)

type LiveProvisioner struct {
}

const APIC_CLI = "apic"
const BLUEMIX_CMD = "bluemix"

func parseArgs(args ...string) []string {
	if len(args) > 1 {
		return append(strings.Split(args[0], " "), args[1])
	}
	return strings.Split(args[0], " ")
}

func (l *LiveProvisioner) CallApicWithArgs(args ...string) error {

	cmd := exec.Command(APIC_CLI, parseArgs(args...)...)

	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	return cmd.Run()
}

func (l *LiveProvisioner) CallApicWithArgsOutput(args ...string) ([]byte, error) {

	return exec.Command(APIC_CLI, parseArgs(args...)...).Output()
}

func (l *LiveProvisioner) CallCFWithArgs(args ...string) error {

	cmd := exec.Command(BLUEMIX_CMD, parseArgs(args...)...)

	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	return cmd.Run()
}

func (l *LiveProvisioner) CallCFWithArgsOutput(args ...string) ([]byte, error) {

	return exec.Command(BLUEMIX_CMD, parseArgs(args...)...).Output()
}
