/**
  *
  * main() will be run when you invoke this action
  *
  * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */

function main(params_in_storeJsonToCloudant) {
    console.log("Cloud function storeJSONToCloudant with input params >> " + JSON.stringify(params_in_storeJsonToCloudant));
    var openwhisk = require('openwhisk');
    const blocking = true, result = true;
    var ow = openwhisk();
    var sysDetails4Sql;
    var sysDetails4Cloudant;
    var agreement = params_in_storeJsonToCloudant;

    return ow.actions.invoke({ actionName: 'common-ow/digital-locker', blocking: true, result: true }).then(result => {
        console.log("Response from common-ow/digital-locker\n", JSON.stringify(result));
        sysDetails4Sql = result.sysDetails4Sql;
        sysDetails4Cloudant = result.sysDetails4Cloudant;
        //Remove agreementHash before create a new Hash
        agreement.agreementHash = "";
        var params = agreement;
        //Hash new agreement for comparing with the previous verion
        return ow.actions.invoke({ actionName: 'common-ow/createHashFromJson', blocking, result, params }).then(result => {
            console.log('Return from createHashFromJson >>>' + JSON.stringify(result));
            var newAgreementHash = result.result;
            console.log('New Agreement Hash >>>' + JSON.stringify(newAgreementHash));
            //Call to get previous version of agreement.
            var params = {
                sysDetails: sysDetails4Cloudant,
                agreementID:agreement.agreementID
            };
            console.log('param befor calling getNewestAgreementFromCloudant  >>>' + JSON.stringify(params));
            return ow.actions.invoke({ actionName: 'common-ow/getNewestAgreementInCloudant', blocking, result, params }).then(result => {
                console.log("In getting latest Agreement from Cloudant >>> Received the response from getNewestAgreementInCloudant>>> " + JSON.stringify(result));
                var cdAgreement = result.agreements[0];
                console.log('Latest Agreement from Cloudant >>>' + JSON.stringify(cdAgreement));
                if (cdAgreement) {
                    //Compare the hash between old and new agreement
                    if (newAgreementHash == cdAgreement.agreement.agreementHash) {
                        //No Change return the newest Agreement from Cloudant
                        return {
                            agreement: cdAgreement.agreement,
                            timestamp: cdAgreement.timestamp
                        }
                    }
                }
                console.log('Call write Agreement to Cloudant');
                //Store new agreementHash to agreement.
                agreement.agreementHash = newAgreementHash;
                var params = {
                    sysDetails: sysDetails4Cloudant,
                    body: agreement
                };
                console.log('Param before calling writeAgreementToCloudant  >>>' + JSON.stringify(params));
                //Call to exportAgreement
                return ow.actions.invoke({ actionName: 'common-ow/writeAgreementToCloudant', blocking, result, params }).then(result => {
                    console.log("In Write Agreement To Cloudant >>> Received the response from writeAgreementToCloudant>>> " + JSON.stringify(result));
                    return {
                        agreement: result.agreement,
                        timestamp: result.timestamp
                    }
                }).catch(err => {
                    console.error('Failed to write Agreement to Cloudant details>>>>', err)
                });

            }).catch(err => {
                console.error('Failed to get latest Agreement from Cloudant details>>>>', err)
            });
        }).catch(err => {
            console.error('Failed to create hash of agreement details>>>>', err)
        });
    }).catch(err => {
        console.error('Failed to call get digital-locker >>>>', err)
    });
}