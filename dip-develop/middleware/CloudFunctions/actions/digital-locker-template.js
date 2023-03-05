/**
  *
  * main() will be run when you invoke this action
  *
  * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
function main(params) {
	 return {
				"sysDetails4Sql": {
					"api_protocol": "https",
					"api_hostname": "api.eu.apiconnect.ibmcloud.com/",
					"api_path": "{{.MySQLApiPath}}",
					"client_id": "{{.MySQLClientID}}",
					"client_secret":"{{.MySQLClientSecret}}"
				},
				"cloudFunctions":{
					"options" :{ 
						"apihost": "openwhisk.eu-gb.bluemix.net",
						"api_key": "{{.ApiKey}}" 
					},
					"cf_path": "{{.CFPath}}"
				},
				"sysDetails4Cloudant": {
					"api_protocol": "https",
					"api_hostname": "api.eu.apiconnect.ibmcloud.com/",
					"api_path": "{{.CloudantApiPath}}",
					"client_id": "{{.CloudantClientID}}",
					"client_secret":"{{.CloudantClientSecret}}"
				},
				"rsaKey":{
					"privatekey":"{{.PrivateKey}}",
					"publickey":"{{.PublicKey}}"
				}
			}
}
exports.main = main;