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
    var openwhisk = require('openwhisk');
    var ow = openwhisk();

    var agreementID = params_in_proof.agreementID;

    if (agreementID == null || agreementID == "") {
        return { "error": "AgreementID is empty" };
    }
    console.log('AgreementID: ', agreementID);

    var params = { agreementID: agreementID };
    return ow.actions.invoke({ name: 'common-ow/exportAgreement', blocking: true, result: true, params: params }).then(function (result) {
        console.log('========================================');
        console.log('Response from exportAgreement\n', JSON.stringify(result));
        
        var params = { parties: result.agreement.parties };
        return ow.actions.invoke({ name: 'common-ow/prepare-JSON-4-All-System', blocking: true, result: true, params: params }).then(function (result) {
            console.log('========================================');
            console.log('Response from prepare-JSON-4-All-System\n', JSON.stringify(result));

            var allPartiesInfo = result.systemDetails_4_All_System;
            return new Promise(function(resolve, reject) {
                var getStatusActions = allPartiesInfo.map(getEach.bind(null));
                function getEach(item){
                    var ow = openwhisk(item.cloudFunctions.options);
                    var params = {
                        sysDetails : item.sysDetails4Sql,
                        agreementID : agreementID
                    };
                    return new Promise(function (resolve, reject) {
                        return ow.actions.invoke({ actionName: "/"+ "_" +"/common-ow/getAgreementStatus", blocking: true, result: true, params: params }).then(result => {
                            var party = {
                                partyName: item.partyName,
                                partyStatus: result.agreementStatus
                            };
                            resolve(party);
                        }).catch(err => {
                            console.error('Failed to call getAgreementStatus on ',  item.partyName, err);
                            reject(err);
                        });
                    }).catch(function (err) {
                        return err;
                    });
                }

                return Promise.all(getStatusActions).then(function(results) {
                    console.log('========================================');
                    console.log('Status on all parties result\n', JSON.stringify(results));
                    resolve({result: results});
                        
                }).catch(err => {
                    console.error('Failed to call getStatusActions ', err)
                    reject(err);
                });
            }).catch(function (err) {
                console.error('Fail to call getStatusActions', err)
                return { error: err };
            });
        }).catch(err => {
            console.error('Failed to call prepare-JSON-4-All-System', err)
            return { error: err };
        }); 
    }).catch(function (err) {
        console.error('Failed to call exportAgreement', err)
        return { error: err };
    });
}