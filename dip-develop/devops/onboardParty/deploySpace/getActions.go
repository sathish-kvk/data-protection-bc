package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
)

type ActionConfig struct {
	Package string `json:"package"`
	File    string `json:"file"`
}

type Actions map[string]ActionConfig

func GetActions(input []byte, cloudFunctionPath string) (Actions, error) {
	actions := Actions{}

	if err := json.Unmarshal(input, &actions); err != nil {
		return nil, err
	}
	for actionName, actionConfig := range actions {
		actionConfig.File = fmt.Sprintf("%v/actions/%v", cloudFunctionPath, actionConfig.File)
		actions[actionName] = actionConfig
	}
	return actions, nil
}

func GetActionsFromFile(cloudFunctionPath string) (Actions, error) {
	filename := fmt.Sprintf("%v/actions/.actionconfig.json", cloudFunctionPath)
	fileBytes, err := ioutil.ReadFile(filename)
	if err != nil {
		return nil, err
	}

	return GetActions(fileBytes, cloudFunctionPath)
}
