/**
  *
  * main() will be run when you invoke this action
  *
  * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */

function main(params_in_addAgreement) {
    console.log("Cloud function addAgreement with input params >> " + JSON.stringify(params_in_addAgreement));
    
    var openwhisk = require('openwhisk');
    var uuid = require('uuid');
    const blocking = true, result = true;
    var ow = openwhisk();

    var agreement = params_in_addAgreement.agreement;

    if (agreement.agreementID == "") {
        console.log("Generating agreement ID");
        var uuid = require('uuid');
        // Generate a v1 (time-based) id
        agreement.agreementID = uuid.v1(); // -> '6c84fb90-12c4-11e1-840d-7b25c5ee775a'
    }

    if (agreement.agreementStatus == "") {
        console.log("Setting default status Negotiate");
        agreement.agreementStatus = "Negotiate";
    }

    console.log("Inserting agreement into table");

    var params = {
        sysDetails: params_in_addAgreement.sysDetails,
        agreement: agreement,
        action: "insert"
    }

    //Call to insertAgreement
    return ow.actions.invoke({ actionName: 'common-ow/apiAgreement', blocking, result, params }).then(result => {
        console.log("In apiAgreement >>> Received the response from insertAgreement>>> " + JSON.stringify(result));
        return  result;
    }).catch(err => {
        console.error('Failed to insert Agreement. Details>>>>', err);
        if (err.error.response.result.error.error.response.result.error.code == "ER_DUP_ENTRY") {
            var errorObj = {
                "code": err.error.response.result.error.code,
                "message": "Failed to create this agreement because an agreement already exists with the ID provided: " + params.agreement.agreementID,
                "stack": err
            };
            return { "error": errorObj };
        }
        else {
            return { "error": err};
        }
    });
}