/**
  *
  * main() will be invoked when you Run This Action
  *
  * @param OpenWhisk actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
 
 function main(params_input) {
    console.log("INPUT Params >>>>>>>>>>\n", JSON.stringify(params_input));
    var elements = params_input.elements;
    if(elements.length > 0) {
        var listLookupElements = elements.filter(x => x.elementType.toLowerCase() === "text" && x.elementRules !== undefined && x.elementRules.length === 1);
        console.log('List-lookup elements\n', JSON.stringify(listLookupElements));
        
        for(var i=0; i < listLookupElements.length; i++){
            console.log('==============================');
            console.log('Element name: ', listLookupElements[i].elementName);
            console.log('Element rule: ', listLookupElements[i].elementRules[0].ruleText);
            var ruleText = listLookupElements[i].elementRules[0].ruleText;
            var rule = ruleText.replace(/=/g,'').trim().toLowerCase();
            var lookupTable = "";

            if(rule.startsWith('list')) {
                lookupTable = rule.replace(/\s+/g, ' ').split(' ')[1].split('.')[0]; //ex: LIST treatments.treatment
            }
            else if(rule.startsWith('lookup')){
                lookupTable = rule.replace(/\s+/g, '').split(',')[1].split('.')[0]; // ex: LOOKUP(VALUE, providers.party, providers.specialty) = specialty
            }
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Lookup Table: ', lookupTable);
            if(lookupTable){
                if(!elements.some(x => x.elementType === 'tableHash' && x.elementName.trim().split('.')[0].toLowerCase() === lookupTable)){
                    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>TABLE HASH ELEMENT IS NOT FOUND');
                    return {
                        result: lookupTable,
                        rule: ruleText
                    };
                }
            }
        }
    }
    else {
        console.log('EMPTY ELEMENTS');
        return { info: "EMPTY ELEMENTS" };
    }
 }
 