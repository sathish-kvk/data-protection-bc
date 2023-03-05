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
        result = true,
        RULE_TYLE_FORMULA = "formula",
        RULE_TYPE_CONSTRAINT = "constraint";
    var openwhisk = require('openwhisk');
    var ow = openwhisk();
    
    var agreementID = input_params.agreementID;
    var elementID = input_params.elementID;
    var proposedValue = input_params.proposedValue;
    var initiatorParty = "";
    var initiatorPartySysDetails4Sql = {};
    var initiatorPartySysDetails4Cloudant = {};
    var allParties = [];

    if (agreementID === null || agreementID === undefined || agreementID === "") {
        return { "error": "Propose error: No AgreementID provided" };
    }

    if (elementID === null || elementID === undefined || elementID == "") {
        return { "error": "Propose error: No ElementID provided" };
    }

    if (proposedValue === null || proposedValue === undefined || proposedValue === "") {
        return { "error": "Propose error: No value proposed for ElementID:" + elementID };
    }

    if(input_params.initiatorParty){
        initiatorParty = input_params.initiatorParty;
    }
    else{
        var ns = process.env.__OW_NAMESPACE;
        initiatorParty = ns.split("_")[1];
    }

    return ow.actions.invoke({ actionName: 'common-ow/digital-locker', blocking: true, result: true}).then(result => {
        console.log("Response from common-ow/digital-locker\n", JSON.stringify(result));
        initiatorPartySysDetails4Sql =  result.sysDetails4Sql;
        initiatorPartySysDetails4Cloudant =  result.sysDetails4Cloudant;
        
        var exportParams = { agreementID: agreementID };
        return ow.actions.invoke({ actionName: 'common-ow/exportAgreement', blocking: true, result: true, params: exportParams }).then(result => {
            console.log("Response from common-ow/exportAgreement\n",JSON.stringify(result));

            var agreement = result.agreement;
            var index = 0;
            var allElements = result.agreement.elements.slice();

            var proposedElement = allElements.find(x => x.elementID === elementID);
            if(proposedElement === undefined){
                console.log("ElementID= " + elementID + " doesn't belong to this agreement " + agreementID );
                return { "error": "Propose error: ElementID= " + elementID + " does not exist in Agreement ID " + agreementID };
            }
            if(proposedElement.elementValue !== null && proposedElement.writeOnce === true){
                console.log("ElementID= " + elementID + " has been proposed. ElementValue= " + proposedElement.elementValue );
                return { "error": "Propose error: ElementID " + elementID + " is already populated" };
            }
            var tableHashElements = []
            allElements.forEach(element => {
                if(element.elementType === "tableHash"){
                    tableHashElements.push(element.elementName.split('.')[0].trim());
                }
            });
            console.log('TableHash Elements: ', tableHashElements);

            var params = { elements: tableHashElements };
            return ow.actions.invoke({ actionName: 'common-ow/getLookupTable4Elements', blocking: true, result: true, params: params}).then(result => {

                var allLookupTables  = result.tables;
                console.log('========================================');
                console.log('ALL LOOKUP TABLES\n', JSON.stringify(allLookupTables));

                //A42-b:validate element with proposed value----------------------------------
                if (agreement.agreementStatus.toLowerCase() != "live") {
                    return { "error": "Propose error: AgreementID " + agreementID +" - status is " + agreement.agreementStatus.toUpperCase()};
                }

                if (agreement.elements == null || agreement.elements.length == 0) {
                    return { "error": "This agreement " + agreementID + " doesn't have any element" };
                }

                var lstElement = agreement.elements;
                var element = null;
                for (index = 0; index < lstElement.length; index++) {
                    if (lstElement[index].elementID === elementID) {
                        element = lstElement[index];
                        break;
                    }
                }

                var proposedValueType = "";
                if (isNaN(proposedValue)) {
                    if(element.elementType.toLowerCase() === "date"){
                        if(isValidDateFormat(proposedValue)){
                            if (isValidDate(proposedValue)) {
                                proposedValueType = "date";
                            }
                            else {
                                return { "error": "ProposedValue= " + proposedValue + " is invalid date"};
                            }
                        }
                        else{
                            return { "error": "ProposedValue= " + proposedValue + " is invalid date format [dd-MMM-yyyy]"};
                        }
                    }
                    else if(element.elementRules !== undefined && element.elementRules.length > 0){
                        var inputRule = element.elementRules[0].ruleText.trim().toLowerCase().replace(/\s+/g, '');
                        if(inputRule.startsWith('list') || inputRule.startsWith('lookup(')){
                            proposedValueType = 'list-lookup'
                        }
                        else{
                            proposedValueType = "text";
                        }
                    }
                }
                else {
                    proposedValueType = "number";
                }

                console.log("Proposed value: ", proposedValue);
                console.log("Proposed value type: ", proposedValueType);
                if (((element.elementType.toLowerCase() == "integer" || element.elementType.toLowerCase() == "numeric") && proposedValueType != "number") ||
                    (element.elementType.toLowerCase() == "date" && proposedValueType != "date")) {
                    return { "error": "Propose error: Invalid data type" };
                }

                if(proposedValueType === "date"){
                    proposedValue = convertDateToString(new Date(proposedValue));
                }

                //A42-c: update json with proposed value--------------------------------------
                element.elementValue = proposedValue.trim();

                //A42-d: evaluate rules of this element----------------------------------------
                var evaluatedResult = true;
                if (element.elementRules === undefined || element.elementRules === null || element.elementRules.length === 0) {
                    console.log("ElementID= " + elementID + " doesn't have any rules");
                }
                else {
                    var lstRule = element.elementRules;
                    for (index = 0; index < lstRule.length; index++) {
                        var rule = lstRule[index];
                        if (rule.ruleType.toLowerCase() == RULE_TYLE_FORMULA) {
                            return { "error": "Propose error: Element= " + elementID + " is calculated and may not be proposed" };
                        }
                        else if (rule.ruleType.toLowerCase() === RULE_TYPE_CONSTRAINT) {
                            //evaluate
                            console.log("Rule: ", rule);
                            if (proposedValueType === "number") {
                                evaluatedResult = evalulateIntegerRule(rule.ruleText, proposedValue);
                            }
                            else if (proposedValueType === "date") {
                                dateEvaluate = evalulateDateRule(rule.ruleText, proposedValue);
                                if(dateEvaluate.invalidFormat){
                                    return { "error": "Propose error: Date value in ruleText has invalid format"};
                                }
                                evaluatedResult = dateEvaluate;
                            }
                            else if (proposedValueType === "text"){
                                evaluatedResult = evalulateTextRule(rule.ruleText, proposedValue);
                                if(evaluatedResult.invalidFormat === true){
                                    return { "error": "Rule has incorrect format: " + rule.ruleText };
                                }
                            }
                            else if (proposedValueType === "list-lookup"){
                                console.log('====================EVALULATE LIST-LOOKUP TYPE');
                                var validateResult = evalulateListLookupValue(rule.ruleText, proposedValue, allLookupTables, allElements);
                                console.log('>>>>>>>>>>Evaluate result\n', JSON.stringify(validateResult));

                                if (validateResult.isValid === true){
                                    element.elementValue = validateResult.returnValue;
                                    console.log('tableHash ', validateResult.tableHash);
                                    agreement.elements.forEach(x => {
                                        if(x.elementType === 'tableHash' && x.elementName.toLowerCase().split('.')[0].trim() === validateResult.tableName.toLowerCase()){
                                            x.elementValue = validateResult.tableHash;
                                        }
                                    })
                                }
                                else{
                                    if(validateResult.invalidElement){
                                        console.log('>>>>>>>>>>Referenced Element IS NOT FOUND');
                                        return { "error": "Propose error: Rule:" + rule.ruleText + " Referenced Element: " + validateResult.invalidElement  + " which is not present on the Agreement"};
                                    }
                                    else if(validateResult.refElementIsNull){
                                        console.log('>>>>>>>>>>Referenced Element Value IS NULL');
                                        return { "error": "Propose error: Referenced element value is NULL: " + validateResult.refElementIsNull };
                                    }
                                    else if(validateResult.invalidTable){
                                        console.log('>>>>>>>>>>Table IS NOT FOUND');
                                        return { "error": 'Propose error: LookupTable: ' + validateResult.invalidTable +' does not exist. Rule: ' + rule.ruleText };
                                    }
                                    else if(validateResult.invalidProposedValue){
                                        console.log('>>>>>>>>>>Proposed value IS NOT FOUND');
                                        return { "error": "Propose error: Proposed value= " + proposedValue +" does not exist in LookupTable. Rule: " + rule.ruleText };
                                    }
                                    else if(validateResult.emptyTable === true){
                                        console.log('>>>>>>>>>>Table IS EMPTY');
                                        return { "error": 'Propose error: Lookup Table Is Empty' };
                                    }
                                    else if(validateResult.invalidAttribute){
                                        console.log('>>>>>>>>>>Attribute IS INVALID');
                                        return { "error": "Propose error: Cannot find column: '" + validateResult.invalidAttribute + "' in lookup table: " +  validateResult.tableName };
                                    }
                                    else if(validateResult.failValidate){
                                        console.log('>>>>>>>>>>Fail VALIDATE');
                                        evaluatedResult = false;
                                    }
                                    else{
                                        console.log('INCORRECT FORMAT');
                                        return { "error": "Propose error: Rule has incorrect format: " + rule.ruleText };
                                    }
                                }
                            }
                            else{
                                console.log('ProposedValueType IS EMPTY');
                            }

                            console.log("Evaluate result: ", evaluatedResult);
                            if (evaluatedResult === false){
                                return { "error": "Propose value= " + proposedValue + " violate rule text: " + rule.ruleText };
                            }
                        }
                    }
                }
                //A42-e: calculate rules of other elements----------------------------------------
                console.log("========================================A42-e: CALCULATE OTHER FORMULA ELEMENTS========================================");
                for (index = 0; index < lstElement.length; index++) {
                    var element = lstElement[index];
                    console.log("========================================");
                    console.log('CALCULATE ELEMENT: ' + element.elementName.toUpperCase() + "\n", JSON.stringify(element));
                    if (element.elementID !== elementID && element.elementRules !== null 
                        && element.elementRules !== undefined && element.elementRules.length === 1 
                        && element.elementRules[0].ruleType.toLowerCase() === RULE_TYLE_FORMULA
                        && element.elementType.trim().toLowerCase() !== "tablehash" 
                        && element.elementType.trim().toLowerCase() !== "documentHash") {
                        
                        rule = element.elementRules[0];
                        console.log(">>>>>>>>>>Rule: " + rule.ruleText);

                        var lookupRule = rule.ruleText.trim().toLowerCase().replace(/\s+/g, '');
                        if (lookupRule.startsWith("=lookup(")) {
                            console.log('>>>>>>>>>>Lookup Element: ' + element.elementName);
                            var referencedElementName = lookupRule.replace(/lookup/i, "").replace(/[()=]/g,'').split(',')[0];
                            var referencedElement = agreement.elements.find(x => x.elementName.trim().toLowerCase() === referencedElementName);
                            if(referencedElement === undefined){
                                console.log(">>>>>>>>>>REFERENCED ELEMENT DID NOT EXIST");
                                continue;// ignore this element as the referenced Element does not proposed
                            }
                            if(referencedElement.elementValue === null){
                                console.log(">>>>>>>>>>REFERENCED ELEMENT WAS NOT POPUPATED");
                                continue;// ignore this element as the referenced Element does not proposed
                            }
                            var newRule = lookupRule.replace(referencedElementName, referencedElement.elementValue.trim());
                            console.log('>>>>>>>>>>New rule with referenced Element: ', newRule);
                            var calculateLookup = calculateLookupValue(newRule, allLookupTables);
                            console.log('>>>>>>>>>>Calculate lookup element result\n', JSON.stringify(calculateLookup));

                            if(calculateLookup.result){
                                element.elementValue = calculateLookup.result;
                                var tableHash = createHashJsonFile(calculateLookup.table);
                                console.log('>>>>>>>>>>LookupTable Hash: ', tableHash);
                                agreement.elements.some(x => {
                                    if(x.elementType.trim().toLowerCase() === 'tableHash' && x.elementName.trim().toLowerCase().split('.')[0].trim() === calculateLookup.tableName){
                                        x.elementValue = tableHash;
                                    }
                                })
                            }
                            else{
                                if(calculateLookup.invalidTable){
                                    console.log('>>>>>>>>>>Table NOT FOUND: ' + calculateLookup.invalidTable);
                                    return { "error": 'Propose error: LookupTable: ' + calculateLookup.invalidTable +' does not exist. Rule: ' + lookupRule };
                                }
                                else if(calculateLookup.emptyTable === true){
                                    console.log('>>>>>>>>>>Table IS EMPTY');
                                    return { "error": 'Propose error: Lookup Table Is Empty' };
                                }
                                else if(calculateLookup.invalidProposedValue){
                                    console.log('>>>>>>>>>>Proposed value IS NOT FOUND');
                                    return { "error": "Proposed value= " + proposedValue + " does not exist in LookupTable. Rule: " + lookupRule };
                                }
                                else if(calculateLookup.invalidAttribute){
                                    console.log('>>>>>>>>>>Attribute IS INVALID: ' + calculateLookup.invalidAttribute);
                                    return { "error": 'Propose error: Cannot find column ' + calculateLookup.invalidAttribute + ' in lookup table ' +  calculateLookup.tableName };
                                }
                                else{
                                    console.log('INCORRECT FORMAT');
                                    return { "error": "Propose error: Rule has incorrect format: " + lookupRule };
                                }
                            }
                            continue;
                        }

                        //remove "<value>" , "=" and " " from the ruleText
                        console.log('Remove all space');
                        var ruleText = substitue(rule.ruleText, " ", "");
                        console.log('Replace <value> param');
                        ruleText = substitue(ruleText, "<value>", "");
                        console.log("Remove character '=' ");
                        ruleText = substitue(ruleText, "=", "");

                        //replace <today> by current date
                        console.log('Replace <today> value');
                        ruleText = substitue(ruleText, "<today>", convertDateToString(new Date()));

                        //identify calculation type
                        var calculationType = "integer"; // default integer calculation
                        if (element.elementType.trim().toLowerCase() === "date") {
                            calculationType = "date";
                        }
                        
                        //populate referenced element value to calculated element
                        for (i = 0; i < lstElement.length; i++) {
                            if (lstElement[i].elementID !== element.elementID && lstElement[i].elementValue !== null && lstElement[i].elementValue !== undefined
                                && lstElement[i].elementType.trim().toLowerCase() !== "tablehash" && lstElement[i].elementType.trim().toLowerCase() !== "documentHash") {
                                console.log("substitue ", lstElement[i].elementName, lstElement[i].elementValue);
                                ruleText = substitue(ruleText, lstElement[i].elementName, lstElement[i].elementValue);
                            }
                        }
                        console.log("Rule with populated values: ", ruleText);

                        var calculatedResult;
                        var calculatedRuleNotReady = false;
                        //check the referenced values were populated to Formula?
                        for (i = 0; i < lstElement.length; i++) {
                            //only check on all elements that formula is not LOOKUP
                            if (ruleText.indexOf(lstElement[i].elementName.toLowerCase()) >= 0 
                                && lstElement[i].elementType.trim().toLowerCase() !== "tablehash" && lstElement[i].elementType.trim().toLowerCase() !== "documentHash") {
                                calculatedRuleNotReady = true;
                                break;
                            }
                        }

                        if (calculatedRuleNotReady === false) {
                            if (calculationType === "date") {
                                console.log('CALL CALCULATE DATE TYPE');
                                calculatedResult = calculateDateRule(ruleText);
                            }
                            else {
                                console.log('CALL CALCULATE NUMBER TYPE');
                                calculatedResult = evalulateIntegerRule(ruleText, "");
                            }

                            console.log("Calculated result ", calculatedResult);
                            if (calculatedResult !== null) {
                                if(calculatedResult == "Infinity"){
                                    return { "error": "Division by zero. Failed to calculate rule text: " + rule.ruleText};
                                }
                                else{
                                    element.elementValue = calculatedResult;
                                }
                            }
                            else {
                                return { "error": "Failed to calculate rule text: " + rule.ruleText};
                            }
                        }
                        else {
                            console.log("Rule is not fully populated yet - Rule: ", ruleText)
                        }
                    }
                    else{
                        console.log('>>>>>>>>>>NOT FORMULA ELEMENT');
                    }
                }

                return { agreement: agreement };
            }).catch(function (err) {
                console.error('Fail to call getLookupTable4Elements', err)
                return { "error": err };
            });
        }).catch(err => {
            var msgError = 'Failed to validate agreement ID: ' + agreementID + " elementID: " + elementID + ". " + err;
            console.error(msgError);
            return { "error": msgError };
        }); 
    }).catch(function (err) {
        console.error('Failed to digital-locker', err)
        return { "error": err };
    });// End digital-locker  
}

function evalulateListLookupValue(ruleText, proposedValue, allLookupTables, allElements){
    console.log('>>>>>>>>>>Input Rule: ', ruleText);
    var express = ruleText.trim().toLowerCase();

    if(express.startsWith('list')){
        var constraintRule = express.replace(/=/,'').trim().replace(/\s+/g, ' ').split(' ')[1].split('.'); // ex: LIST treatments.treatment
        var tableName = constraintRule[0];
        var attribute = constraintRule[1];
        var lookupTable = allLookupTables.find(x => x.name.trim().toLowerCase() === tableName);
        if(lookupTable === undefined){
            console.log('>>>>>>>>>>LookupTable: ' + tableName + 'IS NOT FOUND');
            return ({
                isValid: false,
                invalidTable: constraintRule[0]
            });
        }
        else {
            if (lookupTable.value.length === 0){
                console.log('>>>>>>>>>>EMPTY LOOKUP TABLE');
                return ({
                    isValid: false,
                    emptyTable: true
                });
            }
            var tableProperties = Object.keys(lookupTable.value[0]);
            var isValidAttribute= false;
            for(var i= 0; i < tableProperties.length;i++){
                if(tableProperties[i].toLowerCase() === attribute){
                    attribute = tableProperties[i];
                    isValidAttribute = true;
                    break;
                }
            }
            if (isValidAttribute === false){
                console.log('>>>>>>>>>>INVALID ATTRIBUTE');
                return ({
                    isValid: false,
                    invalidAttribute: attribute,
                    tableName: tableName
                });
            }
            if(lookupTable.value.some(x => { return x[attribute].trim().toLowerCase() === proposedValue.trim().toLowerCase() })){
                console.log('>>>>>>>>>>Proposed value IS FOUND');
                var returnValue = lookupTable.value.find(x => x[attribute].trim().toLowerCase() === proposedValue.trim().toLowerCase())[attribute].trim();
                var tableHash = createHashJsonFile(lookupTable.value);
                return ({
                    isValid: true,
                    returnValue: returnValue,
                    tableName: tableName,
                    tableHash: tableHash
                });
            }
            console.log('>>>>>>>>>>Proposed value IS NOT FOUND');
            return ({
                isValid: false,
                invalidProposedValue: proposedValue
            });
        }
    }
    else if(express.replace(/\s+/g, '').startsWith('lookup(')){
        var constrainValues = express.replace(/\s+/g, '').replace(/value/i, proposedValue.trim()).split('='); //ex: LOOKUP(VALUE, providers.party, providers.specialty) = specialty
        var comparedElememt = allElements.find(x => x.elementName.trim().toLowerCase() === constrainValues[1].trim()); //Get ref elementValue to compare

        if(comparedElememt === undefined){
            console.log('>>>>>>>>>>Referenced Element IS NOT FOUND', constrainValues[1]);
            return ({
                isValid: false,
                invalidElement: constrainValues[1]
            });
        }
        if(comparedElememt.elementValue === null){
            console.log('>>>>>>>>>>Referenced Element Value IS NULL');
            return ({
                    isValid: false,
                    refElementIsNull: comparedElememt.elementName
            });
        }

        var calculateLookup = calculateLookupValue(constrainValues[0].trim(), allLookupTables);
        if(calculateLookup.result){
            console.log('>>>>>>>>>>Proposed value IS FOUND');
            if(calculateLookup.result.toLowerCase() === comparedElememt.elementValue.trim().toLowerCase()){
                var tableHash = createHashJsonFile(calculateLookup.table);
                return ({
                    isValid: true,
                    returnValue: calculateLookup.indexValue,
                    tableName: calculateLookup.tableName,
                    tableHash: tableHash
                });
            }
            else{
                return ({
                    isValid: false,
                    failValidate: proposedValue
                });
            }
        }
        else {
            if(calculateLookup.invalidTable){
                console.log('>>>>>>>>>>LookupTable NOT FOUND ' + calculateLookup.invalidTable);
                return ({
                    isValid: false,
                    invalidTable: calculateLookup.invalidTable
                });
            }
            else if (calculateLookup.emptyTable === true){
                console.log('>>>>>>>>>>EMPTY LOOKUP TABLE');
                return ({
                    isValid: false,
                    emptyTable: true
                });
            }
            else if(calculateLookup.invalidAttribute){
                console.log('>>>>>>>>>>INVALID ATTRIBUTE ' + calculateLookup.invalidAttribute);
                return ({
                    isValid: false,
                    invalidAttribute: calculateLookup.invalidAttribute,
                    tableName: calculateLookup.tableName,
                });
            }
            console.log('>>>>>>>>>>Proposed value IS NOT FOUND');
            return ({
                isValid: false,
                invalidProposedValue: proposedValue
            });
        };
    }

    return ({ isValid: false});
}

function calculateLookupValue(ruleText, allLookupTables){
    if(ruleText.trim().replace(/\s+/g, '').toLowerCase().startsWith('lookup(') || ruleText.trim().replace(/\s+/g, '').toLowerCase().startsWith('=lookup(')){
        console.log('>>>>>>>>>>Input Rule: ', ruleText);
        var constraintRule = ruleText.trim().toLowerCase().replace(/lookup/i, "").replace(/[()=]/g,''); //= LOOKUP( treatmentRequested, treatments.treatment, treatments.specialty)
        console.log('>>>>>>>>>>New Rule : ', constraintRule);

        var result = '';
        var expressArr = constraintRule.split(',');
        var lookupValue = expressArr[0].trim();
        var tableName = expressArr[1].split('.')[0].trim();
        var attribute = expressArr[1].split('.')[1].trim();
        var returnAttribute = expressArr[2].split('.')[1].trim();
        
        var lookupTable = allLookupTables.find(x => x.name.trim().toLowerCase() === tableName);
        if(lookupTable !== undefined){
            if (lookupTable.value.length === 0){
                console.log('>>>>>>>>>>EMPTY LOOKUP TABLE');
                return ({
                    isValid: false,
                    emptyTable: true
                });
            }
            var tableProperties = Object.keys(lookupTable.value[0]);
            var isValidAttribute = false;
            var isValidReturnAttribute = false;
            for(var i= 0; i < tableProperties.length;i++){
                if(tableProperties[i].toLowerCase() === attribute){
                    attribute = tableProperties[i];
                    isValidAttribute = true;
                    break;
                }
            }
            for(var i= 0; i < tableProperties.length;i++){
                if(tableProperties[i].toLowerCase() === returnAttribute){
                    returnAttribute = tableProperties[i];
                    isValidReturnAttribute = true;
                    break;
                }
            }

            if (isValidAttribute === false){
                console.log('>>>>>>>>>>INVALID ATTRIBUTE');
                return ({
                    isValid: false,
                    invalidAttribute: attribute,
                    tableName: tableName
                });
            }

            if (isValidReturnAttribute === false){
                console.log('>>>>>>>>>>INVALID ATTRIBUTE');
                return ({
                    isValid: false,
                    invalidAttribute: returnAttribute,
                    tableName: tableName
                });
            }

            if(lookupTable.value.find(x => x[attribute].trim().toLowerCase() === lookupValue) === undefined){
                console.log('>>>>>>>>>>Propose Value NOT FOUND ' +  lookupValue);
                return {
                    result: result,
                    invalidProposedValue: lookupValue
                };
            }
            var indexValue = lookupTable.value.find(x => x[attribute].trim().toLowerCase() === lookupValue)[attribute].trim();
            var returnValue = lookupTable.value.find(x => x[attribute].trim().toLowerCase() === lookupValue)[returnAttribute].trim();
            console.log('>>>>>>>>>>Propose Value IS FOUND: ' +  returnValue);
            return {
                indexValue: indexValue,
                result: returnValue,
                tableName: tableName,
                table: lookupTable.value,
            };
        }
        console.log('>>>>>>>>>>LookupTable NOT FOUND'  +  expressArr[1].trim().split('.')[0]);
        return {
            result: result,
            invalidTable: expressArr[1].trim().split('.')[0]
        };
    }
    return ({ isValid: false});
}

function createHashJsonFile(input){
    console.log("----------------------------------------");
    var crypto = require('crypto');
    var SHA256 = 'sha256';
    var inputString = JSON.stringify(input);
    console.log(">>>>>>>>>>Create Hash Json file - Input\n", inputString);
    var hash = crypto.createHash(SHA256).update(inputString).digest('hex');
    console.log(">>>>>>>>>>Create Hash Json file - Output\n" + hash);
    console.log("----------------------------------------");
    return hash;
}

function convertDateToString(aDate) {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var result = aDate.getDate() + '-' + (monthNames[aDate.getMonth()]) + '-' + aDate.getFullYear();
    return result;
}

function substitue(ruleText, txtKey, txtValue) {
    console.log("substitue input: ", ruleText);
    txtKey = isNaN(txtKey)? txtKey.toLowerCase(): txtKey;
    txtValue = isNaN(txtValue)? txtValue.toLowerCase(): txtValue;
    var newRuleText = ruleText.toLowerCase().replace(new RegExp(txtKey, 'g'), txtValue);

    console.log("substitue output: ", newRuleText);
    return newRuleText;
}

function calculateDateRule(ruleText) {
    var result = null;
    var arrRulePiece = ruleText.split('+');

    if (arrRulePiece.length == 1) {
        //<value> = <today>
        result = convertDateToString(new Date(ruleText));
    }
    else {
        //<value> = startdate + days(contractdate)
        if(!isValidDateFormat(arrRulePiece[0]))
            return result;

        var startDate = new Date(arrRulePiece[0].replace(/-/g," "));
        var addDate = 0, addMonth = 0, addYear = 0;
        for (var i = 1; i < arrRulePiece.length; i++) {
            pi = arrRulePiece[i];
            if (pi.indexOf("days") >= 0) {
                addDate = pi.replace("days(", "").replace(")", "");
            }
            else if (pi.indexOf("months") >= 0) {
                addMonth = pi.replace("months(", "").replace(")", "");
            }
            else if (pi.indexOf("years") >= 0) {
                addYear = pi.replace("years(", "").replace(")", "");
            }
        }
        console.log("startDate + year + month + date ", startDate,
            startDate.getFullYear() + parseInt(addYear),
            startDate.getMonth() + parseInt(addMonth),
            startDate.getDate() + parseInt(addDate));
        var endDate = new Date(startDate.getFullYear() + parseInt(addYear),
            startDate.getMonth() + parseInt(addMonth),
            startDate.getDate() + parseInt(addDate));

        result = convertDateToString(endDate);
        console.log("endDate: ", result);
    }
    return result;
}

function evalulateIntegerRule(ruleText, proposedValue) {
    console.log("----------------------------------------");
    console.log("Input RuleText: " + ruleText);
    var newRuleText = ruleText.trim().toLowerCase()
        .replace(/\s+/g, " ")
        .replace(/<value>/g, proposedValue)
        .replace(/and/g, "&&")
        .replace(/or/g, "||");
    console.log("Output RuleText: " + newRuleText);

    var result = eval(newRuleText)
    console.log(result);
    console.log("----------------------------------------");

    return result;
}

function evalulateDateRule(ruleText, proposedValue) {
    console.log("evalulateDateRule - input: ", ruleText);
    var newRuleText = '';
    if(ruleText.toLowerCase().includes('value')){
        newRuleText = substitue(ruleText, "<value>", proposedValue);
    }
    else{
        newRuleText = proposedValue.concat(' ', ruleText.trim());
    }
    newRuleText = newRuleText.replace(/\s+/g, " ");
    if(newRuleText.toLowerCase().includes('today')){
        newRuleText = newRuleText.replace(/<today>/, convertDateToString(new Date()));
    }
    console.log("evalulateDateRule - newRuleText: ", newRuleText);
    
    var arrText = newRuleText.split(' ');
    console.log('Evalulate date Rule: ', arrText);
    if(arrText.length !== 3){
        console.log('Error when evalulating Date rule: ', newRuleText);
        return false;
    }

    if(!isValidDateFormat(arrText[2])){
        console.log('Date field in RuleText has invalid format: ', arrText[2]);
        return ({
            invalidFormat: true
        });
    }

    var date1 = new Date(arrText[0].replace(/-/g," ")).getTime();
    var date2 = new Date(arrText[2].replace(/-/g," ")).getTime();
    switch (arrText[1]) {
        case ">=":
            result = date1 >= date2;
            break;
        case ">":
            result = date1 > date2;
            break;
        case "<=":
            result = date1 <= date2;
            break;
        case "<":
            result = date1 < date2;
            break;
        case "==":
            result = date1 === date2;
            break;
    }
    console.log("evalulateDateRule - result: ", result);
    return result;
}

function evalulateTextRule(ruleText, proposedValue) {
    console.log("evalulateTextRule - RuleText: " + ruleText);
    var newRuleText = ruleText.trim().toLowerCase()
        .replace(/\s+/g,"")   
        .replace(/and/g, "'&&")
        .replace(/or/g, "'||")
        .replace(/<value>/g,"'" + proposedValue.trim().toLowerCase() + "'")
        .replace(/==/g,"=='")
        .replace(/!=/g,"!='")   
        .concat("'");

    console.log("New RuleText:\n" + newRuleText);

    var result = false;
    try{ 
        result = eval(newRuleText);
    }
    catch(err){
        console.log("Eval Error in evalulateTextRule: " + err);
        return {
            invalidFormat: true
        }
    }
    return result;
}

function isValidDate(date){
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    var dateValues = date.split('-');
    var dateResult = new Date(date.replace(/-/g," "));

    return dateResult.getFullYear() === parseInt(dateValues[2]) && dateResult.getMonth() === monthNames.findIndex(x => x === dateValues[1].toUpperCase())  && dateResult.getDate() === parseInt(dateValues[0]);
}

function isValidDateFormat(date){
    var datePattern = /^(\d{1,2})\-([A-Za-z]{3})\-(\d{4}$)/;

    return datePattern.test(date);
}