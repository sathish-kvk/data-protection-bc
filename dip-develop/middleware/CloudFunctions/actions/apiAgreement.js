/**
  *
  * main() will be invoked when you Run This Action
  *
  * @param OpenWhisk actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  * action will be insert or ???
  */

function main(params_in_apiagreement) {
    var request = require("request");
    var METHOD_POST = "POST";
    var METHOD_GET = "GET";
    var METHOD_PUT = "PUT";
    var apiUrl = params_in_apiagreement.sysDetails.api_protocol + "://" +
        params_in_apiagreement.sysDetails.api_hostname +
        params_in_apiagreement.sysDetails.api_path + '/agreements';
    var agreement = params_in_apiagreement.agreement;
    var apiMethod = "";
    var apiBody = "";
    var apiHeaders = {
        accept: 'application/json',
        'content-type': 'application/json',
        'x-ibm-client-secret': params_in_apiagreement.sysDetails.client_secret,
        'x-ibm-client-id': params_in_apiagreement.sysDetails.client_id
    };
    var apiOption;
    if (params_in_apiagreement.action == "insert") {
        apiOption = {
            method: METHOD_POST,
            url: apiUrl,
            headers: apiHeaders,
            body: {
                "agreementID": agreement.agreementID,
                "agreementHash": agreement.agreementHash,
                "agreementName": agreement.agreementName,
                "agreementChannelID": agreement.agreementChannelID,
                "agreementStatus": agreement.agreementStatus,
                "lastProofID": agreement.lastProofID
            },
            json: true
        };
    } else if(params_in_apiagreement.action == "update") {
        apiOption = {
            method: METHOD_PUT,
            url: apiUrl,
            headers: apiHeaders,
            body: {
                "agreementID": agreement.agreementID,
                "agreementHash": agreement.agreementHash,
                "agreementName": agreement.agreementName,
                "agreementChannelID": agreement.agreementChannelID,
                "agreementStatus": agreement.agreementStatus,
                "lastProofID": agreement.lastProofID
            },
            json: true
        };

    }

    return new Promise(function (resolve, reject) {
        request(apiOption, function (error, response, body) {
            if (error) {
                reject(error);
            }
            else {
                //console.log(JSON.stringify(body));
                if (body.error) {
                    resolve(body)
                }
                else {
                    resolve({ "result": body });
                }
            }
        })
    })
}