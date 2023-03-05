/**
  *
  * main() will be run when you invoke this action
  *
  * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */

 function main(params_in_updateRule) {
    const
        blocking = true,
        result = true,
        RULE_TYPE_FORMULA = "formula",
        RULE_TYPE_CONSTRAINT = "constraint";

    var openwhisk = require('openwhisk');
    var ow = openwhisk();
    var rule = params_in_updateRule.rule;
    var apiUrl = "";
    var txtLog = "";
    var apiCall;

    // validate fk_ElementID
    if (rule.fk_ElementID == "") {
        txtLog = "fk_ElementID is empty";
        console.log(txtLog);
        return {
            "error": txtLog
        };
    }

    //validate ruleType
    var ruleType = rule.ruleType.toLowerCase();
    if (ruleType != RULE_TYPE_FORMULA && ruleType != RULE_TYPE_CONSTRAINT) {
        txtLog = "ruleType is not correct: " + rule.ruleType + ". It must be either " + RULE_TYPE_CONSTRAINT + " or " + RULE_TYPE_FORMULA;
        console.log(txtLog);
        return {
            "error": txtLog
        };
    }

    //generate rule id if empty
    if (rule.ruleID == "") {
        console.log("Generating rule ID");
        var uuid = require('uuid');
        // Generate a v1 (time-based) id
        rule.ruleID = uuid.v1(); // -> '6c84fb90-12c4-11e1-840d-7b25c5ee775a'
    }

    var params = {
        "sysDetails": params_in_updateRule.sysDetails,
        "rule": rule,
        "action": "getRulesByElementID"
    }

    return ow.actions.invoke({ actionName: 'common-ow/apiRule', blocking, result, params }).then(result => {
        var arrRules = result.result;
        //update rule
        params.action = "update";
        return ow.actions.invoke({ actionName: 'common-ow/apiRule', blocking, result, params }).then(result => {
            console.log("In Insert Rule >>> Received the response from apiRule>>> " + JSON.stringify(result));
            return result;
        }).catch(err => {
            console.error('Failed to insert rule:>>>>', err);
            return { "error": err };
        });

    }).catch(err => {
        console.error('Failed to update rule>>>>', err)
        return { "error": err };
    });
}