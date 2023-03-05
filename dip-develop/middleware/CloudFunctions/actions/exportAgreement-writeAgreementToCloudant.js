/**
  *
  * main() will be run when you invoke this action
  *
  * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */

function main(input_params) {
    console.log("Input params >> " + JSON.stringify(input_params));
    
    var openwhisk = require('openwhisk');
    var ow = openwhisk();
    var sysDetails4Cloudant = input_params.sysDetails;
    var agreement = input_params.agreement;
    var agreementID = input_params.agreement.agreementID;
    
    //Remove agreementHash before create a new Hash
    agreement.agreementHash = "";
    var params = agreement;
    return ow.actions.invoke({ actionName: 'common-ow/createHashFromJson', blocking: true, result: true, params: params }).then(result => {
        console.log('Response from createHashFromJsonh >>>' + JSON.stringify(result));
        var newAgreementHash = result.result;
        console.log('New Agreement Hash >>>' + JSON.stringify(newAgreementHash));

        var params = {
            sysDetails: sysDetails4Cloudant,
            agreementID: agreementID
        };
        console.log('Input getNewestAgreementFromCloudant\n ' + JSON.stringify(params));
        return ow.actions.invoke({ actionName: 'common-ow/getNewestAgreementInCloudant', blocking: true, result: true, params: params }).then(result => {
            console.log("Response from getNewestAgreementInCloudant >>>>>>>>>> " + JSON.stringify(result));
            var cdAgreement = result.agreements[0];
            console.log('Latest Agreement from Cloudant >>>>>>>>>>' + JSON.stringify(cdAgreement));
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
            console.log('Call write Agreement to Cloudant\n');
            agreement.agreementHash = newAgreementHash;
            var params = {
                sysDetails: sysDetails4Cloudant,
                body: agreement
            };
            console.log('Input writeAgreementToCloudant  >>>' + JSON.stringify(params));
            //Call to exportAgreement
            return ow.actions.invoke({ actionName: 'common-ow/writeAgreementToCloudant', blocking: true, result: true, params: params }).then(result => {
                console.log("In Write Agreement To Cloudant >>> Received the response from writeAgreementToCloudant>>> " + JSON.stringify(result));
                return { 
                    agreement: result.agreement,
                    timestamp: result.timestamp
                }
            }).catch(err => {
                console.error('Failed to write Agreement to Cloudant details>>>>', err);
                return { "error": "Failed to call writeAgreementToCloudant" };
            });
        }).catch(err => {
            console.error('Failed to get latest Agreement from Cloudant details>>>>', err)
            return { "error": "Failed to call getNewestAgreementInCloudant" };
        });
    }).catch(err => {
        console.error('Failed to call createHashFromJson', err);
        return { "error": "Failed to call createHashFromJson" };
    });
}