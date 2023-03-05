/**
  *
  * main() will be invoked when you Run This Action
  *
  * @param OpenWhisk actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
function main(params_in_findProof) {
    var request = require("request");

    //For Hyperledger 1.0 we have exposed REST APIs using Compose-rest-server. Whcih is running in 
    //http://bc-hl.southeastasia.cloudapp.azure.com:3000/explorer
    //var url = "http://bc-hl.southeastasia.cloudapp.azure.com:3000/api/queries/selectProofAssetByHash?agreementHash=" + params_in_findProof.agreementHash;

    var url = "http://bc-hl.southeastasia.cloudapp.azure.com:3000/api/PublishProof?filter[include]=resolve&filter[where][proof.agreementHash]=" + params_in_findProof.agreementHash;

    var options = {
        method: 'GET',
        url: url,
        headers:
            {
                'cache-control': 'no-cache',
                'content-type': 'application/json',
                'accept': 'application/json'
            },
        json: true
    };

    return new Promise(function (resolve, reject) {
        console.log("Options>>>>>  " + JSON.stringify(options));
        request(options, function (error, response, body) {
            if (error) {
                reject(error);
            }
            else {
                console.log(JSON.stringify(body));
                body.forEach(function (element) {
                    delete element["$class"];
                    delete element.proof["$class"];
                    element.proof.partySignatures.forEach(function (partySignature) {
                        delete partySignature["$class"];
                        delete partySignature.party["$class"];
                    });
                });
                resolve({ "result": body });
            }
        })
    })
}