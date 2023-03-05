# Use deploySpace program
export PATH=$PATH:$PWD/goinstall/workspace/bin

# Log in to bluemix
BLUEMIX_API_KEY=$API_KEY bluemix login -a api.eu-gb.bluemix.net
echo "Logged into bluemix successfully"


# Run our deployment program
deployLoopback -o ${ORG} -usersFile devops/onboardParty/dbsetup/parties.json -apiServer ${apic_server} -templateLbPath middleware/APIConnect/Loopback/template-loopback