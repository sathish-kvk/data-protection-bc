/**
  *
  * main() will be invoked when you Run This Action
  *
  * @param OpenWhisk actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
  function main(params_in_insertElement) {
    var request = require("request");
    var url = params_in_insertElement.sysDetails.api_protocol + "://" + params_in_insertElement.sysDetails.api_hostname + params_in_insertElement.sysDetails.api_path + '/elements';
    var options = {
        method: 'POST',
        url: url,   
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'x-ibm-client-secret':params_in_insertElement.sysDetails.client_secret,
            'x-ibm-client-id': params_in_insertElement.sysDetails.client_id
        },
        body:{
            elementID: params_in_insertElement.element.elementID,
            elementName: params_in_insertElement.element.elementName,
            elementType: params_in_insertElement.element.elementType,
            writeOnce: params_in_insertElement.element.writeOnce,
            elementValue: params_in_insertElement.element.elementValue,
            fk_agreementID: params_in_insertElement.element.fk_agreementID,
            element_parent_elementID: params_in_insertElement.element.element_parent_elementID
        },
        json: true
    };
    return new Promise(function(resolve, reject){
        request(options, function(error, response, body) {
            if(error) {
                reject(error);
            }
            else{
                console.log(JSON.stringify(body));
                resolve(body);
            }
        })
    }) 
}