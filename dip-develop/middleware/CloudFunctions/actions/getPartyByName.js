/**
  *
  * main() will be invoked when you Run This Action
  *
  * @param OpenWhisk actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
  function main(params_in_getPartyByName) {
    console.log("Input params params_in_getGetPartyByName>> "+ JSON.stringify(params_in_getPartyByName));
    var request = require("request");
    var url = params_in_getPartyByName.sysDetails.api_protocol + "://" + params_in_getPartyByName.sysDetails.api_hostname + params_in_getPartyByName.sysDetails.api_path + '/parties?'+ params_in_getPartyByName.filter
    var options = {
        method: 'GET',
        url: url,
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'x-ibm-client-secret':params_in_getPartyByName.sysDetails.client_secret,
            'x-ibm-client-id': params_in_getPartyByName.sysDetails.client_id
        },
        json: true
    };
    
    return new Promise(function(resolve, reject){
    console.log("Request options>>>>"+JSON.stringify(options))
    request(options, function(error, response, body) {
        if(error) {
            reject(error);
        }
        else{
            console.log(JSON.stringify(body));
            resolve({'parties': body});
        }
    })
    })
}