package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
)

type Triggers map[string]TriggerConfig

type TriggerConfig struct {
	Rules []Rule `json:"actions"`
}

type Rule struct {
	Name   string `json:"name"`
	Action string `json:"action"`
}

func GetTriggers(input []byte) (Triggers, error) {
	triggers := Triggers{}

	if err := json.Unmarshal(input, &triggers); err != nil {
		return nil, err
	}

	return triggers, nil
}

func GetTriggersFromFile(cloudFunctionPath string) (Triggers, error) {
	filename := fmt.Sprintf("%v/actions/.triggerconfig.json", cloudFunctionPath)
	fileBytes, err := ioutil.ReadFile(filename)
	if err != nil {
		return nil, err
	}

	return GetTriggers(fileBytes)
}
