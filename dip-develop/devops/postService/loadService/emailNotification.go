package main

import (
	"bytes"
	b64 "encoding/base64"
	"fmt"
	"html/template"
	"io/ioutil"
	"log"

	sendgrid "github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
)

func ParseTemplate(emailTemplatePath string, hasTestError bool, data interface{}) (string, error) {
	templateFileName := fmt.Sprintf("%v/%v", emailTemplatePath, "emailTemplate-success.html")
	if hasTestError {
		templateFileName = fmt.Sprintf("%v/%v", emailTemplatePath, "emailTemplate-fail.html")
	}
	var emailContent string
	t, err := template.ParseFiles(templateFileName)
	if err != nil {
		return emailContent, err
	}
	buf := new(bytes.Buffer)
	if err = t.Execute(buf, data); err != nil {
		return emailContent, err
	}
	emailContent = buf.String()
	return emailContent, nil
}

func SendEmailForNewAction(action *ActionFileConfig, provisionInfo ProvisionInfo, hasTestError bool) error {
	body, err := ParseTemplate(provisionInfo.emailTemplatePath, hasTestError, action)
	if err != nil {
		return err
	}
	from := mail.NewEmail("noreply", "noreply@dip.dxc.com")
	subject := fmt.Sprintf("A new Action %v has been published to %v Space", action.ActionName, action.Innovator)
	if hasTestError {
		subject = fmt.Sprintf("A new Action %v has not been published to %v Space", action.ActionName, action.Innovator)
	}
	to := mail.NewEmail("", action.NotifyEmail)
	message := mail.NewSingleEmail(from, subject, to, body, body)

	//Add mocha-report-function.xml
	fileBytes, err := ioutil.ReadFile(MOCHAR_RPT_OUTPUT)
	testContent := b64.StdEncoding.EncodeToString(fileBytes)
	attachment := mail.NewAttachment()
	attachment.SetFilename(MOCHAR_RPT_OUTPUT)
	attachment.SetType("application/xml")
	attachment.SetContent(testContent)
	message.AddAttachment(attachment)

	client := sendgrid.NewSendClient(provisionInfo.sendGridAPIKey)
	response, err := client.Send(message)
	if err != nil {
		log.Println(err)
	} else {
		fmt.Println(response.StatusCode)
	}
	return nil
}

/*
func SendEmail(emailTemplatePath string, sendGridAPIKey string) error {
	// read file
	fileBytes, err := ioutil.ReadFile(NEW_ACTIONS_FILE)
	if err != nil {
		return err
	}
	ations := []*ActionFileConfig{}

	if err := json.Unmarshal(fileBytes, &ations); err != nil {
		return err
	}

	for _, action := range ations {
		body, err := ParseTemplate(emailTemplatePath, action)
		if err != nil {
			return err
		}
		log.Println(body)
		from := mail.NewEmail("noreply", "noreply@dip.dxc.com")
		subject := fmt.Sprintf("A new Action %v has been published to your DXC-DIP test Space", action.ActionName)
		to := mail.NewEmail("", action.NotifyEmail)
		message := mail.NewSingleEmail(from, subject, to, body, body)

		//Add mocha-report-function.xml
		fileBytes, err := ioutil.ReadFile("test-report.html")
		testContent := b64.StdEncoding.EncodeToString(fileBytes)
		attachment := mail.NewAttachment()
		attachment.SetFilename("test-report.html")
		attachment.SetType("application/xml")
		attachment.SetContent(testContent)
		message.AddAttachment(attachment)

		client := sendgrid.NewSendClient(sendGridAPIKey)
		response, err := client.Send(message)
		if err != nil {
			log.Println(err)
		} else {
			fmt.Println(response.StatusCode)
			fmt.Println(response.Body)
		}
	}
	return nil
}
*/
