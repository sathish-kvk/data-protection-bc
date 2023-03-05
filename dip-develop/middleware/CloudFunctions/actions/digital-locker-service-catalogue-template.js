/**
  *
  * main() will be invoked when you Run This Action
  *
  * @param OpenWhisk actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
function main(inp_params_digital_locker) {

    console.log("Input params>>>" + JSON.stringify(inp_params_digital_locker));
    var clientId = inp_params_digital_locker.clientId;
    console.log("clientId>>>>" + clientId);

    switch (clientId) {
		{{range .PartyAppCredentials}}
        case '{{.ClientID}}':
            return {
                "sysDetails": {
                    "party_name": "{{.PartyName}}",
                    "api_endpoint": "https://api.eu.apiconnect.ibmcloud.com/dxc-digital-innovation-platform-dip-service-catalogue/prod/{{.FormateddPartyName}}",
                    "client_secret": "{{.ClientSecret}}"
                }
            }
            break;
		{{end}}
    }
}
exports.main = main;