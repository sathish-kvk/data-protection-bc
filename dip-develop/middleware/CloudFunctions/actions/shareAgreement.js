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
function main(params_in_shareAgreement) {
    var ow = openwhisk();
    var sysDetails4Sql;
    var sysDetails4Cloudant;
    var agreementID = "";
    var agreementName = "";
    var initiatorParty = "";

    if(params_in_shareAgreement.initiatorParty){
        initiatorParty = params_in_shareAgreement.initiatorParty;
    }
    else{
        var ns = process.env.__OW_NAMESPACE;
        initiatorParty = ns.split("_")[1];
    }

    if (params_in_shareAgreement.elements === undefined || params_in_shareAgreement.elements.length === 0) {
        return { "error": "Share error: This agreement doesn't have any elements" };
    }

    return ow.actions.invoke({ actionName: 'common-ow/digital-locker', blocking: true, result: true }).then(result => {
        console.log("Response from common-ow/digital-locker\n", JSON.stringify(result));
        sysDetails4Sql = result.sysDetails4Sql;
        sysDetails4Cloudant = result.sysDetails4Cloudant;

        var params = { elements: params_in_shareAgreement.elements };
        return ow.actions.invoke({ actionName: 'common-ow/checkExistingTableHashElement', blocking: true, result: true, params: params }).then(result => {
            console.log("Response from checkExistingTableHashElement\n", JSON.stringify(result));

            if(result.result){
                return {error: 'Share Error: Can’t find table ' + result.result + '.json referenced in rule: ' + result.rule };
            }

            var params = { elements: params_in_shareAgreement.elements };
            return ow.actions.invoke({ actionName: 'common-ow/checkExistingReferenceElement', blocking: true, result: true, params: params }).then(result => {
                console.log("Response from checkExistingReferenceElement\n", JSON.stringify(result));
    
                if(result.result){
                    return { "error": "Share error: Referenced Element: " + result.result  + " which is not present on the Agreement"};
                }

                //Prepare params for createAgreement
                var params = params_in_shareAgreement;
                params.sysDetails = sysDetails4Sql;

                return ow.actions.invoke({ actionName: 'common-ow/createAgreement', blocking: true, result: true, params: params }).then(result => {
                    console.log("In Share Agreement Function>>> Received the response from createAgreement function>>> " + JSON.stringify(result));
                    agreementID = result.agreementID;
                    // Call export agreement function
                    var params = { agreementID: agreementID };
                    console.log("params_exportAgreement>>> " + JSON.stringify(params));
                    return ow.actions.invoke({ actionName: 'common-ow/exportAgreement', blocking: true, result: true, params: params }).then(result => {
                        console.log('"In Share Agreement Function>>> Result of exportAgreement>>>>', JSON.stringify(result));
                        var params = result.agreement;
                        //Get agreement Name for checking
                        agreementName = params.agreementName;
                        //Call to prepare Json for all System
                        return ow.actions.invoke({ actionName: 'common-ow/prepare-JSON-4-All-System', blocking: true, result: true, params: params }).then(result => {
                            console.log('"In Share Agreement Function>>> Result of prepare-JSON-4-All-System>>>>', JSON.stringify(result));
                            var final_JSON = result;
                            var final_JSON_4_InitiatingParty = {};
                            var final_JSON_4_OtherParties = { "agreementJSON_4_All_System": [] };
                            var j = 0;

                            for (var i = 0; i < final_JSON.systemDetails_4_All_System.length; i++) {
                                if (final_JSON.systemDetails_4_All_System[i].partyName === initiatorParty) {
                                    // For Initiating Party
                                    final_JSON_4_InitiatingParty = final_JSON.systemDetails_4_All_System[i];
                                } else {
                                    // for other parties system, 
                                    final_JSON_4_OtherParties.agreementJSON_4_All_System[j++] = final_JSON.systemDetails_4_All_System[i];
                                }
                            }
                            console.log(">>>>>>>>>>>>>>>>>>> final_JSON_4_OtherParties >>>>>>>>>\n" + JSON.stringify(final_JSON_4_OtherParties));
                            params = final_JSON_4_OtherParties;
                            return ow.triggers.invoke({ triggerName: 'trigger-4-create-agreement-in-multiple-party-system', result, params }).then(result => {
                                console.log("In Share-Agreement>>> Received the response from trigger-4-create-agreement-in-multiple-party-system>>> " + JSON.stringify(result));
                                return {
                                    "info": {
                                        "agreementID": agreementID,
                                        "message": "Agreement \'" + agreementName + "\' has been created. Trigger is invoked to share to other parties."
                                    }
                                };
                            }).catch(err => {
                                console.error('Failed to trigger trigger-4-create-agreement-in-multiple-party-system>>>>', err)
                                return err;
                            });

                        }).catch(err => {
                            console.error('Failed to call service to prepare-JSON-4-All-System>>>>', err)
                            return err;
                        });  //End prepare-JSON-4-All-System
                    }).catch(err => {
                        console.error('Failed to export agreement>>>>', err)
                        return err;
                    });  //End exportAgreement
                }).catch(err => {
                    console.error('Failed to create Agreement localy details>>>>', err)
                    return { error: err };
                }); //End create agreement localy
            }).catch(function (err) {
                console.error('Failed to call checkExistingReferenceElement', err)
                return { error: err };
            });
        }).catch(function (err) {
            console.error('Failed to call checkExistingTableHashElement', err)
            return { error: err };
        });
    }).catch(err => {
        console.error('Failed to call get digital-locker >>>>', err)
        return { error: err };
    });
}