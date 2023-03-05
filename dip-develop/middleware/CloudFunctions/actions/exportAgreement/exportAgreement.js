/* *
  *
  * main() will be run when you invoke this action
  *
  * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */

function main(params_in_exportAgreement) {
    console.log("Cloud function exportAgreement with input params >> " + JSON.stringify(params_in_exportAgreement));
    var openwhisk = require('openwhisk');
    var hash = require('object-hash');
    var deleteKey = require('key-del');
    const blocking = true, result = true;
    var ow = openwhisk();
    var sysDetails4Sql;
    var sysDetails4Cloudant;

    return ow.actions.invoke({ actionName: 'common-ow/digital-locker', blocking: true, result: true }).then(result => {
        console.log("Response from common-ow/digital-locker\n", JSON.stringify(result));
        sysDetails4Sql = result.sysDetails4Sql;
        sysDetails4Cloudant = result.sysDetails4Cloudant;

        var params = {
            sysDetails: sysDetails4Sql,
            agreementID: params_in_exportAgreement.agreementID
        };

        return ow.actions.invoke({ actionName: 'common-ow/getAgreementAndDescendants', blocking, result, params }).then(result => {
            console.log('Result >>>>>>>>>>>' + JSON.stringify(result));
            var agreement = result.result[0];
            console.log('Agreement >>>' + JSON.stringify(agreement));
            if (agreement) {
                //Remove unnessessary fields
                agreement = deleteKey(agreement, ['element_parent_elementID', 'fk_agreementID', 'fk_ElementID', 'fk_ElementID']);
                //Remove partyPublicKey and elementRules if empty 
                agreement.parties.forEach((element) => {
                    delete element["partyRole"];
                    delete element["partyPublicKey"];
                });
                agreement.elements.forEach((element) => {
                    if(element.elementRules !== undefined && element.elementRules.length === 0){
                        delete element["elementRules"];
                    }
                });
                
                var params = {
                    sysDetails: sysDetails4Cloudant,
                    agreement: agreement
                };
                console.log('Input for trigger-4-write-to-cloudant-in-export >>>' + JSON.stringify(params));
                return ow.triggers.invoke({ triggerName: 'trigger-4-write-to-cloudant-in-export', params: params}).then(result => {
                    console.log('Current agreementHash: ',agreement.agreementHash);
                    return {
                        agreement: agreement
                    }
                }).catch(err => {
                    console.error('Failed to call trigger-4-write-to-cloudant-in-export', err);
                    return { "error": "Failed to call trigger-4-write-to-cloudant-in-export" };
                });
            } else {
                console.log('Agreement ID \'' + params_in_exportAgreement.agreementID + '\' does not exist.');
                return { "error": "No Agreement found with AgreementID= " + params_in_exportAgreement.agreementID };
            }
        }).catch(err => {
            console.error('Failed to write agreement to cloudant>>>>', err)
        });
    }).catch(err => {
        console.error('Failed to call get digital-locker >>>>', err)
    });
}
exports.main = main;