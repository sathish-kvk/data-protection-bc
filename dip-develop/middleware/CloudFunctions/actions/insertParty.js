/**
  *
  * main() will be invoked when you Run This Action
  *
  * @param OpenWhisk actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
 function main(params_in_insertParty) {
    console.log("Input params params_in_insertParty>> " + JSON.stringify(params_in_insertParty));
    var request = require("request");
    var openwhisk = require('openwhisk');
    var ow=openwhisk();
    return ow.actions.invoke({ actionName: 'common-ow/digital-locker', blocking: true, result: true }).then(result => {
        params_in_insertParty.sysDetails = result.sysDetails4Sql;

        var url = params_in_insertParty.sysDetails.api_protocol + "://" + params_in_insertParty.sysDetails.api_hostname + params_in_insertParty.sysDetails.api_path + '/parties';
        var options = {
            method: 'POST',
            url: url,   
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                'x-ibm-client-secret':params_in_insertParty.sysDetails.client_secret,
                'x-ibm-client-id': params_in_insertParty.sysDetails.client_id
            },
            body:{
                partyID: params_in_insertParty.partyID,
                partyName: params_in_insertParty.partyName,
                partyRole: params_in_insertParty.partyRole,
                partyPublicKey: null
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
