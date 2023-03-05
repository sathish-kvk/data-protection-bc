/**
  *
  * main() will be invoked when you Run This Action
  *
  * @param OpenWhisk actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
 function main(params_in_addTableHash) {
    console.log("Input params params_in_addTableHash>> "+ JSON.stringify(params_in_addTableHash));
    var request = require("request");
    var openwhisk = require('openwhisk');
    var ow = openwhisk();
    return ow.actions.invoke({ actionName: 'common-ow/digital-locker', blocking:true, result:true}).then(result => {
        params_in_addTableHash.sysDetails = result.sysDetails4Cloudant;

        var url = params_in_addTableHash.sysDetails.api_protocol + "://" + params_in_addTableHash.sysDetails.api_hostname + params_in_addTableHash.sysDetails.api_path + '/tableHashes';
        var date = new Date();
        var options = {
            method: 'PATCH',
            url: url,
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                'x-ibm-client-secret':params_in_addTableHash.sysDetails.client_secret,
                'x-ibm-client-id': params_in_addTableHash.sysDetails.client_id
            },
            body:{
                name: params_in_addTableHash.name,
                value: params_in_addTableHash.value,
                timestamp: date
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
                    resolve(body);
                }
            })
        })
    });   
}