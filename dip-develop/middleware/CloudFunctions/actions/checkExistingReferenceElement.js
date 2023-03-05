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
    console.log(">>>>>>>>>>INPUT\n", JSON.stringify(params_input));
    var elements = params_input.elements;

    if(elements.length > 0) {
        var listLookupElements = elements.filter(x => x.elementType.toLowerCase() === "text" && x.elementRules !== undefined && x.elementRules.length === 1);
        console.log('>>>>>>>>>>List-Lookup elements\n', JSON.stringify(listLookupElements));
        for(var i=0; i < listLookupElements.length; i++){
            console.log('==============================');
            console.log('Element name: ', listLookupElements[i].elementName);
            console.log('Element rule: ', listLookupElements[i].elementRules[0].ruleText);
            var refElement = "";
            var rule = listLookupElements[i].elementRules[0];
            var ruleText = rule.ruleText.trim().replace(/\s+/g,'').toLowerCase();

            if(ruleText.startsWith('lookup') || ruleText.startsWith('=lookup')){
                if(rule.ruleType.toLowerCase() === 'constraint'){
                    if(ruleText.startsWith('=lookup')){
                        ruleText = ruleText.substring(1);   //ex: LOOKUP(VALUE, providers.party, providers.specialty) = specialty
                    }
                    refElement = ruleText.split('=')[1];
                }
                else {
                    refElement = ruleText.replace(/lookup/i, '').replace(/[()=]/g,'').split(',')[0]; //ex: =LOOKUP( treatmentRequested, treatments.treatment, treatments.specialty)
                }

                if(refElement){
                    console.log('>>>>>>>>>>Reference Element Name: ', refElement);
                    if(!elements.some(x => x.elementName.trim().toLowerCase() === refElement)){
                        console.log('>>>>>>>>>>Reference Element NOT FOUND');
                        return { result: refElement };
                    }
                }
            }
        }
    }
    console.log('EMPTY ELEMENTS');
    return { info: "EMPTY ELEMENTS" };
 }
 