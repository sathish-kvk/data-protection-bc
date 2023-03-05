/**
  *
  * main() will be run when you invoke this action
  *
  * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */

 function main(params_proof_4_all_parties) {
    console.log("Cloud function params_proof_4_all_parties with input params >> "+ JSON.stringify(params_proof_4_all_parties));
    var uuid = require('uuid');
    var openwhisk = require('openwhisk');
    var ow = openwhisk();

    proofID = uuid.v1();
    console.log("ProofID: ", proofID);
    var allParties = params_proof_4_all_parties.allParties;
    var allPartiesWithSignedHash = params_proof_4_all_parties.allPartiesWithSignedHash;
    var allPartiesWithSysdetailInfo = params_proof_4_all_parties.allPartiesWithSysdetailInfo;
    var agreementID = params_proof_4_all_parties.agreementID;
    var elementID = params_proof_4_all_parties.elementID;
    var inputHash = params_proof_4_all_parties.inputHash;
    
    return new Promise(function(resolve, reject) {

        var insertProofActions = allPartiesWithSysdetailInfo.map(insertProofOnEachParty.bind(null));
        function insertProofOnEachParty(item){
            var ow = openwhisk(item.cloudFunctions.options);

            var insertProofParams = {
                proofID: proofID,
                fk_agreementID: agreementID,
                fk_elementID: elementID,
                proofBeforeHash: "",
                proofAfterHash: inputHash
            };
            return new Promise(function (resolve, reject) {
                return ow.actions.invoke({ actionName: "/"+ "_" +"/common-ow/insertProof", blocking: true, result: true, params: insertProofParams }).then(result => {
                    resolve(result);
                }).catch(err => {
                    console.error('Failed to call insertProof', item.sysDetails4Sql, err)
                    reject(err);
                });
            }).catch(function (err) {
                return err;
            });
        }

        return Promise.all(insertProofActions).then(function(results) {
            console.log("insertProofActions on all Parties result \n", JSON.stringify(results));
            
            var insertAssentActionsAll = [];
            allPartiesWithSysdetailInfo.forEach(function(partyDetail) {
                var insertAssentActions = allParties.map(insertAssentOnEachParty.bind(null, partyDetail.cloudFunctions.options));
                insertAssentActionsAll = insertAssentActionsAll.concat(insertAssentActions);
                function insertAssentOnEachParty(sysDetailOptions, item){
                    var ow = openwhisk(sysDetailOptions);

                    var partyID = allParties.find(x => x.partyName === item.partyName).partyID;
                    var assent_signedHash = allPartiesWithSignedHash.find(x => x.partyName === item.partyName).partySignature;
                    var insertAssentParams = {
                        fk_proofID: proofID,
                        fk_partyID: partyID,
                        assent_signedHash: assent_signedHash 
                    };
                    return new Promise(function (resolve, reject) {
                        return ow.actions.invoke({ actionName: "/"+ "_" +"/common-ow/insertAssent", blocking: true, result: true, params: insertAssentParams }).then(result => {
                            resolve(result);
                        }).catch(err => {
                            console.error('Failed to call insertAssent', JSON.stringify(item.sysDetails4Sql), err)
                            reject(err);
                        });
                    }).catch(function (err) {
                        return err;
                    });
                }
            });

            return Promise.all(insertAssentActionsAll).then(function(results) {
                console.log("insertAssentActions on all Parties result \n", JSON.stringify(results));

                var publishProofParams = {
                    proofID : proofID,
                    agreementHash : inputHash,
                    partiesWithSignedHash : allPartiesWithSignedHash
                };
                return ow.actions.invoke({ actionName: 'common-ow/publishProof', blocking: true, result: true, params: publishProofParams }).then(result => {
                    console.log("Response from common-ow/publishProof\n", JSON.stringify(result));
                    var transactionID = result.transactionId;

                    var updateTransactionIDsActions = allPartiesWithSysdetailInfo.map(updateTransactionIdOnEachParty.bind(null));
                    function updateTransactionIdOnEachParty(item){
                        var ow = openwhisk(item.cloudFunctions.options);
                        var params = {
                            proofID: proofID,
                            transactionID: transactionID
                        };
                        return new Promise(function (resolve, reject) {
                            return ow.actions.invoke({ actionName: "/"+ "_" +"/common-ow/recordTxnID", blocking: true, result: true, params: params }).then(result => {
                                resolve(result);
                            }).catch(err => {
                                console.error('Failed to call recordTxnID', err)
                                reject(err);
                            });
                        }).catch(function (err) {
                            return err;
                        });
                    }

                    return Promise.all(updateTransactionIDsActions).then(function(results) {
                        console.log("recordTxnID on all Parties result\n", JSON.stringify(results));
                        resolve({result :results});
                    }).catch(err => {
                        console.error('Failed to call recordTxnID on other parties in Promise.all', err)
                        reject(err);
                    }); //end of Promise all - recordTxnID
                }).catch(function (err) {
                    console.error('Failed to call publishProof', err)
                    reject(err);
                });//end of publishProof
            }).catch(err => {
                console.error('Failed to call insertAssent on other parties in Promise.all', err)
                reject(err);
            }); //end of Promise all - insertAssent
        }).catch(err => {
            console.error('Failed to call insertAssent on other parties in Promise.all', err)
            reject(err);
        }); //end of Promise all - insertProof
    }).catch(function (err) {
        console.error('Fail to return Promise', err)
        return { "error": err };
    });
}