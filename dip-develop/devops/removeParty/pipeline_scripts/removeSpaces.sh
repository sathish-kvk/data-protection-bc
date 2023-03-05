#!/bin/bash -e

# Use previously installed bluemix CLI
export PATH=$PATH:$PWD/Bluemix_CLI/bin

# Use deploySpace program
export PATH=$PATH:$PWD/goinstall/workspace/bin

export BLUEMIX_HOME=$PWD

# Log in to bluemix
BLUEMIX_API_KEY=$API_KEY bluemix login -a api.eu-gb.bluemix.net
echo "Logged into bluemix successfully"

# Run our deployment program

removeSpace -o $ORG  -partiesFile devops/removeParty/removeSpace/removeSpaces.json