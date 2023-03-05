/**
  *
  * main() will be invoked when you Run This Action
  *
  * @param OpenWhisk actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
var openwhisk = require('openwhisk');
function main(params_in_insertPartiesToAgreement) {
    var ow = openwhisk();
    console.log("INPUT Parms>>>" + JSON.stringify(params_in_insertPartiesToAgreement));

    return new Promise(function (resolve, reject) {
        var agreementID = params_in_insertPartiesToAgreement.agreementID;
        var parties = params_in_insertPartiesToAgreement.parties;
        var sysDetails = params_in_insertPartiesToAgreement.sysDetails;
        console.log("Parties >>>\n" + JSON.stringify(parties));

        var insertActions = parties.map(addPartyToAgreement.bind(null, sysDetails));

        function addPartyToAgreement(params, item, index) {
            console.log("Parameters to addPartyToAgreement >>>" + " name: " + item.partyName);
            var params = { sysDetails: params, agreementID: agreementID, partyName: item.partyName };
            // var ret = ow.actions.invoke({ actionName: "common-ow/addPartyToAgreement", blocking: true, params: params });
            // console.log("Inside map iterator>>> " + JSON.stringify(ret));
            // return ret;
            return new Promise(function (resolve, reject) {
                return ow.actions.invoke({ actionName: "common-ow/addPartyToAgreement", blocking: true, result: true, params: params }).then(result => {
                    resolve(result);
                }).catch(err => {
                    reject(err);
                });
            }).catch(function (err) {
                return err;
            });
        } //end of addPartyToAgreement function

        return Promise.all(insertActions).then(function (results) {
            console.log(results);
            var payload = [];
            var errors = [];
            for (var i = 0; i < results.length; i++) {
                if (results[i].error !== undefined) {
                    errors.push(results[i].error.response.result.error);
                }
                else {
                    payload.push(results[i]);
                }
            }
            return resolve({ parties: payload, errors: errors });
        }).catch(err => {
            console.error('Failed to addPartiesToAgreement', err)
            reject(err);
        }); //end of Promise.all

    }); //end of return new Promise
}