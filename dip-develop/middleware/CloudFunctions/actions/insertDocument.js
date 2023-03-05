/**
  *
  * main() will be invoked when you Run This Action
  *
  * @param OpenWhisk actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
 function main(params_in_insertDocument) {
    var request = require("request");
    var openwhisk = require('openwhisk');
    var ow = openwhisk();
    return ow.actions.invoke({ actionName: 'common-ow/digital-locker', blocking:true, result:true}).then(result => {
        params_in_insertDocument.sysDetails = result.sysDetails4Sql;
        var url = params_in_insertDocument.sysDetails.api_protocol + "://" + params_in_insertDocument.sysDetails.api_hostname + params_in_insertDocument.sysDetails.api_path + '/documents';
        var options = {
            method: 'POST',
            url: url,   
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                'x-ibm-client-secret':params_in_insertDocument.sysDetails.client_secret,
                'x-ibm-client-id': params_in_insertDocument.sysDetails.client_id
            },
            body:{
                documentID: params_in_insertDocument.documentID,
                documentHashID: params_in_insertDocument.documentHashID,
                agreementID: params_in_insertDocument.agreementID,
                elementID: params_in_insertDocument.elementID,
                documentName: params_in_insertDocument.documentName,
                documentType : params_in_insertDocument.documentType,
                createdDate: params_in_insertDocument.createdDate
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