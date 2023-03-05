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
function main(params) {
    var ow = openwhisk();
    const blocking = true, result = true;
    var orgParams = params;
    var sysDetails = params.sysDetails;
    var formattedJSON = {};
    var outParams = {};

    var params = orgParams;
    return ow.actions.invoke({ actionName: 'common-ow/formatJson4MasterTables', blocking, result, params }).then(result => {
        console.log("In Create-Agreement>>> Received the response from formatJson4MasterTables>>> " + JSON.stringify(result));
        formattedJSON = result;
        // add agreement
        var params = { sysDetails: sysDetails, agreement: formattedJSON };
        console.log("params_createAgreementInSinglePartySystem>>> " + JSON.stringify(params));
        return ow.actions.invoke({ actionName: 'common-ow/createAgreementInSinglePartySystem', blocking, result, params }).then(result => {
            console.log('Result of createAgreementInSinglePartySystem>>>>', JSON.stringify(result));
            return result;
        }).catch(err => {
            console.error('Failed to createAgreementInSinglePartySystem details>>>>', err)
            //Don't call delete if the error on dupplicate agreement
            var dupplicateError = getDupplicateError(err);
            console.log('duplicateError: ' + JSON.stringify(dupplicateError));
            if (dupplicateError.code !== undefined && dupplicateError.code === 'ER_DUP_ENTRY') {
                return { "error": dupplicateError.errorMessage };
            }
            else {
                var createAgreementError = err;
                var params = { sysDetails: sysDetails, agreementID: formattedJSON.agreement.agreementID };
                console.log('remove agreement : ' + JSON.stringify(params));
                // Invoke trigger
                return ow.triggers.invoke({ triggerName: 'trigger4deleteAgreement', result, params }).then(result => {
                    console.log('Trigger trigger4deleteAgreement is fired');
                    return { "error": createAgreementError };
                }).catch(err => {
                    console.error('Fail to fire trigger4deleteAgreement', err);
                    return { "error": createAgreementError, "removeAgreementError": err };
                });
            }
            // ow.triggers.invoke({ triggerName: 'trigger4deleteAgreement', params }).then(result => {
            //     console.log('Trigger trigger4deleteAgreement is fired');
            // }).catch(err => {
            //     console.error('failed to fire trigger4deleteAgreement trigger', err)
            // })
            // return err;
        });  //End createAgreementInSinglePartySystem
    }).catch(err => {
        console.error('Failed to format JSON details>>>>', err)
        return err;
    }); //end fortmat json
}

function getDupplicateError(err) {
    var dupplicateErr = err;
    try {
        var dupplicateError = err.error.response.result.error;
        dupplicateErr = dupplicateError.response.result.error;
    } catch (error) {
    }
    return dupplicateErr;
}