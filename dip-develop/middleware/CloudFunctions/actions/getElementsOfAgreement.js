/**
  *
  * main() will be invoked when you Run This Action
  *
  * @param OpenWhisk actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
  function main(params_in_getElementOfAgreement) {
    console.log("Input params params_in_getElementOfAgreement>> "+ JSON.stringify(params_in_getElementOfAgreement));
    var request = require("request");
    var url = params_in_getElementOfAgreement.sysDetails.api_protocol + "://" + params_in_getElementOfAgreement.sysDetails.api_hostname + params_in_getElementOfAgreement.sysDetails.api_path + '/agreements/'+params_in_getElementOfAgreement.agreementID + "/elements?" + params_in_getElementOfAgreement.filter;
    var options = {
        method: 'GET',
        url: url,
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'x-ibm-client-secret':params_in_getElementOfAgreement.sysDetails.client_secret,
            'x-ibm-client-id': params_in_getElementOfAgreement.sysDetails.client_id
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
                resolve({ 'elements': body});
            }
        })
    })
}