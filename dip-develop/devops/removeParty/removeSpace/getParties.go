package main

import (
	"encoding/json"
	"io/ioutil"
)

type Parties []string

func GetParties(filename string) (Parties, error) {
	fileBytes, err := ioutil.ReadFile(filename)
	if err != nil {
		return nil, err
	}
	parties := Parties{}

	if err := json.Unmarshal(fileBytes, &parties); err != nil {
		return nil, err
	}

	return parties, nil
}
