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
    var uuid = require('uuid');
    
    var agreementID = params_in_proof.agreementID;
    var inputHash = params_in_proof.agreementHash;
    var elementID = null;
    if (params_in_proof.elementID !== undefined){
        elementID = params_in_proof.elementID;
    }

    var allParties = [];
    var allPartiesWithSignedHash = [];
    var proofAfterHash = "";

    if (agreementID == null || agreementID == "") {
        return { "error": "AgreementID is empty" };
    }

    console.log('AgreementID: ', agreementID);
    console.log('ElementID: ', elementID);
    console.log('Input Hash: ', inputHash);
    return ow.actions.invoke({ actionName: 'common-ow/digital-locker', blocking: true, result: true }).then(result => {
        console.log("Response from common-ow/digital-locker\n", JSON.stringify(result));

        var exportParams = {
            "agreementID": agreementID
        }
        return ow.actions.invoke({ name: 'common-ow/exportAgreement', blocking: true, result: true, params: exportParams }).then(function (result) {
            console.log("Response from exportAgreement\n", JSON.stringify(result));
            allParties = result.agreement.parties;

            var prepareJsonParams = { 
                parties: allParties 
            };
            return ow.actions.invoke({ name: 'common-ow/prepare-JSON-4-All-System', blocking: true, result: true, params: prepareJsonParams }).then(function (result) {
                console.log("Response from prepare-JSON-4-All-System\n", JSON.stringify(result));

                var allPartiesWithSysdetailInfo = result.systemDetails_4_All_System;
                return new Promise(function(resolve, reject) {
                    var getSignedHashActions = allPartiesWithSysdetailInfo.map(getSignedHashOnEachParty.bind(null));
                    function getSignedHashOnEachParty(item){
                        var ow = openwhisk(item.cloudFunctions.options);
                        var getSignedHashParams = {
                                agreementID : agreementID,
                                unsignedHash : inputHash
                        };
                        return new Promise(function (resolve, reject) {
                            return ow.actions.invoke({ actionName: "/"+ "_" +"/common-ow/getSignedHash", blocking: true, result: true, params: getSignedHashParams }).then(result => {
                                var signedHashItem = {
                                    partyID : allParties.find(x => x.partyName === item.partyName).partyID,
                                    partyName : item.partyName,
                                    partySignature: result.result
                                };
                                allPartiesWithSignedHash.push(signedHashItem);
                                resolve(result);
                            }).catch(err => {
                                console.error('Failed to call getSignedHash on party ',  JSON.stringify(item.partyName), err)
                                reject(err);
                            });
                        }).catch(function (err) {
                            return err;
                        });
                    }
                    return Promise.all(getSignedHashActions).then(function(results) {
                        console.log("getSignedHash on all parties result\n", JSON.stringify(results));

                        var hasFailResponse = results.some(element => {
                            return element.result.toLowerCase() === "fail";
                        });
    
                        if (hasFailResponse){
                            console.log("NO MATCH FOR HASH : ", inputHash);
                            resolve({result: results});
                        }
                        else{
                            console.log("ALL PARTIES HAVE SIGNED >>>>>>>>>>");
                            var getSignedHashAllParties = results;
                            var params4Proof = {
                                allParties : allParties,
                                allPartiesWithSignedHash : allPartiesWithSignedHash,
                                allPartiesWithSysdetailInfo : allPartiesWithSysdetailInfo,
                                agreementID : agreementID,
                                elementID : elementID,
                                inputHash : inputHash
                            };
                            return ow.triggers.invoke({ triggerName: 'trigger-4-proof-all-parties', params: params4Proof}).then(result => {
                                console.log("Call trigger-4-proof-all-parties done ", JSON.stringify(result));

                                resolve({result: getSignedHashAllParties});
                            }).catch(err => {
                                console.error('Failed to trigger-4-proof-all-parties>>>>', err)
                                reject(err);
                            });
                        }
                    }).catch(err => {
                        console.error('Failed to call getSignedHash on parties in Promise.all', err)
                        reject(err);
                    });
                }).catch(function (err) {
                    console.error('Fail to return Promise', err)
                    return { "error": err };
                });
            }).catch(err => {
                console.error('Failed to call prepare-JSON-4-All-System', err)
                return { "error": err };
            }); //End prepare-JSON-4-Individual-System
        }).catch(function (err) {
            console.error('Failed to call exportAgreement', err)
            return { "error": err };
        });// End exportAgreement   
    }).catch(function (err) {
        console.error('Failed to call digital-locker', err)
        return { "error": err };
    });// End digital-locker   
}