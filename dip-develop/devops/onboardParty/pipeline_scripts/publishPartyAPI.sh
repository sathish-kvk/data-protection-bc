# Use deploySpace program
export PATH=$PATH:$PWD/goinstall/workspace/bin

# Log in to bluemix
BLUEMIX_API_KEY=$api_key bluemix login -a api.eu-gb.bluemix.net
echo "Logged into bluemix successfully"

# Run our deployment program
publishPartyAPI -o ${ORG} -usersFile devops/onboardParty/dbsetup/parties.json -apiServer ${apic_server} -basicAuthKey ${basic_auth_key} -apiTemplate ${api_template} -cloudFunctionPath middleware/CloudFunctions -updateAPIOnly false -emailTemplatePath devops/onboardParty/publishPartyAPI -sendGridAPIKey ${send_grid_API_key} -mailTo ${mail_to}