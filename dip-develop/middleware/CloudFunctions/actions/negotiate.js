/**
 *
 * main() will be invoked when you Run This Action
 *
 * @param OpenWhisk actions accept a single parameter, which must be a JSON object.
 *
 * @return The output of this action, which must be a JSON object.
 *
*/

function main(params_in_negotiate) {
    var openwhisk = require('openwhisk');
    var ow = openwhisk();
    var uuid = require('uuid');

    var initiatorPartySysDetails4Sql = {};
    var initiatorPartySysDetails4Cloudant = {};
    var allParties = [];
    var agreementID = params_in_negotiate.agreementID;
    var newParties = params_in_negotiate.parties;
    var initiatorParty = "";

    if(params_in_negotiate.initiatorParty){
        initiatorParty = params_in_negotiate.initiatorParty;
    }
    else{
        var ns = process.env.__OW_NAMESPACE;
        initiatorParty = ns.split("_")[1];
    }

    if (agreementID == null || agreementID == "") {
        return { "error": "Negotiate error: No AgreementID provided" };
    }

    if(params_in_negotiate.elements === undefined && params_in_negotiate.parties === undefined){
        return { "error": "Negotiate error: at least one Element or Party must be proposed" };
    }

    if(params_in_negotiate.elements === null || params_in_negotiate.elements === undefined){
        params_in_negotiate.elements = [];
    }

    if(params_in_negotiate.parties === null || params_in_negotiate.parties === undefined){
        params_in_negotiate.parties = [];
        newParties = []
    }

    console.log('AgreementID: ', agreementID);
    return ow.actions.invoke({ actionName: 'common-ow/digital-locker', blocking: true, result: true}).then(result => {
        console.log("Response from common-ow/digital-locker\n", JSON.stringify(result));
        initiatorPartySysDetails4Sql =  result.sysDetails4Sql;
        initiatorPartySysDetails4Cloudant =  result.sysDetails4Cloudant;
       
        return new Promise(function(resolve, reject) {
            var params = {
                agreementID: agreementID
            };
            return ow.actions.invoke({ actionName: 'common-ow/checkExistAgreement', blocking: true, result: true, params: params }).then(result => {
                console.log("Response from checkExistAgreement: ", JSON.stringify(result));
                if (result.exists === false){
                    return reject("Negotiate error: No Agreement found with AgreementID= " + agreementID);
                }
                var params = {
                    sysDetails: initiatorPartySysDetails4Sql,
                    agreementID: agreementID
                };
                return ow.actions.invoke({ actionName: 'common-ow/getAgreementStatus', blocking: true, result: true, params: params }).then(result => {
                    console.log("Response from getAgreementStatus: ", JSON.stringify(result));
                    if (result.agreementStatus !== 'Negotiate'){
                        return reject("Negotiate error: AgreementID= " + agreementID + " - status is " + result.agreementStatus.toUpperCase());
                    }
                    var exportParams = {
                        agreementID: agreementID
                    }
                    return ow.actions.invoke({ name: 'common-ow/exportAgreement', blocking: true, result: true, params: exportParams }).then(function (result) {
                        console.log("Response from exportAgreement", JSON.stringify(result));
                        var agreementFromExport = result.agreement;
                        allParties = result.agreement.parties.slice();
                        var currentElements = [];

                        //concat current elements with new elements
                        if(params_in_negotiate.elements.length > 0){
                            currentElements = result.agreement.elements.slice();
                            params_in_negotiate.elements.forEach(element => {
                                currentElements.push(element);
                            })
                        }

                        var params = {
                            elements: currentElements
                        };
                        return ow.actions.invoke({ actionName: 'common-ow/checkExistingTableHashElement', blocking: true, result: true, params: params }).then(result => {
                            console.log("Response from checkExistingTableHashElement\n", JSON.stringify(result));

                            if(result.result){
                                return {error: "Negotiate Error: Can't find table " + result.result + ".json referenced in rule: " + result.rule };
                            }

                            var params = { elements: currentElements };
                            return ow.actions.invoke({ actionName: 'common-ow/checkExistingReferenceElement', blocking: true, result: true, params: params }).then(result => {
                                console.log("Response from checkExistingReferenceElement\n", JSON.stringify(result));
                    
                                if(result.result){
                                    return { "error": "Negotiate error: Referenced Element: " + result.result  + " which is not present on the Agreement"};
                                }

                                var params = agreementFromExport;
                                return ow.actions.invoke({ actionName: 'common-ow/prepare-JSON-4-All-System', blocking: true, result: true, params: params }).then(result => {
                                    console.log("Response from common-ow/prepare-JSON-4-All-System>>>>\n", JSON.stringify(result));
        
                                    var otherParties = result.systemDetails_4_All_System.filter(x => x.partyName !== initiatorParty);
                                    console.log("Others Parties With Sysdetail>>>\n", JSON.stringify(otherParties));
                                    var getAgreementStatusActions = otherParties.map(getStatusOnEachParty.bind(null));
                                    function getStatusOnEachParty(item){
                                        var ow = openwhisk(item.cloudFunctions.options);
                                        var params = {sysDetails:item.sysDetails4Sql, agreementID: item.agreement.agreementID};
        
                                        return new Promise(function (resolve, reject) {
                                            return ow.actions.invoke({ actionName: "/"+ "_" +"/common-ow/getAgreementStatus", blocking: true, result: true, params: params }).then(result => {
                                                var itemInfo = {
                                                    partyName: item.partyName,
                                                    agreementStatus: result.agreementStatus
                                                }
                                                resolve(itemInfo);
                                            }).catch(err => {
                                                console.error('Failed to call getStatus on the party ', item.sysDetails4Sql, err)
                                                reject(err);
                                            });
                                        }).catch(function (err) {
                                            return err;
                                        });
                                    }
                                    return Promise.all(getAgreementStatusActions).then(function(results) {
                                        console.log("Call getStatus on other Parties result\n", JSON.stringify(results));
                                        
                                        for(var i = 0; i< results.length; i++){
                                            if(results[i].agreementStatus.toLowerCase() !== "negotiate"){
                                                return reject('Negotiate Error: Failed, because party ' + results[i].partyName + ' has incorrect Agreement status ' + results[i].agreementStatus + ' for Agreement ' + agreementID);
                                            }
                                        }
                                        console.log('========================================');
                                        console.log('ALL PARTIES HAVE NEGOTIAGED');
                                        if(newParties !== null && newParties.length > 0){
                                            console.log('========================================');
                                            console.log('EXTEND - NEW PARTIES AND NEW ELEMENTS');
                                            console.log('========================================');
                                            var checkExistPartyActions = newParties.map(checkExistParty.bind(null));
                                            function checkExistParty(item){
                                                var params = {
                                                    partyID : item.partyID
                                                };
                                                return new Promise(function (resolve, reject) {
                                                    return ow.actions.invoke({ actionName: "/"+ "_" + "/common-ow/checkExistParty", blocking: true, result: true, params: params }).then(result => {
                                                        var itemInfo = {
                                                            partyName: item.partyName,
                                                            exists: result.exists
                                                        }
                                                        resolve(itemInfo);
                                                    }).catch(err => {
                                                        console.error('Failed to call checkExistParty', item, err)
                                                        reject(err);
                                                    });
                                                }).catch(function (err) {
                                                    return err;
                                                });
                                            }
                                            return Promise.all(checkExistPartyActions).then(function(results) {
                                                console.log("CheckExistParty result\n", JSON.stringify(results));
        
                                                var hasInvalidParties = results.some(element => {
                                                    return element.exists === false;
                                                });
                                                if(hasInvalidParties){
                                                    var invalidParties = [];
                                                    results.forEach(ele =>{
                                                    if(ele.exists === false)
                                                        invalidParties.push(ele.partyName);
                                                    })
                                                    console.log('INVALID PARTIES:\n', invalidParties.join(','));
                                                    return reject("Party: " + invalidParties.join(',') + " not found");
                                                }
        
                                                function checkInputParty(currentParties, newParties){
                                                    var existingPartyNames = [];
                                                    newParties.forEach((newEle) => {
                                                        currentParties.forEach((currentEle) => {
                                                            if(newEle.partyID === currentEle.partyID){
                                                                existingPartyNames.push(newEle.partyName);
                                                            }
                                                        });
                                                    });
                                                    return existingPartyNames;
                                                }
                                                var existingParties = checkInputParty(allParties, newParties);
                                                if(existingParties.length > 0){
                                                    console.log('EXISTING PARTIES:\n', existingParties.join(','));
                                                    return reject("Input Parties have already existed on this agreement: " + existingParties.join(','));
                                                }
        
                                                var createAgreement4NewPartiesActions = newParties.map(createAgreement4NewParty.bind(null));
                                                function createAgreement4NewParty(item){
                                                    var params = {
                                                        partyname : item.partyName
                                                    };
                                                    return ow.actions.invoke({ actionName: "/"+ "_" + "/common-ow/get-targetsystem-details", blocking: true, result: true, params: params }).then(result => {
                                                    
                                                        var owItem = openwhisk(result.cloudFunctions.options)
                                                        var params = agreementFromExport;
                                                        params.sysDetails = result.sysDetails4Sql;
                                                        console.log("createAgreement for new Party - ", JSON.stringify(result.sysDetails4Sql.api_path));
                                                        return new Promise(function (resolve, reject) {
                                                            return owItem.actions.invoke({ actionName: "/"+ "_" + "/common-ow/createAgreement", blocking: true, result: true, params: params }).then(result => {
                                                                resolve(result);
                                                            }).catch(err => {
                                                                console.error('Failed to call createAgreement: ', item.partyName, err)
                                                                reject(err);
                                                            });
                                                        }).catch(err => {
                                                            return err;
                                                        });
                                                    }).catch(err => {
                                                        console.error('Failed to call get-targetsystem-details: ', item.partyName, err)
                                                        return err;
                                                    });
                                                }
                                                return Promise.all(createAgreement4NewPartiesActions).then(function(results) {
                                                    console.log("CreateAgreement4NewPartiesActions result\n", JSON.stringify(results));
            
                                                    newParties.forEach(element => {
                                                        allParties.push(element);
                                                    });
                                                    console.log("All Parties with new parties result:\n", JSON.stringify(allParties));
                                                    var prepareJsonParams = agreementFromExport;
                                                    prepareJsonParams.parties = allParties;
                                                    return ow.actions.invoke({ actionName: 'common-ow/prepare-JSON-4-All-System', blocking: true, result: true, params: prepareJsonParams }).then(result => {
                                                        console.log("Response from common-ow/prepare-JSON-4-All-System>>>>\n", JSON.stringify(result));
            
                                                        var extendErrors = [];
                                                        var allPartiesWithSysdetail = result.systemDetails_4_All_System;
                                                        var tempElements = params_in_negotiate.elements.slice();
                                                        tempElements.forEach(elementItem => {
                                                            elementItem.elementID = uuid.v1();
                                                            if(elementItem.elementRules !== undefined && elementItem.elementRules.length > 0){
                                                                elementItem.elementRules.forEach(ruleItem => {
                                                                    ruleItem.ruleID = uuid.v1();
                                                                });
                                                            }
                                                        });
                                                        params_in_negotiate.elements = tempElements;
                                                        var extendAgreementActions = allPartiesWithSysdetail.map(extendOnEachParty.bind(null));
                                                        function extendOnEachParty(item){
                                                            var ow = openwhisk(item.cloudFunctions.options);
                                                            var params = {
                                                                extendJson: params_in_negotiate,
                                                                sysDetails: item.sysDetails4Sql
                                                            };
                                                            return new Promise(function (resolve, reject) {
                                                                return ow.actions.invoke({ actionName: "/"+ "_" + "/common-ow/extend", blocking: true, result: true, params: params }).then(result => {
                                                                    console.log('ExtendOnEachParty - ' + item.partyName + ' success');
                                                                    if(result.addRuleErrors !== undefined && result.addRuleErrors.length > 0 ){
                                                                        extendErrors.push(result.addRuleErrors[0]);
                                                                        return reject(result.addRuleErrors[0]);
                                                                    }
                                                                    resolve(result);
                                                                }).catch(err => {
                                                                    console.error('Failed to call extendOnEachParty', item, err)
                                                                    reject(err);
                                                                });
                                                            }).catch((err) => {
                                                                return err;
                                                            });
                                                        }
                                                        return Promise.all(extendAgreementActions).then(function(results) {
                                                            console.log("ExtendAgreementActions result\n", JSON.stringify(results));

                                                            if(extendErrors.length > 0){
                                                                return reject(extendErrors[0]);
                                                            }
                                                            return resolve({result: "SUCCESS"});
                                                        }).catch(err => {
                                                            console.error('Failed to call ExtendAgreementActions - Promise.all', err)
                                                            reject(err);
                                                        });
                                                    }).catch(err => {
                                                        console.error('Failed to call prepare-JSON-4-All-System', err)
                                                        reject(err);
                                                    });
                                                }).catch(err => {
                                                    console.error('Failed to call createAgreement4NewPartiesActions - Promise.all', err)
                                                    reject(err);
                                                });
                                            }).catch(err => {
                                                console.error('Failed to call createAgreement4NewPartiesActions - Promise.all', err)
                                                reject(err);
                                            });
                                        }  
                                        else{
                                            console.log('========================================');
                                            console.log('EXTEND - ELEMENTS');
                                            console.log('========================================');
                                            var prepareJsonParams = agreementFromExport;
                                            return ow.actions.invoke({ actionName: 'common-ow/prepare-JSON-4-All-System', blocking: true, result: true, params: prepareJsonParams }).then(result => {
                                                console.log("Response from common-ow/prepare-JSON-4-All-System>>>>\n", JSON.stringify(result));
                
                                                var extendErrors = [];
                                                var allPartiesWithSysdetail = result.systemDetails_4_All_System;
                                                if(params_in_negotiate.elements.length > 0){
                                                    var tempElements = params_in_negotiate.elements.slice();
                                                    tempElements.forEach(elementItem => {
                                                        elementItem.elementID = uuid.v1();
                                                        if(elementItem.elementRules !== undefined && elementItem.elementRules.length > 0){
                                                            elementItem.elementRules.forEach(ruleItem => {
                                                                ruleItem.ruleID = uuid.v1();
                                                            });
                                                        }
                                                    });
                                                    params_in_negotiate.elements = tempElements;
                                                }
                                                var extendAgreementActions = allPartiesWithSysdetail.map(extendOnEachParty.bind(null));
                                                function extendOnEachParty(item){
                                                    var ow = openwhisk(item.cloudFunctions.options);
                                                    var params = {
                                                        extendJson: params_in_negotiate,
                                                        sysDetails: item.sysDetails4Sql
                                                    };
                                                    return new Promise(function (resolve, reject) {
                                                        return ow.actions.invoke({ actionName: "/"+ "_" + "/common-ow/extend", blocking: true, result: true, params: params }).then(result => {
                                                            console.log('ExtendOnEachParty - ' + item.partyName + ' success');
                                                            if(result.addRuleErrors !== undefined && result.addRuleErrors.length > 0 ){
                                                                extendErrors.push(result.addRuleErrors[0]);
                                                                return reject(result.addRuleErrors[0]);
                                                            }
                                                            resolve(result);
                                                        }).catch(err => {
                                                            console.error('Failed to call extendOnEachParty', item, err);
                                                            reject(err);
                                                        });
                                                    }).catch((err) => {
                                                        return err;
                                                    });
                                                }
                                                return Promise.all(extendAgreementActions).then(function(results) {
                                                    console.log("ExtendAgreementActions result\n", JSON.stringify(results));

                                                    if(extendErrors.length > 0){
                                                        return reject(extendErrors[0]);
                                                    }
                                                    return resolve({result: "SUCCESS"});
                                                }).catch(err => {
                                                    console.error('Failed to call ExtendAgreementActions - Promise.all', err);
                                                    reject(err);
                                                });
                                            }).catch(err => {
                                                console.error('Failed to call prepare-JSON-4-All-System', err);
                                                reject(err);
                                            });
                                        }
                                    }).catch(err => {
                                        console.error('Failed to call getAgreementStatusActions - Promise.all', err);
                                        reject(err);
                                    });
                                }).catch(err => {
                                    console.error('Failed to call prepare-JSON-4-All-System>>>>', err);
                                    reject(err);
                                }); 
                            }).catch(function (err) {
                                console.error('Failed to call checkExistingReferenceElement', err)
                                reject(err);
                            });
                        }).catch(function (err) {
                            console.error('Failed to call checkExistingTableHashElement', err)
                            reject(err);
                        });
                    }).catch(function (err) {
                        console.error('Failed to call exportAgreement', err);
                        reject(err);
                    });// End exportAgreement
                }).catch(function (err) {
                    console.error('Failed to call getAgreementStatus', err);
                    reject(err);
                }); //End getAgreementStatus
            }).catch(err => {
                console.error('Failed to call checkExistAgreement', err);
                reject(err);
            });
        }).catch(function (err) {
            console.log('========================================NEGOTIATE ERROR========================================');
            console.error(err)
            return { error: err };
        });
    }).catch(function (err) {
        console.error('Failed to call digital-locker', err)
        return { error: err };
    }); //End digital-locker  
}