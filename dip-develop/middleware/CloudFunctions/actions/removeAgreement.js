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
function main(remove_params) {
    var ow = openwhisk();
    const blocking = true, result = true;
    var sysDetails = remove_params.sysDetails;
    var agreementID = remove_params.agreementID;
    var agreement;
    // Get agreement
    var params = { sysDetails: sysDetails, agreementID: agreementID, filter: "filter[include][elements]=rules" };
    return ow.actions.invoke({ actionName: 'common-ow/getAgreement', blocking, result, params }).then(result => {
        console.log('Result of getAgreement>>>>', JSON.stringify(result));
        agreement = result;
        var params = { sysDetails: sysDetails, agreementID: agreementID };
        // delete agreement_has_party
        return ow.actions.invoke({ actionName: 'common-ow/deletePartiesAgreement', blocking, result, params }).then(result => {
            console.log('Result of deletePartiesAgreement>>>>', JSON.stringify(result));
            // delete rules
            var elementRules = [];
            for (i = 0; i < agreement.elements.length; i++) {
                if (agreement.elements[i].rules !== undefined) {
                    var rules = agreement.elements[i].rules;
                    elementRules = elementRules.concat(rules);
                }
            }
            console.log("All rules >>> " + JSON.stringify(elementRules));
            var params = { sysDetails: sysDetails, elementRules: elementRules };
            return ow.actions.invoke({ actionName: 'common-ow/deleteRules', blocking, result, params }).then(result => {
                console.log('Result of deleteRules>>>>', JSON.stringify(result));
                // delete elements
                var params = { sysDetails: sysDetails, elements: agreement.elements };
                return ow.actions.invoke({ actionName: 'common-ow/deleteElements', blocking, result, params }).then(result => {
                    console.log('Result of deleteElements>>>>', JSON.stringify(result));
                    // delet agreement
                    var params = { sysDetails: sysDetails, agreementID: agreementID };
                    return ow.actions.invoke({ actionName: 'common-ow/deleteAgreement', blocking, result, params }).then(result => {
                        console.log('Result of deleteAgreement>>>>', JSON.stringify(result));
                        return { "agreementID": agreementID, "Count": result.count };
                    }).catch(err => {
                        console.error('Failed to deleteAgreement details>>>>', err)
                        return { "error": err };
                    });
                }).catch(err => {
                    console.error('Failed to deleteElements details>>>>', err)
                    return { "error": err };
                });
            }).catch(err => {
                console.error('Failed to deleteRules details>>>>', err)
                return { "error": err };
            });
        }).catch(err => {
            console.error('Failed to deletePartiesAgreement details>>>>', err)
            return { "error": err };
        });
    }).catch(err => {
        console.error('Failed to getAgreement details>>>>', err)
        return { "error": err };
    });
}