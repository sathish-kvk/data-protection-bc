/**
  *
  * main() will be run when you invoke this action
  *
  * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */

 function main(update_params) {
    var openwhisk = require('openwhisk');
    var ow = openwhisk();

    var agreementID = update_params.agreementID;
    var elementID = update_params.elementID;
    var proposedValue = update_params.proposedValue;
    var initiatorParty = "";

    if (agreementID === null || agreementID == "") {
        return { "error": "AgreementID is empty" };
    }

    if (elementID === null || elementID == "") {
        return { "error": "ElementID is empty" };
    }

    if (proposedValue === null || proposedValue == "") {
        return { "error": "Proposed value is empty" };
    }

    if(update_params.initiatorParty){
        initiatorParty = update_params.initiatorParty;
    }
    else{
        var ns = process.env.__OW_NAMESPACE;
        initiatorParty = ns.split("_")[1];
    }

    console.log("Update Input >>>>>>>>>> "+ JSON.stringify(update_params));
    console.log('Update on: ' + initiatorParty);
    var params = {
        agreementID : agreementID,
        elementID : elementID,
        proposedValue : proposedValue
    };
    return new Promise(function(resolve, reject) {
        return ow.actions.invoke({ actionName: 'common-ow/validate', blocking: true, result: true, params: params }).then(result => {
            console.log('validate result\n', JSON.stringify(result));
            var updatedJson = result.agreement;
            var params = {
                exportedJson: updatedJson, 
                initiatorParty: initiatorParty
            };
            return ow.actions.invoke({ actionName: 'common-ow/consensus', blocking: true, result: true, params: params }).then(result => {
                console.log('consensus result\n',  JSON.stringify(result));

                resolve(updatedJson);
            }).catch(err => {
                console.error('Failed to call consensus on: ', initiatorParty + '\n', err);
                reject(err);
            });
        }).catch(err => {
            console.error('Failed to call validate on: ', initiatorParty + '\n', err);
            reject(err);
        });
    }).catch(function (err) {
        console.error('Failed to return Promise on: ', initiatorParty + '\n', err)
        return { "error": err };
    });
}