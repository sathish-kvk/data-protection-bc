#!/bin/bash -e
export PATH=/opt/IBM/node-v6.7.0/bin:$PATH
npm install -g mocha
npm install -g mocha-simple-html-reporter

# Use previously installed bluemix CLI
export PATH=$PATH:$PWD/Bluemix_CLI/bin

# Use deploySpace program
export PATH=$PATH:$PWD/goinstall/workspace/bin

export BLUEMIX_HOME=$PWD

# Log in to bluemix
BLUEMIX_API_KEY=$API_KEY bluemix login -a api.eu-gb.bluemix.net
echo "Logged into bluemix successfully"

# Copy actions to web/TestService

cp -R innovator web/TestService/app/shared/data/innovator/

# Run loadService program
loadService -o $ORG  -innovatorPath innovator -testServiceWebPath web/TestService -emailTemplatePath devops/postService/loadService -testServiceHost $Test_Service_Host -spaceToDeployTestService $Space_To_Deploy_Test_Service -sendGridAPIKey $Send_Grid_API_Key
