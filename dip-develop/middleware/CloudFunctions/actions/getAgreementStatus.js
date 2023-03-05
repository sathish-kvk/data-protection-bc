/**
 *
 * main() will be invoked when you Run This Action
 *
 * @param OpenWhisk actions accept a single parameter, which must be a JSON object.
 *
 * @return The output of this action, which must be a JSON object.
 *
*/

  function main(params_in_getAgreementStatus) {
    var openwhisk = require('openwhisk');
    var ow = openwhisk();

    
    var agreementID = params_in_getAgreementStatus.agreementID;

    if (agreementID === undefined || agreementID === "") {
        return { "error": "AgreementID is empty" };
    }

    console.log('AgreementID: ', agreementID);
    return ow.actions.invoke({ actionName: 'common-ow/digital-locker', blocking: true, result: true}).then(result => {
        console.log("Response from common-ow/digital-locker\n", JSON.stringify(result));

        var params = {
            sysDetails: result.sysDetails4Sql, 
            agreementID: agreementID, 
            filter: "filter[fields][agreementStatus]=true"
        };
        return ow.actions.invoke({ actionName: 'common-ow/getAgreement', blocking: true, result: true, params: params }).then(result => {
            console.log("Get Agreement Status successfully with AgreementID: " + params.agreementID);
            console.log(result);
            return result;
        }).catch(err => {
            console.error('Failed to get Agreement Status', err)
            return { "error": err };
        });
    }).catch(function (err) {
        console.error('Failed to digital-locker', err)
        return { "error": err };
    });
}