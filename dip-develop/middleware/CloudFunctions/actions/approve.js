/**
 *
 * main() will be invoked when you Run This Action
 *
 * @param OpenWhisk actions accept a single parameter, which must be a JSON object.
 *
 * @return The output of this action, which must be a JSON object.
 *
*/

function main(params_in_approve) {
    var openwhisk = require('openwhisk');
    var ow = openwhisk();
    
    var initiatorPartySysDetails4Sql = {};
    var initiatorPartySysDetails4Cloudant = {};
    var agreementID = params_in_approve.agreementID;
    var initiatorParty = "";
    
    if(params_in_approve.initiatorParty){
        initiatorParty = params_in_approve.initiatorParty;
    }
    else{
        var ns = process.env.__OW_NAMESPACE;
        initiatorParty = ns.split("_")[1];
    }

    if (params_in_approve.agreementID == null || params_in_approve.agreementID == "") {
        return { "error": "No AgreementID provided" };
    }
    
    return ow.actions.invoke({ actionName: 'common-ow/digital-locker', blocking: true, result: true }).then(result => {
        console.log("AgreementID: ", agreementID);
        console.log("Response from common-ow/digital-locker\n", JSON.stringify(result));
        initiatorPartySysDetails4Sql =  result.sysDetails4Sql;
        initiatorPartySysDetails4Cloudant =  result.sysDetails4Cloudant;
        
        var triggerParams = {
            agreementID: agreementID,
            agreementStatus : "Approve"
        }
        return ow.triggers.invoke({ triggerName: 'trigger-4-update-status', params: triggerParams}).then(result => {

            var exportParams = { agreementID: agreementID }
            return ow.actions.invoke({ name: 'common-ow/exportAgreement', blocking: true, result: true, params: exportParams }).then(function (result) {
                console.log("Response from exportAgreement>>>>>>>>>>\n", JSON.stringify(result));

                var params = result.agreement;
                return ow.actions.invoke({ actionName: 'common-ow/prepare-JSON-4-All-System', blocking: true, result: true, params: params }).then(result => {
                    console.log("Response from common-ow/prepare-JSON-4-All-System>>>>>>>>>>\n", JSON.stringify(result));

                    var otherParties = [];
                    var allParties = result.systemDetails_4_All_System;
                    var j=0;
                    for(var i = 0; i < result.systemDetails_4_All_System.length; i++) {
                        if (result.systemDetails_4_All_System[i].partyName != initiatorParty) {
                            otherParties[j++] = result.systemDetails_4_All_System[i];
                        }
                    }
                    console.log("Others Parties With Sysdetail Info >>>>>>>>>>\n"+JSON.stringify(otherParties));
                    
                    return new Promise(function(resolve, reject) {
                        //Call getStatus for other parties
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
                            console.log("Get status on other Parties result >>>>>>>>>>\n", JSON.stringify(results));
                        
                            var hasOtherStatus = results.some(element => {
                                return element.agreementStatus.toLowerCase() != "approve";
                            });

                            if(hasOtherStatus){
                                results.push({
                                    partyName: initiatorParty,
                                    agreementStatus : "Approve"
                                })
                                return resolve({ 
                                    Message:"There is a party with agreementStatus is not Approve", 
                                    Result: results
                                });
                            }
                            else{
                                console.log("All Parties have been Approved - call goLive for each Party >>>>>>>>>>");
                                var params = {
                                    agreementID: agreementID,
                                    parties: allParties
                                };
                                console.log("trigger-4-go-live-all-parties Input >>>>>>>>>>\n", JSON.stringify(params));
                                return ow.triggers.invoke({ triggerName: 'trigger-4-go-live-all-parties', params: params}).then(result => {
                                    console.log('Call trigger-4-go-live-all-parties done ', result);

                                    return resolve({result: "SUCCESS"});
                                }).catch(err => {
                                    console.error('Failed to call trigger-4-go-live-all-parties', err)
                                    reject(err);
                                });
                            }
                        }).catch(err => {
                            console.error('Failed to call getStatus on all parties - Promise.all', err)
                            reject(err);
                        }); 
                    });
                }).catch(err => {
                    console.error('Failed to call service to prepare-JSON-4-All-System>>>>', err)
                    return { "error": err };
                }); 
            }).catch(function (err) {
                console.error('Failed to exportAgreement', err)
                return { "error": err };
            });
        }).catch(err => {
            console.error('Failed to call trigger-4-update-status', err)
            return { "error": err };
        });
    }).catch(err => {
        console.error('Failed to digital-locker ', err)
        return { "error": err };
    }); 
}