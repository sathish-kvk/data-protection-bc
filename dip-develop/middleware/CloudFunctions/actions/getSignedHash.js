/**
  *
  * main() will be invoked when you Run This Action
  *
  * @param OpenWhisk actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
function main(params_in_getSignedHash) {
    console.log("Input params params_in_getSignedHash>> " + JSON.stringify(params_in_getSignedHash));
    var request = require("request");
    var openwhisk = require('openwhisk');
    var ow=openwhisk();
    return ow.actions.invoke({ actionName: 'common-ow/digital-locker', blocking: true, result: true }).then(result => {
        params_in_getSignedHash.sysDetails = result.sysDetails4Cloudant;

        var filter = "filter[where][agreementID]=" + params_in_getSignedHash.agreementID + "&filter[where][unsignedHash]=" + params_in_getSignedHash.unsignedHash;
        var url = params_in_getSignedHash.sysDetails.api_protocol + "://" + params_in_getSignedHash.sysDetails.api_hostname + params_in_getSignedHash.sysDetails.api_path + '/signatures?' + filter
        var options = {
            method: 'GET',
            url: url,
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                'x-ibm-client-secret': params_in_getSignedHash.sysDetails.client_secret,
                'x-ibm-client-id': params_in_getSignedHash.sysDetails.client_id
            },
            json: true
        };

        return new Promise(function (resolve, reject) {
            console.log("Request options>>>>" + JSON.stringify(options))
            request(options, function (error, response, body) {
                if (error) {
                    reject(error);
                }
                else {
                    console.log(JSON.stringify(body));
                    if (body.length == 1) {
                        resolve({ 'result': body[0].signedHash });
                    }
                    else {
                        resolve({ 'result': "FAIL" });
                    }
                }
            })
        })
    });
}
