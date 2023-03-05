/**
  *
  * main() will be run when you invoke this action
  *
  * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
  function main(params_in_addElement) {
    console.log("Cloud function addElement with input params >> "+ JSON.stringify(params_in_addElement));
    var openwhisk = require('openwhisk');
    var uuid = require('uuid');
    const blocking = true, result = true;
    var ow = openwhisk();
    // Define Element Types
    //var elementTypes = ["date","integer","boolean"];
    var element = params_in_addElement.element;
    // Check Type of Element. Fails if invalid Element Type supplied (DATE, integer, BOOLEAN etc)
    /*var typeIndex = elementTypes.indexOf(element.elementType.toLowerCase());
    // if invalid element type
    if (typeIndex < 0) {
        console.log("Element type" + element.elementType + " is invalid.");
        return {"error" : "Element type (" + element.elementName + ") is invalid. The valid type must be date, integer and boolean."};
    }*/
    var params = {
        sysDetails: params_in_addElement.sysDetails,
        agreementID: element.fk_agreementID,
        filter : 'filter[where][elementName]=' + element.elementName 
    };

    return ow.actions.invoke({actionName: 'common-ow/getElementsOfAgreement', blocking, result, params}).then(result => {
        var elements = result.elements;
        var recordsFound = Object.keys(elements).length;
        console.log('Elements >>>' + JSON.stringify(elements));
        console.log('Count >>>' + recordsFound);
        if (recordsFound > 0){
            console.log('Element has to unique within agreement');
            return {"error":"Element (" + element.elementName +") has to unique within agreement"};
        }
        else{
            console.log('Call insert element');
            var elementID = element.elementID;
            if (elementID === '' || elementID === undefined){
                //Generate a v1 (time-based) id
                elementID = uuid.v1();
                element.elementID = elementID;
            }
            var params = {
                sysDetails: params_in_addElement.sysDetails,
                element : element 
            };
            //Call to insert element
            return ow.actions.invoke({actionName: 'common-ow/insertElement', blocking, result, params}).then(result => {
                console.log("In Insert Element >>> Received the response from insertElement>>> "+JSON.stringify(result));
                return {elementID : result.elementID};
            }).catch(err => {
                console.error('Failed to insert element details>>>>', err);
                return err;
            });
        }
      
    }).catch(err => {
        console.error('Failed to add elemment of agreement>>>>', err);
        return err;
    });
}