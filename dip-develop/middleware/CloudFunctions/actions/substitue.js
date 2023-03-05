/**
  *
  * main() will be run when you invoke this action
  *
  * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */

function main(input) {
    console.log("input: " + input.ruleText);
    var today = new Date();
    var newRuleText = input.ruleText.toLowerCase().replace(/<today>/g, "'" + today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear() + "'");

    console.log("output: " + newRuleText);
    return {"ruleText": newRuleText};
}