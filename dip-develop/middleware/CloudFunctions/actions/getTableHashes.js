/**
  *
  * main() will be invoked when you Run This Action
  *
  * @param OpenWhisk actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
 function main(params_in_getTableHashes) {
    console.log("Input params params_in_getTableHashes>> "+ JSON.stringify(params_in_getTableHashes));
    var request = require("request");
    var openwhisk = require('openwhisk');
    var ow = openwhisk();
    return ow.actions.invoke({ actionName: 'common-ow/digital-locker', blocking:true, result:true}).then(result => {
        params_in_getTableHashes.sysDetails = result.sysDetails4Cloudant;

        var url = params_in_getTableHashes.sysDetails.api_protocol + "://" + params_in_getTableHashes.sysDetails.api_hostname + params_in_getTableHashes.sysDetails.api_path + '/tableHashes';
       
        var options = {
            method: 'GET',
            url: url,
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                'x-ibm-client-secret':params_in_getTableHashes.sysDetails.client_secret,
                'x-ibm-client-id': params_in_getTableHashes.sysDetails.client_id
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
                    resolve({ 'tableHashes': body });
                }
            })
        })
    });   
}