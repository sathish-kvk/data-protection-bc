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
    var sysDetails = params.sysDetails;
    var updatedJSON = params.agreement;
    var outParams = {};
    var agreementID = "";
    var params = updatedJSON;
    return ow.actions.invoke({ actionName: 'common-ow/formatJson4MasterTablesForUpdate', blocking, result, params }).then(result => {
        console.log("In Write Agreement>>> Received the response from formatJson4MasterTables>>> " + JSON.stringify(result));
        updatedJSON = result;
        // update agreement
        var params = { sysDetails: sysDetails, agreement: updatedJSON.agreement};
        console.log("params_updateAgreement>>> " + JSON.stringify(params));
        return ow.actions.invoke({ actionName: 'common-ow/updateAgreement', blocking, result, params }).then(result => {
            console.log('Result of updateAgreement>>>>', JSON.stringify(result));
            outParams.agreement = result.result;
            // Get return agreementID
            agreementID = result.agreementID;
            // Update elements
            var params = { sysDetails: sysDetails, elements: updatedJSON.elements };
            console.log("params_updateElements>>> " + JSON.stringify(params));
            return ow.actions.invoke({ actionName: 'common-ow/updateElements', blocking, result, params }).then(result => {
                console.log('Result of updateElements>>>>', JSON.stringify(result));
                // return if any errors
                if (result.errors.length > 0) {
                    return { "error": result.errors };
                }
                outParams.elements = result.elements;
                // update rules
                // will update all rules of all elements within a agreement
                var elementRules = [];
                for (i = 0; i < updatedJSON.elements.length; i++) {
                    if (updatedJSON.elements[i].elementRules !== undefined) {
                        var rules = updatedJSON.elements[i].elementRules;
                        elementRules = elementRules.concat(rules);
                    }
                }
                console.log("All rules >>> " + JSON.stringify(elementRules));
                var params = { sysDetails: sysDetails, elementRules: elementRules };
                console.log("params_updateRules>>> " + JSON.stringify(params));
                return ow.actions.invoke({ actionName: 'common-ow/updateRules', blocking, result, params }).then(result => {
                    console.log('Result of updateRules>>>>', JSON.stringify(result));
                    // return if any errors
                    if (result.errors.length > 0) {
                        return { "error": result.errors };
                    }
                    outParams.elementRules = result.elementRules;
                    //return outParams;
                    return { "agreementID": agreementID };
                }).catch(err => {
                    console.error('Failed to update elementRules details>>>>', err)
                    return err;
                });
            }).catch(err => {
                console.error('Failed to update elements details>>>>', err)
                return err;
            }); // end update elements
        }).catch(err => {
            console.error('Failed to update agreement details>>>>', err)
            return err;
        });  //End update agreement
    }).catch(err => {
        console.error('Failed to format JSON details>>>>', err)
        return err;
    }); //end fortmat json
}