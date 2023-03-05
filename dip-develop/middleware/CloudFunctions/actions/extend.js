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
var uuid = require('uuid');

function main(params_for_extend) {
    var ow = openwhisk();
    var inJSON = params_for_extend.extendJson;
    var sysDetails = params_for_extend.sysDetails;
    var agreementID = inJSON.agreementID;
    console.log("Extended JSON Input>>>> " + JSON.stringify(inJSON));
    var outJSON = {};
    var outElements = [];
    var elements = inJSON.elements;
    console.log('========================================');
    console.log("Input Elements\n" + JSON.stringify(elements));

    for (var i = 0; i < elements.length; i++) {
        var outRules = [];
        var elementUUID = "";
        if (elements[i].elementID === undefined || elements[i].elementID === "") {
            elementUUID = uuid.v1();
        }
        else {
            elementUUID = elements[i].elementID;
        }

        if (elements[i].elementRules !== undefined) {
            for (var j = 0; j < elements[i].elementRules.length; j++) {
                var ruleUUID = uuid.v1();
                //Check ruleID is exist or not
                var ruleUUID = "";
                if (elements[i].elementRules[j].ruleID === undefined || elements[i].elementRules[j].ruleID === "") {
                    ruleUUID = uuid.v1();
                }
                else {
                    ruleUUID = elements[i].elementRules[j].ruleID;
                }
                outRules.push({
                    ruleID: ruleUUID,
                    ruleType: elements[i].elementRules[j].ruleType,
                    ruleText: elements[i].elementRules[j].ruleText,
                    fk_ElementID: elementUUID
                });
            }
        }
        // Add element
        outElements.push({
            elementID: elementUUID,
            elementName: elements[i].elementName,
            elementType: elements[i].elementType,
            elementValue: elements[i].elementValue,
            writeOnce: elements[i].writeOnce,
            fk_agreementID: agreementID,
            element_parent_elementID: null,
            elementRules: outRules
        });
    }
    console.log('========================================');
    console.log("Output Elements\n" + JSON.stringify(outElements));
    outJSON = { parties: inJSON.parties, elements: outElements };

    var params = { 
        sysDetails: sysDetails, 
        agreementID: agreementID, 
        parties: outJSON.parties 
    };
    console.log('========================================');
    console.log("addPartiesToAgreement Params\n" + JSON.stringify(params));
    return ow.actions.invoke({ actionName: 'common-ow/addPartiesToAgreement', blocking: true, result: true, params: params }).then(result => {
        console.log('========================================');
        console.log('Result of addPartiesToAgreement\n', JSON.stringify(result));

        if (result.errors.length > 0) {
            console.error('Error from addPartiesToAgreement', error);
            return { "error": result.errors };
        }

        if(outJSON.elements.length > 0){

            var addRuleErrors = [];
            var originalElements = outJSON.elements.slice();
            var checkExistElementActions = originalElements.map(checkExistEachElement.bind(null));
            function checkExistEachElement(item){
                var params = {
                    agreementID: agreementID,
                    elementName: item.elementName
                };
                return new Promise(function (resolve, reject) {
                    return ow.actions.invoke({ actionName: 'common-ow/checkExistElement', blocking: true, result: true, params: params }).then(result => {
                        console.log('========================================');
                        console.log('RESULT OF checkExistElement - Element: ', item.elementName + '\n', JSON.stringify(result));
                        if (result.result.length > 0) {
                            console.log("ADD RULES ON EXISTING ELEMENT: ", item.elementName);
                            console.log("INPUT ELEMENT:\n", JSON.stringify(item));

                            var existingElement = result.result[0];
                            var newElementRules = item.elementRules;
                            if(newElementRules.length === 0){
                                console.log('>>>>>>>>>>EMPTY RULES');
                                return resolve('EMPTY RULES');
                            }
                            newElementRules.forEach(x => { x.fk_ElementID = existingElement.elementID;});
                            var params = { 
                                sysDetails: sysDetails, 
                                elementRules: newElementRules
                            };
                            console.log("INPUT ELEMENT - UPDATE fk_ElementID on Rules:\n", JSON.stringify(item));
                            return ow.actions.invoke({ actionName: 'common-ow/addRules', blocking: true, result: true, params: params }).then(result => {
                                console.log('================================================================================');
                                console.log('Result of addRules: ', item.elementName + '\n', JSON.stringify(result));
                                if (result.errors.length > 0) {
                                    console.log("addRules error", result.errors);
                                    addRuleErrors.push(result.errors[0]);
                                    return reject(result.errors);
                                }
                                resolve(result);
                            }).catch(err => {
                                console.error('Failed to call addRules', err);
                                var param = {
                                    sysDetails: sysDetails,
                                    agreementID: agreementID,
                                    elementRules: elementRules,
                                    parties: outJSON.parties
                                }
                                extendRollback(param);
                                console.log("The rules fail to insert. Rollback has been run.");
                                reject(err);
                            });
                        } 
                        else {
                            console.log('========================================');
                            console.log("ADD NEW ELEMENTS AND NEW RULES ELEMENT: ", item.elementName);
                            console.log("INPUT ELEMENT\n" + JSON.stringify(item));

                            // Insert elements
                            var newElementArr = [];
                            newElementArr.push(item);
                            var params = { 
                                sysDetails: sysDetails, 
                                elements: newElementArr
                            };
                            return ow.actions.invoke({ actionName: 'common-ow/addElements', blocking: true, result: true, params: params }).then(result => {
                                console.log('================================================================================');
                                console.log('Result of addElements: ', item.elementName + '\n', JSON.stringify(result));
                                // return if any errors
                                if (result.errors.length > 0) {
                                    console.log("addElements error", result.errors);
                                    return reject(result.errors);
                                }
                                if(item.elementRules.length === 0){
                                    console.log('>>>>>>>>>>EMPTY RULES');
                                    return resolve('EMPTY RULES');
                                }
                                var params = { 
                                    sysDetails: sysDetails, 
                                    elementRules: item.elementRules
                                };
                                // Insert rules
                                return ow.actions.invoke({ actionName: 'common-ow/addRules', blocking: true, result: true, params: params }).then(result => {
                                    console.log('================================================================================');
                                    console.log('Result of addRules: ', item.elementName + '\n', JSON.stringify(result));
                                    if (result.errors.length > 0) {
                                        console.log("addRules error", result.errors);
                                        reject(result.errors);
                                    }
                                    resolve(result);
                                }).catch(err => {
                                    console.error('Failed to call addRules', err);
                                    var param = {
                                        sysDetails: sysDetails,
                                        agreementID: agreementID,
                                        elementRules: elementRules,
                                        parties: outJSON.parties
                                    }
                                    extendRollback(param);
                                    console.log("The rules fail to insert. Rollback has been run.");
                                    reject(err);
                                });
                            }).catch(err => {
                                console.error('Failed to insert elements', err)
                                // delete elements
                                var param = {
                                    sysDetails: sysDetails,
                                    elements: newElementArr,
                                    agreementID: agreementID,
                                    parties: outJSON.parties
                                }
                                extendRollback(param);
                                console.log("The rules fail to insert. Rollback has been run.");
                                reject(err);
                            });
                        }
                    }).catch(err => {
                        console.error('Failed to call checkExistElement', err);
                        reject(err);
                    });
                }).catch((err) => {
                    return err;
                });
            }

            return Promise.all(checkExistElementActions).then(function(results) {
                console.log('========================================RESULT OF EXTEND========================================\n', JSON.stringify(results));
                if(addRuleErrors.length > 0){
                    console.log(JSON.stringify(addRuleErrors));
                    return { addRuleErrors: addRuleErrors }
                }
                return { agreementID: agreementID };
            });
        }
        
        return { agreementID: agreementID };
    }).catch(err => {
        console.error('Failed to call addPartiesToAgreement', err)
        return err;
    });
}

function extendRollback(params_for_extendRollback) {
    var ow = openwhisk();
    var sysDetails = params_for_extendRollback.sysDetails;
    var parties = params_for_extendRollback.parties;
    var agreementID = params_for_extendRollback.agreementID;
    // delete rules
    if (params_for_extendRollback.elementRules && params_for_extendRollback.elements) {
        var elementRules = params_for_extendRollback.elementRules;
        var elements = params_for_extendRollback.elements;

        console.log("All rules >>> " + JSON.stringify(elementRules));
        var params = { sysDetails: sysDetails, elementRules: elementRules };
        return ow.actions.invoke({ actionName: 'common-ow/deleteRules', blocking, result, params }).then(result => {
            console.log('Result of deleteRules>>>>', JSON.stringify(result));
            // delete elements
            var params = { sysDetails: sysDetails, elements: elements };
            return ow.actions.invoke({ actionName: 'common-ow/deleteElements', blocking, result, params }).then(result => {
                console.log('Result of deleteElements>>>>', JSON.stringify(result));
            }).catch(err => {
                console.error('Failed to deleteElements details>>>>', err)
                return { "error": err };
            });
        }).catch(err => {
            console.error('Failed to deleteRules details>>>>', err)
            return { "error": err };
        });
    } else if (params_for_extendRollback.elements) {
        var elements = params_for_extendRollback.elements;
        // delete elements
        var params = { sysDetails: sysDetails, elements: elements };
        return ow.actions.invoke({ actionName: 'common-ow/deleteElements', blocking, result, params }).then(result => {
            console.log('Result of deleteElements>>>>', JSON.stringify(result));
        }).catch(err => {
            console.error('Failed to deleteElements details>>>>', err)
            return { "error": err };
        });
    }
    // delete agreement_has_party
    var agreementHasParties = [];
    for (var i = 0; i < parties.length; i++) {
        agreementHasParties.push({
            agreement_agreementID: agreementID,
            party_partyID: parties.patyID
        });
    }
    var params = { sysDetails: params_for_extendRollback.sysDetails, agreementHasParties: agreementHasParties };

    return ow.actions.invoke({ actionName: 'common-ow/deleteAgreementHasParties', blocking, result, params }).then(result => {
        console.log('Result of deleteAgreementHasParty>>>>', JSON.stringify(result));
    }).catch(err => {
        console.error('Failed to deleteAgreementHasParties details>>>>', err);
        return { "error": err };
    });
}