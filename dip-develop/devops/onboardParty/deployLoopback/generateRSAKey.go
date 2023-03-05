package main

import (
	"bytes"
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/asn1"
	"encoding/pem"
	"fmt"
	"strings"
)

func GenerateRSAKey() (string, string, error) {
	reader := rand.Reader
	bitSize := 2048

	key, err := rsa.GenerateKey(reader, bitSize)

	if err != nil {
		return "", "", err
	}

	privateKey := GenPrivateKey(key)
	publicKey := GenPublicKey(key.PublicKey)

	privateKeyString := FormatRSAKey(privateKey)
	publicKeyString := FormatRSAKey(publicKey)

	return privateKeyString, publicKeyString, nil
}

func FormatRSAKey(key string) string {
	var output string
	length := len(strings.Split(key, "\n"))
	for index, m := range strings.Split(key, "\n") {
		if m != "" {
			line := fmt.Sprintf("\"%v\\n\"+", m)
			if index == 0 {
				line = fmt.Sprintf("%v\\n\"+", m)
			}
			if index == length-2 {
				line = fmt.Sprintf("\"%v", m)
				output = fmt.Sprint(output, line)
			} else {
				output = fmt.Sprintln(output, line)
			}
		}
	}
	return strings.TrimLeft(output, " ")
}

func GenPrivateKey(key *rsa.PrivateKey) string {
	var private bytes.Buffer
	var privateKey = &pem.Block{
		Type:  "RSA PRIVATE KEY",
		Bytes: x509.MarshalPKCS1PrivateKey(key),
	}

	err := pem.Encode(&private, privateKey)
	checkError(err)

	return private.String()
}

func GenPublicKey(pubkey rsa.PublicKey) string {
	asn1Bytes, err := asn1.Marshal(pubkey)
	checkError(err)

	var pemkey = &pem.Block{
		Type:  "RSA PUBLIC KEY",
		Bytes: asn1Bytes,
	}
	var public bytes.Buffer

	err = pem.Encode(&public, pemkey)
	checkError(err)
	return public.String()
}

func checkError(err error) {
	if err != nil {
		fmt.Println("Fatal error ", err.Error())
	}
}
