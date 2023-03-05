/**
  *
  * main() will be invoked when you Run This Action
  *
  * @param OpenWhisk actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  * action will be insert or getRulesByElementID
  */

function main(params_in_apiRule) {
    var request = require("request");
    var METHOD_POST = "POST";
    var METHOD_GET = "GET";
    var METHOD_PUT = "PUT";
    var apiUrl = params_in_apiRule.sysDetails.api_protocol + "://" +
        params_in_apiRule.sysDetails.api_hostname +
        params_in_apiRule.sysDetails.api_path + '/rules';
    var rule = params_in_apiRule.rule;
    var apiMethod = "";
    var apiBody = "";
    var apiHeaders = {
        accept: 'application/json',
        'content-type': 'application/json',
        'x-ibm-client-secret': params_in_apiRule.sysDetails.client_secret,
        'x-ibm-client-id': params_in_apiRule.sysDetails.client_id
    };
    var apiOption;

    if (params_in_apiRule.action == "getRulesByElementID") {
        apiOption = {
            method: METHOD_GET,
            url: apiUrl + "?filter[where][fk_ElementID]=" + rule.fk_ElementID,
            headers: apiHeaders,
            json: true
        };
    }
    else if (params_in_apiRule.action == "getRuleByID") {
        apiOption = {
            method: METHOD_GET,
            url: apiUrl + "?filter[where][ruleID]=" + rule.ruleID,
            headers: apiHeaders,
            json: true
        };
    }
    else if (params_in_apiRule.action == "insert") {
        apiOption = {
            method: METHOD_POST,
            url: apiUrl,
            headers: apiHeaders,
            body: {
                ruleID: rule.ruleID,
                ruleType: rule.ruleType,
                ruleText: rule.ruleText,
                fk_ElementID: rule.fk_ElementID,
            },
            json: true
        };
    }
    else if (params_in_apiRule.action == "update") {
        apiOption = {
            method: METHOD_PUT,
            url: apiUrl,
            headers: apiHeaders,
            body: {
                ruleID: rule.ruleID,
                ruleType: rule.ruleType,
                ruleText: rule.ruleText,
                fk_ElementID: rule.fk_ElementID,
            },
            json: true
        };
    }

    return new Promise(function (resolve, reject) {
        request(apiOption, function (error, response, body) {
            if (error) {
                reject(error);
            }
            else {
                //console.log(JSON.stringify(body));
                if (body.error) {
                    resolve (body)
                }
                else {
                    resolve({ "result": body });
                }
            }
        })
    })
}