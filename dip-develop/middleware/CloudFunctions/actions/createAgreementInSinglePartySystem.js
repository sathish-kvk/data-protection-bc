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
    //var partyname=params.requestingParty;
    var sysDetails = params.sysDetails;
    var formattedJSON = params.agreement;
    var outParams = {};
    var agreementID = "";
    // add agreement
    var params = { sysDetails: sysDetails, agreement: formattedJSON.agreement };
    console.log("params_addAgreement>>> " + JSON.stringify(params));
    return ow.actions.invoke({ actionName: 'common-ow/addAgreement', blocking, result, params }).then(result => {
        console.log('Result of addAgreement>>>>', JSON.stringify(result));
        outParams.agreement = result.result;
        // Get return agreementID
        agreementID = result.result.agreementID;
        // add Parties to agreement
        var params = { sysDetails: sysDetails, agreementID: agreementID, parties: formattedJSON.parties };
        console.log("params_addPartiesToAgreement>>> " + JSON.stringify(params));
        return ow.actions.invoke({ actionName: 'common-ow/addPartiesToAgreement', blocking, result, params }).then(result => {
            console.log('Result of addPartiesToAgreement>>>>', JSON.stringify(result));
             // return if any errors
            if (result.errors.length > 0){
                return {"error": result.errors};
            }
            outParams.parties = result;
            // Insert elements
            var params = { sysDetails: sysDetails, elements: formattedJSON.elements };
            console.log("params_addElements>>> " + JSON.stringify(params));
            return ow.actions.invoke({ actionName: 'common-ow/addElements', blocking, result, params }).then(result => {
                console.log('Result of addElements>>>>', JSON.stringify(result));
                // return if any errors
                if (result.errors.length > 0){
                    return {"error": result.errors};
                }
                outParams.elements = result.elements;
                // insert rules
                // will store all rules of all elements within a agreement
                var elementRules = [];
                for (i = 0; i < formattedJSON.elements.length; i++) {
                    if (formattedJSON.elements[i].elementRules !== undefined) {
                        var rules = formattedJSON.elements[i].elementRules;
                        elementRules = elementRules.concat(rules);
                    }
                }
                console.log("All rules >>> " + JSON.stringify(elementRules));
                var params = { sysDetails: sysDetails, elementRules: elementRules };
                console.log("params_addRules>>> " + JSON.stringify(params));
                return ow.actions.invoke({ actionName: 'common-ow/addRules', blocking, result, params }).then(result => {
                    console.log('Result of addRules>>>>', JSON.stringify(result));
                    // return if any errors
                    if (result.errors.length > 0){
                        return {"error": result.errors};
                    }
                    outParams.elementRules = result.elementRules;
                    //return outParams;
                    return { "agreementID": agreementID };
                }).catch(err => {
                    console.error('Failed to insert elementRules details>>>>', err)
                    return err;
                });
            }).catch(err => {
                console.error('Failed to insert elements details>>>>', err)
                return err;
            }); // end insert elements
        }).catch(err => {
            console.error('Failed to add Parties to agreement details>>>>', err)
            return err;
        }); // end addPartiesToAgreement
    }).catch(err => {
        console.error('Failed to create agreement details>>>>', err)
        return err;
    });  //End create agreement
}