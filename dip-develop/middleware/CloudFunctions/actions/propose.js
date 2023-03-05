/**
 *
 * main() will be invoked when you Run This Action
 *
 * @param OpenWhisk actions accept a single parameter, which must be a JSON object.
 *
 * @return The output of this action, which must be a JSON object.
 *
*/

function main(params_in_propose) {
    var openwhisk = require('openwhisk');
    var ow = openwhisk();
    
    var initiatorPartySysDetails4Sql = {};
    var initiatorPartySysDetails4Cloudant = {};
    var initiatorParty = "";
    var agreementID = params_in_propose.agreementID;
    var elementID = params_in_propose.elementID;
    var proposedValue = params_in_propose.proposedValue;  

    if(params_in_propose.initiatorParty){
        initiatorParty = params_in_propose.initiatorParty;
    }
    else{
        var ns = process.env.__OW_NAMESPACE;
        initiatorParty = ns.split("_")[1];
    }
    if (agreementID == null || agreementID == "") {
        return { "error": "AgreementID is empty" };
    }
    if (elementID == null || elementID == "") {
        return { "error": "ElementID is empty" };
    }
    if (proposedValue == null || proposedValue == "") {
        return { "error": "Proposed value is empty" };
    }
    
    console.log('AgreementID: ', agreementID);
    console.log('ElementID: ', elementID);
    console.log('ProposedValue: ', proposedValue);
    return ow.actions.invoke({ actionName: 'common-ow/digital-locker', blocking: true, result: true}).then(result => {
        console.log("Response from common-ow/digital-locker\n", JSON.stringify(result));
        initiatorPartySysDetails4Sql =  result.sysDetails4Sql;
        initiatorPartySysDetails4Cloudant =  result.sysDetails4Cloudant;

        var exportParams = { agreementID: agreementID };
        return ow.actions.invoke({ name: 'common-ow/exportAgreement', blocking: true, result: true, params: exportParams }).then(function (result) {
            console.log("Response from exportAgreement\n", JSON.stringify(result));

            var params = result.agreement;
            var agreementName = result.agreement.agreementName;
            var tableHashElements = [];
            result.agreement.elements.forEach(element => {
                if(element.elementType === "tableHash"){
                    tableHashElements.push(element.elementName.split('.')[0]);
                }
            });
            console.log('TableHash Elements: ', tableHashElements);
            
            return ow.actions.invoke({ actionName: 'common-ow/prepare-JSON-4-All-System', blocking: true, result: true, params: params }).then(result => {
                console.log("Response from common-ow/prepare-JSON-4-All-System\n", JSON.stringify(result));
                var allParties = result.systemDetails_4_All_System;
                var otherParties = result.systemDetails_4_All_System.filter(x => x.partyName !== initiatorParty);

                var params = {
                    agreementID : agreementID,
                    elementID : elementID,
                    proposedValue : proposedValue
                };
                return ow.actions.invoke({ actionName: 'common-ow/validate', blocking: true, result: true, params: params }).then(result => {
                    console.log('Validate on initiatorParty result\n', JSON.stringify(result));

                    var updatedJsonFromValidate = result.agreement;
                    var params = {
                        agreementID : agreementID,
                        elementID : elementID,
                        proposedValue : proposedValue,
                        parties: otherParties
                    };
                    return ow.triggers.invoke({ triggerName: 'trigger-4-update-multiple-parties', params: params}).then(result => {
                        console.log('Call trigger-4-update-multiple-parties done');

                        var consensusParams = {
                            exportedJson: updatedJsonFromValidate, 
                            initiatorParty: initiatorParty 
                        };
                        return ow.actions.invoke({ actionName: "common-ow/consensus", blocking: true, result: true, params: consensusParams }).then(result => {
                            console.log('Consensus on initiatorParty - ' +  initiatorParty + ' result\n', JSON.stringify(result));

                            if(result.agreementHash) {
                                var hashFromConsensus = result.agreementHash;
                                console.log("HASH FROM CONSENSUS >>>>>>>>>>\n" + hashFromConsensus);

                                var signActions = allParties.map(signEachParty.bind(null));
                                function signEachParty(item){
                                    var ow = openwhisk(item.cloudFunctions.options);
                                    var params = {
                                        agreementID : agreementID,
                                        unsignedHash : hashFromConsensus
                                    };
                                    return new Promise(function (resolve, reject) {
                                        return ow.actions.invoke({ actionName: "/"+ "_" +"/common-ow/sign", blocking: true, result: true, params: params }).then(result => {
                                            console.log('Signed on each party - '+ item.partyName);
                                            resolve(result);
                                        }).catch(err => {
                                            console.error('Failed to call sign on party ',  item.partyName, err);
                                            reject(err);
                                        });
                                    }).catch(function (err) {
                                        return err;
                                    });
                                }
                                return Promise.all(signActions).then(function(results) {
                                    console.log('Sign on all parties result >>>>>>>>>>\n', JSON.stringify(results));

                                    var params = {
                                        agreementID : agreementID,
                                        elementID: elementID,
                                        agreementHash : hashFromConsensus
                                    };
                                    return ow.actions.invoke({ actionName: 'common-ow/proof', blocking: false, result: true, params: params }).then(result => {
                                        console.log('Call Proof done >>>>>>>>>>', JSON.stringify(result));
                                    
                                        var currentElement = updatedJsonFromValidate.elements.find(x => x.elementID === elementID);
                                        if(currentElement.elementType === "documentHash"){
                                            var params = {
                                                agreementID : agreementID,
                                                elementID : elementID,
                                                parties: otherParties
                                            };
                                            return ow.triggers.invoke({ triggerName: 'trigger-4-add-document-multiple-parties', params: params}).then(result => {
                                                console.log('Call trigger-4-add-document-multiple-parties done');
                                                
                                                return  { result: updatedJsonFromValidate };
                                            }).catch(err => {
                                                console.error('Failed to call trigger-4-add-document-multiple-parties\n', err);
                                                return { "error": err };
                                            });
                                        }
                                        return  { result: updatedJsonFromValidate };
                                    });
                                });
                            }
                            else{
                                console.log('HASH FROM CONSENSUS IS EMPTY');
                                return { "error": "ERROR IN CONSENSUS - HASH IS EMPTY" };
                            }
                        }).catch(err => {
                            console.error('Failed to call consensus on initiatorParty: ', initiatorParty + '\n', err);
                            return { "error": err };
                        });
                    }).catch(err => {
                        console.error('Failed to call trigger-4-update', err)
                        return { "error": err };
                    });
                }).catch(err => {
                    if(err.error.response.result.error){
                        return { "error": err.error.response.result.error };
                    }
                    console.error('Failed to call validate on: ', + initiatorParty + '\n', err)
                    return { "error": err };
                }); 
            }).catch(function (err) {
                console.error('Failed to call prepare-JSON-4-All-System', err)
                return { "error": err };
            });// End prepare-JSON-4-All-System
        }).catch(function (err) {
            console.error('Failed to call exportAgreement', err)
            return { "error": err };
        });// End exportAgreement
    }).catch(function (err) {
        console.error('Failed to digital-locker', err)
        return { "error": err };
    }); // End digital-locker  
}