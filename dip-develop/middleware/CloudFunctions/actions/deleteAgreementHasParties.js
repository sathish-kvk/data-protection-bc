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
 function main(params_in_agreementHasParties) {
     var ow = openwhisk();
     console.log("INPUT Parms>>>" + JSON.stringify(params_in_agreementHasParties));
 
     return new Promise(function (resolve, reject) {
         var agreementHasParties = params_in_agreementHasParties.agreementHasParties;
         var sysDetails = params_in_agreementHasParties.sysDetails;
         console.log("Agreement has party>>>\n" + JSON.stringify(agreementHasParties));
 
         var deleteActions = agreementHasParties.map(deleteAgreementHasParty.bind(null, agreementHasParties));
 
         function deleteAgreementHasParty(params, item, index) {
             var params = { agreementHasParty: item, sysDetails: sysDetails };
             var ret = ow.actions.invoke({ actionName: "common-ow/deleteAgreementHasParty", blocking: true, params: params });
             console.log("Inside map iterator>>> " + JSON.stringify(ret));
             return ret;
         } //end of deleteAgreementHasParty function
 
         return Promise.all(deleteActions).then(function (results) {
             console.log(results);
             var payload = [];
             for (var i = 0; i < results.length; i++) {
                 payload[i] = results[i].response.result;
             }
             return resolve({ result: payload });
         }).catch(err => {
             console.error('Failed to delete agreementHasParty', err)
             reject(err);
         }); //end of Promise.all
 
     }); //end of return new Promise
 }
 