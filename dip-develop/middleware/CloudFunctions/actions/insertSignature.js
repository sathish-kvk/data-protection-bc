/**
  *
  * main() will be invoked when you Run This Action
  *
  * @param OpenWhisk actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
 function main(params_in_insertsignature) {
    var request = require("request");
    var url = params_in_insertsignature.sysDetails.api_protocol + "://" + params_in_insertsignature.sysDetails.api_hostname + params_in_insertsignature.sysDetails.api_path + '/signatures';
    var options = {
        method: 'POST',
        url: url,   
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'x-ibm-client-secret':params_in_insertsignature.sysDetails.client_secret,
            'x-ibm-client-id': params_in_insertsignature.sysDetails.client_id
        },
        body:{
            "agreementID":params_in_insertsignature.agreementID,
            "unsignedHash":params_in_insertsignature.unsignedHash,
            "signedHash":params_in_insertsignature.signedHash,
            "timestamp" : params_in_insertsignature.timestamp
        },
        json: true
    };
    return new Promise(function(resolve, reject){
        request(options, function(error, response, body) {
            if(error) {
                reject(error);
            }
            else{
                console.log(JSON.stringify(body));
                resolve(body);
            }
        })
    }) 
}
     
 