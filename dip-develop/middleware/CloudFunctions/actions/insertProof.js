/**
 *
 * main() will be invoked when you Run This Action
 *
 * @param OpenWhisk actions accept a single parameter, which must be a JSON object.
 *
 * @return The output of this action, which must be a JSON object.
 *
*/
function main(params_in_proof) {
    var request = require("request");
    var openwhisk = require('openwhisk');
    var ow = openwhisk();
    
    return ow.actions.invoke({ actionName: 'common-ow/digital-locker', blocking: true, result: true }).then(result => {
        var sysDetails = result.sysDetails4Sql;
        var url = sysDetails.api_protocol + "://" + sysDetails.api_hostname + sysDetails.api_path + '/proofs';
        var options = {
            method: 'POST',
            url: url,   
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                'x-ibm-client-secret':sysDetails.client_secret,
                'x-ibm-client-id': sysDetails.client_id
            },
            body:{
                proofID: params_in_proof.proofID,
                fk_agreementID: params_in_proof.fk_agreementID,
                fk_elementID: params_in_proof.fk_elementID,
                proofBeforeHash: params_in_proof.proofBeforeHash,
                proofAfterHash: params_in_proof.proofAfterHash
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