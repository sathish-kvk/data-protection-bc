/**
  *
  * main() will be invoked when you Run This Action
  *
  * @param OpenWhisk actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
 function main(params_in_postHashToCloudant) {
    var request = require("request");
    var openwhisk = require('openwhisk');
    const blocking = true, result = true;
    var ow = openwhisk();
    var url = params_in_postHashToCloudant.sysDetails.api_protocol + "://" + params_in_postHashToCloudant.sysDetails.api_hostname + params_in_postHashToCloudant.sysDetails.api_path + '/agreements';
    console.log("The url " + url);
    console.log("Cloud function post Hash to Cloudant with input Json >> "+ JSON.stringify(params_in_postHashToCloudant));
    var options = {
        method: 'POST',
        url: url,   
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'x-ibm-client-secret':params_in_postHashToCloudant.sysDetails.client_secret,
            'x-ibm-client-id': params_in_postHashToCloudant.sysDetails.client_id
        },
        body:{
            "agreementID":params_in_postHashToCloudant.agreementID,
             "hash":params_in_postHashToCloudant.hash,
             "timestamp":params_in_postHashToCloudant.timestamp
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
     
 