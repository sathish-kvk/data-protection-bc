/**
  *
  * main() will be run when you invoke this action
  *
  * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */

  function main(input_params) {
    const
        blocking = true,
        result = true;
    var openwhisk = require('openwhisk');
    var ow = openwhisk();
    var rule = input_params.rule;
    var proposedValue = input_params.proposedValue;

    if (rule.ruleID == "") {
        return { "error": "ruleID is empty" };
    }

    var params = {
        "sysDetails": input_params.sysDetails,
        "rule": rule,
        "action": "getRuleByID"
    }

    var ruleText = "";
    return ow.actions.invoke({ actionName: 'common-ow/apiRule', blocking, result, params }).then(result => {
        var arrRules = result.result;

        if (arrRules.length == 0) {
            return { "error": "ruleID does not exist: " + rule.ruleID };
        }
        else {
            console.log("proposed value: " + proposedValue);
            var  isNumber = !isNaN(proposedValue);
            console.log("proposedValue is number: " + isNumber);
            console.log({ "rule": arrRules[0] });
            ruleText = arrRules[0].ruleText;
            if (isNumber) {
                return { "result": evalulateIntegerRule(ruleText, proposedValue) };
            }
            else {
                return { "result": evalulateDateRule(ruleText, proposedValue) };
            }
        }
    }).catch(err => {
        console.error('Failed to evaluate rule ID: ' + rule.ruleID + "rule text: " + ruleText, err);
        return { "error": "rule ID " + rule.ruleID + " has ruleText not formatted correctly: " + ruleText };
    });

}

function evalulateIntegerRule(ruleText, proposedValue) {
    console.log("input: " + ruleText);
    var newRuleText = ruleText.toLowerCase().replace(/<value>/g, proposedValue)
        .replace(/and/g, "&&")
        .replace(/or/g, "||");
    console.log("output: " + newRuleText);

    var result = eval(newRuleText)
    console.log(result);

    return result;
}

function evalulateDateRule(ruleText, proposedValue) {
    var newRuleText = ruleText.toLowerCase().replace(/<value>/g, proposedValue);
    var arrText = newRuleText.split(' ');
    var arrDate1 = arrText[0].split('/');
    var arrDate2 = arrText[2].split('/');

    var date1 = new Date(arrDate1[2], arrDate1[1], arrDate1[0]);
    var date2 = new Date(arrDate2[2], arrDate2[1], arrDate2[0]);

    switch (arrText[1]) {
        case ">=":
            if (date1 >= date2)
                result = true;
            else
                result = false;
            break;
        case ">":
            if (date1 >= date2)
                result = true;
            else
                result = false;
            break;
        case "<=":
            if (date1 <= date2)
                result = true;
            else
                result = false;
            break;
        case "<":
            if (date1 < date2)
                result = true;
            else
                result = false;
            break;
        case "==":
            if (date1 == date2)
                result = true;
            else
                result = false;
            break;

    }

    console.log("input: " + ruleText);
    console.log("output: " + newRuleText);
    console.log(arrText);
    console.log(result);

    return result;
}