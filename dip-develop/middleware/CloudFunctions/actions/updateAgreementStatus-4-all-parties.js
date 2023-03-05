/**
  *
  * main() will be run when you invoke this action
  *
  * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */

 function main(updateStatus_4_all_parties_params) {
    console.log("UpdateStatus_4_all_parties_params Input >>>>>>>>>> "+ JSON.stringify(updateStatus_4_all_parties_params));
    var openwhisk = require('openwhisk');
    var ow = openwhisk();

    if (updateStatus_4_all_parties_params.agreementID == null || updateStatus_4_all_parties_params.agreementID == "") {
        return { "error": "AgreementID is empty" };
    }
    var agreementID = updateStatus_4_all_parties_params.agreementID;
    var params = {
        "agreementID": agreementID
    }
    return ow.actions.invoke({ name: 'common-ow/exportAgreement', blocking: true, result: true, params: params }).then(function (result) {
        console.log("Response from exportAgreement", JSON.stringify(result));

        var params = result.agreement;
        return ow.actions.invoke({ actionName: 'common-ow/prepare-JSON-4-All-System', blocking: true, result: true, params: params }).then(result => {
            console.log("Response from common-ow/prepare-JSON-4-All-System\n", JSON.stringify(result));

            var allParties = result.systemDetails_4_All_System;
            return new Promise(function(resolve, reject) {
                var updateAgreementStatusActions = allParties.map(updateStatusOnEachParty.bind(null));
                function updateStatusOnEachParty(item){
                    var ow = openwhisk(item.cloudFunctions.options);
                    var updateStatusParams = {
                        agreementID: agreementID, 
                        agreementStatus: "Live"
                    };
                    return new Promise(function (resolve, reject) {
                        return ow.actions.invoke({ actionName: "/"+ "_" + "/common-ow/updateAgreementStatus", blocking: true, result: true, params: updateStatusParams }).then(result => {
                            console.log('UpdateAgreementStatus on each Party - ' + item.partyName + '\n');
                            resolve(result);
                        }).catch(err => {
                            console.error('Failed to call updateAgreementStatus ', item.partyName, err)
                            reject(err);
                        });
                    }).catch(function (err) {
                        return err;
                    }); 
                }
                return Promise.all(updateAgreementStatusActions).then(function(results) {
                    console.log("UpdateStatus_4_all_parties result:\n", JSON.stringify(results));

                    resolve({result :results});
                }).catch(err => {
                    console.log('Failed to call UpdateAgreementStatusOnEachParty - Promise.all', err)
                    reject(err);
                });  
            }).catch(function (err) {
                console.error('Fail to return Promise', err)
                return { "error": err };
            });
        }).catch(function (err) {
            console.error('Fail to call prepare-JSON-4-All-System', err)
            return { "error": err };
        });
    }).catch(function (err) {
        console.error('Fail to call exportAgreement', err)
        return { "error": err };
    });
}