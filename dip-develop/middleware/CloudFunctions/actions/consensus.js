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
function main(params_in_consensusAgreement) {
    var ow = openwhisk();
    const blocking = true, result = true;
    var partyName = params_in_consensusAgreement.initiatorParty;
    var agreementID = "";
    var agreementHash = "";
    const SUCCESS = "SUCCESS";
    const FAIL = "FAIL";
    var params = params_in_consensusAgreement.exportedJson;

    return ow.actions.invoke({ actionName: 'common-ow/prepare-JSON-4-All-System', blocking: true, result: true, params: params }).then(result => {
        console.log('"In consensus Agreement Function>>> Result of prepare-JSON-4-All-System>>>>', JSON.stringify(result));
        var final_JSON = result;
        var final_JSON_4_InitiatingParty = {};
        var final_JSON_4_OtherParties = { "agreementJSON_4_All_System": [] };
        var j = 0;
        for (var i = 0; i < final_JSON.systemDetails_4_All_System.length; i++) {
            if (final_JSON.systemDetails_4_All_System[i].partyName === partyName) {
                // For Initiating Party
                final_JSON_4_InitiatingParty = final_JSON.systemDetails_4_All_System[i];
            } else {
                // for other parties system, 
                final_JSON_4_OtherParties.agreementJSON_4_All_System[j++] = final_JSON.systemDetails_4_All_System[i];
            }
        }
        console.log(">>>>>>>>>>>>>>>>>>> final_JSON_4_InitiatingParty >>>>>>>>>\n" + JSON.stringify(final_JSON_4_InitiatingParty));
        console.log(">>>>>>>>>>>>>>>>>>> final_JSON_4_OtherParties >>>>>>>>>\n" + JSON.stringify(final_JSON_4_OtherParties));
        var params = final_JSON_4_InitiatingParty.agreement;
        console.log('"In consensus Agreement Function>>> Input params of storeJSONToCloudant>>>>', JSON.stringify(params));
        return ow.actions.invoke({ actionName: 'common-ow/storeJSONToCloudant', blocking: false, result: true, params: params }).then(result => {
            //Remove agreementHash from Cloudant before hash for comparing
            final_JSON_4_InitiatingParty.agreement.agreementHash = "";
            var params = {
                sysDetails4Cloudant: final_JSON_4_InitiatingParty.sysDetails4Cloudant,
                agreementID: final_JSON_4_InitiatingParty.agreement.agreementID,
                agreement: final_JSON_4_InitiatingParty.agreement
            }
            return ow.actions.invoke({ actionName: 'common-ow/createHash', blocking: true, result: true, params: params }).then(result => {
                console.log("In Consensus Agreement Function>>> Received the response from createHash function>>> " + JSON.stringify(result));
                agreementID = result.agreementID;
                agreementHash = result.agreementHash;
                // Call compare services from other parties
                var params = {
                    final_JSON_4_OtherParties: final_JSON_4_OtherParties,
                    agreementHash: agreementHash
                }
                console.log("params_compareHashInMutiSystem>>> " + JSON.stringify(params));
                return ow.actions.invoke({ actionName: 'common-ow/compare-hash-in-multiple-party-system', blocking: true, result: true, params: params }).then(result => {
                    console.log("In Consensus Agreement>>> Received the response from compare-hash-in-multiple-party-system>>> " + JSON.stringify(result));
                    if (result.status == SUCCESS) {
                        final_JSON_4_InitiatingParty.agreement.agreementHash = agreementHash;
                        var params = {
                            sysDetails: final_JSON_4_InitiatingParty.sysDetails4Sql,
                            agreement: final_JSON_4_InitiatingParty.agreement
                        }
                        return ow.actions.invoke({ actionName: 'common-ow/writeAgreement', blocking: false, result: true, params: params }).then(result => {
                            console.log("In Consensus Agreement>>> Received the response from writeAgreement function>>> " + JSON.stringify(result));
                            return { "agreementHash": agreementHash }

                        }).catch(err => {
                            console.error('Failed to call writeAgreement Function>>>>', err)
                            return err;
                        }); //End writeAgreement Function
                    } else {
                        return { status: FAIL}
                    }

                }).catch(err => {
                    console.error('Failed to call compare-hash-in-multiple-party-system>>>>', err)
                    return err;
                }); //End compare-hash-in-multiple-party-system Function

            }).catch(err => {
                console.error('Failed to call service to createHash >>>>', err)
                return err;
            });  //End createHash Function
        }).catch(err => {
            console.error('Failed to call storeJSONToCloudant to store the input JSON in local Cloudant>>>>', err)
            return err;
        }); //End prepare-JSON-4-All-System  
    }).catch(err => {
        console.error('Failed to call service to prepare-JSON-4-All-System>>>>', err)
        return err;
    }); //End prepare-JSON-4-All-System
}