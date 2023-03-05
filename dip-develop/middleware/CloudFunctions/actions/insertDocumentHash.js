/**
  *
  * main() will be invoked when you Run This Action
  *
  * @param OpenWhisk actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
 function main(params_in_insertDocumentHash) {
    var request = require("request");
    var openwhisk = require('openwhisk');
    var ow = openwhisk();
    return ow.actions.invoke({ actionName: 'common-ow/digital-locker', blocking:true, result:true}).then(result => {
        params_in_insertDocumentHash.sysDetails = result.sysDetails4Sql;
        var url = params_in_insertDocumentHash.sysDetails.api_protocol + "://" + params_in_insertDocumentHash.sysDetails.api_hostname + params_in_insertDocumentHash.sysDetails.api_path + '/documentHashes';
        var options = {
            method: 'PATCH',
            url: url,   
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                'x-ibm-client-secret':params_in_insertDocumentHash.sysDetails.client_secret,
                'x-ibm-client-id': params_in_insertDocumentHash.sysDetails.client_id
            },
            body:{
                documentHashID: params_in_insertDocumentHash.documentHashID,
                documentContent: params_in_insertDocumentHash.documentContent
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
    });
}