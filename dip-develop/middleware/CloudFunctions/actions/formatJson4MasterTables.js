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
var uuid = require('uuid');
function main(params_for_prepareMasters) {
    var ow = openwhisk();
    const blocking = true, result = true;

    var inJSON = params_for_prepareMasters;
    console.log("Raw JSON Input>>>> " + JSON.stringify(inJSON));

    var outJSON = {};
    var outElements = [];
    var outRules = [];
    var agreementID = "";
    if (inJSON.agreementID === undefined || inJSON.agreementID === "") {
        agreementID = uuid.v1();
    }
    else {
        agreementID = inJSON.agreementID;
    }
    var agreement = {
        agreementID: agreementID,
        agreementName: inJSON.agreementName,
        agreementStatus: "",
        // these field are always empty on creation
        agreementHash: "",
        agreementChannelID: "",
        lastProofID: ""
    };
    console.log(JSON.stringify(agreement));

    var elements = inJSON.elements;
    console.log("Elements>>>" + JSON.stringify(elements));

    for (var i = 0; i < elements.length; i++) {
        var outRules = [];
        //Check ElementID is exist or not
        var elementUUID = "";
        if (elements[i].elementID === undefined || elements[i].elementID === "") {
            elementUUID = uuid.v1();
        }
        else {
            elementUUID = elements[i].elementID;
        }
        
        if (elements[i].elementRules !== undefined) {
            for (var j = 0; j < elements[i].elementRules.length; j++) {
                var ruleUUID = uuid.v1();
                //Check ruleID is exist or not
                var ruleUUID = "";
                if (elements[i].elementRules[j].ruleID === undefined || elements[i].elementRules[j].ruleID === "") {
                    ruleUUID = uuid.v1();
                }
                else {
                    ruleUUID = elements[i].elementRules[j].ruleID;
                }
                outRules.push({
                    ruleID: ruleUUID,
                    ruleType: elements[i].elementRules[j].ruleType,
                    ruleText: elements[i].elementRules[j].ruleText,
                    fk_ElementID: elementUUID
                });
            }
        }
        // Add element
        outElements.push({
            elementID: elementUUID,
            elementName: elements[i].elementName,
            elementType: elements[i].elementType,
            writeOnce: elements[i].writeOnce,
            elementValue: null,
            fk_agreementID: agreementID,
            element_parent_elementID: null,
            elementRules: outRules
        });
    }
    console.log("Output Elements>>>>" + JSON.stringify(outElements));

    outJSON = { agreement: agreement, parties: inJSON.parties, elements: outElements };

    console.log("Output JSON >>>>" + JSON.stringify(outJSON));
    return outJSON;
}

