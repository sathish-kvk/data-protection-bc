package main

import (
	"fmt"
	"io/ioutil"
	"log"

	yaml "gopkg.in/yaml.v2"
)

type Info struct {
	XIbmName string `yaml:"x-ibm-name"`
	Title    string `yaml:"title"`
	Version  string `yaml:"version"`
}

type XIbmConfiguration struct {
	Testable bool `yaml:"testable"`
	Enforced bool `yaml:"enforced"`
	Cors     struct {
		Enabled bool `yaml:"enabled"`
	} `yaml:"cors"`
	Assembly struct {
		Execute []struct {
			SetVariable struct {
				Title   string `yaml:"title"`
				Actions []struct {
					Set   string `yaml:"set"`
					Value string `yaml:"value"`
				} `yaml:"actions"`
				Version string `yaml:"version"`
			} `yaml:"set-variable,omitempty"`
			OperationSwitch struct {
				Title string `yaml:"title"`
				Case  []struct {
					Operations []struct {
						Verb string `yaml:"verb"`
						Path string `yaml:"path"`
					} `yaml:"operations"`
					Execute []struct {
						Invoke struct {
							TargetURL string `yaml:"target-url"`
							Title     string `yaml:"title"`
							Username  string `yaml:"username"`
							Password  string `yaml:"password"`
							Verb      string `yaml:"verb"`
							Output    string `yaml:"output"`
						} `yaml:"invoke"`
					} `yaml:"execute"`
				} `yaml:"case"`
				Otherwise []interface{} `yaml:"otherwise"`
				Version   string        `yaml:"version"`
			} `yaml:"operation-switch,omitempty"`
			Gatewayscript struct {
				Title   string `yaml:"title"`
				Version string `yaml:"version"`
				Source  string `yaml:"source"`
			} `yaml:"gatewayscript,omitempty"`
			Switch struct {
				Title string `yaml:"title"`
				Case  []struct {
					Condition string `yaml:"condition,omitempty"`
					Execute   []struct {
						Throw struct {
							Title   string `yaml:"title"`
							Version string `yaml:"version"`
							Name    string `yaml:"name"`
						} `yaml:"throw"`
					} `yaml:"execute,omitempty"`
					Otherwise []struct {
						Gatewayscript struct {
							Title   string `yaml:"title"`
							Version string `yaml:"version"`
							Source  string `yaml:"source"`
						} `yaml:"gatewayscript,omitempty"`
						SetVariable struct {
							Title   string `yaml:"title"`
							Actions []struct {
								Set   string `yaml:"set"`
								Value string `yaml:"value"`
							} `yaml:"actions"`
							Version string `yaml:"version"`
						} `yaml:"set-variable,omitempty"`
					} `yaml:"otherwise,omitempty"`
				} `yaml:"case"`
				Version string `yaml:"version"`
			} `yaml:"switch,omitempty"`
		} `yaml:"execute"`
		Catch []struct {
			Errors  []string `yaml:"errors"`
			Execute []struct {
				SetVariable struct {
					Title   string `yaml:"title"`
					Actions []struct {
						Set   string `yaml:"set"`
						Value string `yaml:"value"`
					} `yaml:"actions"`
					Version string `yaml:"version"`
				} `yaml:"set-variable"`
			} `yaml:"execute"`
		} `yaml:"catch"`
	} `yaml:"assembly"`
	Phase string `yaml:"phase"`
}

func GenerateAPIYamlFromTemplate(apiTemplate string, spaceName string, version string, userName string, password string) (string, error) {
	yamlFile, err := ioutil.ReadFile(apiTemplate)
	if err != nil {
		log.Printf("Could not read API template yaml file #%v ", err)
		return "", err
	}

	apiModel := make(map[string]interface{})
	if uerr := yaml.Unmarshal([]byte(yamlFile), &apiModel); uerr != nil {
		log.Printf("error parsing yaml file: %v", uerr)
		return "", uerr
	}
	// basePath
	apiModel["basePath"] = fmt.Sprintf("/%v", formatSpaces(spaceName))

	// Info
	orginalInfo := apiModel["info"]
	//convert to yaml
	orginalInfoData, err := yaml.Marshal(orginalInfo)
	if err != nil {
		log.Fatalf("error: %v", err)
		return "", err
	}
	//convert to object
	info := Info{}
	if err := yaml.Unmarshal([]byte(string(orginalInfoData)), &info); err != nil {
		return "", err
	}
	info.XIbmName = formatSpaces(spaceName)
	info.Title = spaceName
	info.Version = version

	// assign back to object
	apiModel["info"] = info

	// X-IBM-Configuration
	orginalIbmConfig := apiModel["x-ibm-configuration"]
	//convert to yaml
	data, err := yaml.Marshal(orginalIbmConfig)
	if err != nil {
		log.Fatalf("error: %v", err)
		return "", err
	}
	//convert to object
	ibmConfig := XIbmConfiguration{}

	if err := yaml.Unmarshal([]byte(string(data)), &ibmConfig); err != nil {
		return "", err
	}
	// change data
	for idx, _ := range ibmConfig.Assembly.Execute {
		for exeCaseIdx, _ := range ibmConfig.Assembly.Execute[idx].OperationSwitch.Case {
			for caseOpIdx, _ := range ibmConfig.Assembly.Execute[idx].OperationSwitch.Case[exeCaseIdx].Execute {
				ibmConfig.Assembly.Execute[idx].OperationSwitch.Case[exeCaseIdx].Execute[caseOpIdx].Invoke.Username = userName
				ibmConfig.Assembly.Execute[idx].OperationSwitch.Case[exeCaseIdx].Execute[caseOpIdx].Invoke.Password = password
			}
		}
	}

	apiModel["x-ibm-configuration"] = ibmConfig
	//convert to yaml
	//update yaml file & convert to yaml
	updatedData, err := yaml.Marshal(apiModel)
	if err != nil {
		log.Fatalf("error: %v", err)
		return "", err
	}

	outputFileName := fmt.Sprintf("%v_%v.yaml", formatSpaces(spaceName), version)
	err = ioutil.WriteFile(outputFileName, updatedData, 0644)
	if err != nil {
		log.Fatalf("error: %v", err)
		return "", err
	}

	log.Printf("%v was created successfully!", outputFileName)

	return outputFileName, nil
}
