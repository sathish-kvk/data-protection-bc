/**
 *
 * main() will be invoked when you Run This Action
 *
 * @param OpenWhisk actions accept a single parameter, which must be a JSON object.
 *
 * @return The output of this action, which must be a JSON object.
 *
*/

function main(params_in_goLive) {
    var openwhisk = require('openwhisk');
    var ow = openwhisk();
    
    var agreementID = params_in_goLive.agreementID;
    var initiatorParty = "";

    if (agreementID == null || agreementID == "") {
        return { "error": "AgreementID is empty" };
    }

    if(params_in_goLive.initiatorParty){
        initiatorParty = params_in_goLive.initiatorParty;
    }
    else{
        var ns = process.env.__OW_NAMESPACE;
        initiatorParty = ns.split("_")[1];
    }

    return ow.actions.invoke({ actionName: 'common-ow/digital-locker', blocking: true, result: true }).then(result => {
        console.log("Response from common-ow/digital-locker\n", JSON.stringify(result));

        var exportParams = {
            "agreementID": agreementID
        }
        return ow.actions.invoke({ name: 'common-ow/exportAgreement', blocking: true, result: true, params: exportParams }).then(function (result) {
            console.log("Response from exportAgreement\n", JSON.stringify(result));
            
            var agreementFromExport = result.agreement;
            var consensusParams = {exportedJson: agreementFromExport, initiatorParty: initiatorParty };
            return ow.actions.invoke({ actionName: 'common-ow/consensus', blocking: true, result: true, params: consensusParams }).then(result => {
                console.log("Response from common-ow/consensus\n", JSON.stringify(result));
                
                if(result.agreementHash){
                    return {
                        result: {
                            agreementHash : result.agreementHash
                        }
                    } 
                }
                else{
                    console.log("Fail Response from consensus on Party: " +  initiatorParty);
                    return { errorMessage: "Fail Response from consensus on Party: " +  initiatorParty };
                }
            }).catch(err => {
                console.error('Failed to call consensus', err)
                return { "error": err };
            }); //End consensus
        }).catch(function (err) {
            console.error('Failed to call exportAgreement', err)
            return { "error": err };
        });// End exportAgreement  
    }).catch(function (err) {
        console.error('Failed to call digital-locker', err)
        return { "error": err };
    });// End digital-locker           
}