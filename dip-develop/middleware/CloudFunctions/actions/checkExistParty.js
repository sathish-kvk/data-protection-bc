/**
  *
  * main() will be run when you invoke this action
  *
  * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
 function main(params) {
    var request = require("request");
    var openwhisk = require('openwhisk');
    var ow = openwhisk();
    
    if (params.partyID == null || params.partyID == "") { return { "error": "PartyID is empty" };}
    
	return ow.actions.invoke({ actionName: 'common-ow/digital-locker', blocking: true, result: true }).then(result => {
            var sysDetails = result.sysDetails4Sql;
            var url = sysDetails.api_protocol + "://" + sysDetails.api_hostname + sysDetails.api_path + '/parties/' + params.partyID + '/exists';
            var options = {
                method: 'GET',
                url: url,   
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    'x-ibm-client-secret':sysDetails.client_secret,
                    'x-ibm-client-id': sysDetails.client_id
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
                        resolve({
                            partyID: params.partyID,
                            exists : body.exists
                        });
                    }
                })
            }) 
        }) 
}
