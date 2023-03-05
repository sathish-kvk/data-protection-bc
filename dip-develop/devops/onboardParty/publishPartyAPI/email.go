package main

import (
	"bytes"
	"fmt"
	"html/template"
	"log"

	sendgrid "github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
)

func ParseTemplate(emailTemplatePath string, data interface{}) (string, error) {
	templateFileName := fmt.Sprintf("%v/%v", emailTemplatePath, "email-template.html")

	funcMap := template.FuncMap{
		// The name "inc" is what the function will be called in the template text.
		"inc": func(i int) int {
			return i + 1
		},
	}

	var emailContent string

	log.Printf("Template File: %v", templateFileName)
	tmpl := template.Must(template.New("email-template.html").Funcs(funcMap).ParseFiles(templateFileName))

	buf := new(bytes.Buffer)
	if err := tmpl.Execute(buf, data); err != nil {
		return emailContent, err
	}
	emailContent = buf.String()
	return emailContent, nil
}

func SendEmail(partyAppCredentials []PartyAppCredential, provisionInfo ProvisionInfo) error {
	body, err := ParseTemplate(provisionInfo.emailTemplatePath, partyAppCredentials)
	if err != nil {
		return err
	}
	from := mail.NewEmail("noreply", "noreply@dip.dxc.com")
	subject := fmt.Sprintf("[DIP] - Parties credential")

	to := mail.NewEmail("", provisionInfo.mailTo)
	message := mail.NewSingleEmail(from, subject, to, body, body)

	client := sendgrid.NewSendClient(provisionInfo.sendGridAPIKey)
	_, err = client.Send(message)
	if err != nil {
		log.Println(err)
	} else {
		fmt.Printf("Email send out to %v successfully.", provisionInfo.mailTo)
	}
	return nil
}
