/**
  *
  * main() will be invoked when you Run This Action
  *
  * @param OpenWhisk actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
function main(params_in_getParties) {
    console.log("Input params params_in_getParties>> " + JSON.stringify(params_in_getParties));
    var request = require("request");
    var openwhisk = require('openwhisk');
    var ow = openwhisk();
    return ow.actions.invoke({ actionName: 'common-ow/digital-locker', blocking: true, result: true }).then(result => {
        params_in_getParties.sysDetails = result.sysDetails4Sql;
        var url = params_in_getParties.sysDetails.api_protocol + "://" + params_in_getParties.sysDetails.api_hostname + params_in_getParties.sysDetails.api_path + '/parties';
        var options = {
            method: 'GET',
            url: url,
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                'x-ibm-client-secret': params_in_getParties.sysDetails.client_secret,
                'x-ibm-client-id': params_in_getParties.sysDetails.client_id
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
                    resolve({ 'parties': body });
                }
            })
        })
    });
}