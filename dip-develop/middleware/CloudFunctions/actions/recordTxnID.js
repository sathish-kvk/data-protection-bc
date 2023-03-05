/**
 *
 * main() will be invoked when you Run This Action
 *
 * @param OpenWhisk actions accept a single parameter, which must be a JSON object.
 *
 * @return The output of this action, which must be a JSON object.
 *
*/

  function main(params_in_updateProof) {
    var request = require("request");
    var openwhisk = require('openwhisk');
    var ow = openwhisk();
    return ow.actions.invoke({ actionName: 'common-ow/digital-locker', blocking: true, result: true }).then(result => {
        var sysDetails = result.sysDetails4Sql;
        var url = sysDetails.api_protocol + "://" + sysDetails.api_hostname + sysDetails.api_path + '/proofs';
        var options = {
            method: 'PATCH',
            url: url,   
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                'x-ibm-client-secret':sysDetails.client_secret,
                'x-ibm-client-id': sysDetails.client_id
            },
            body:{
                proofID: params_in_updateProof.proofID,
                proof_HL_transactionID: params_in_updateProof.transactionID
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
    })
}