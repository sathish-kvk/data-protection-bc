/**
  *
  * main() will be invoked when you Run This Action
  *
  * @param OpenWhisk actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
  function main(params_in_deleteElement) {
    var request = require("request");
    var url = params_in_deleteElement.sysDetails.api_protocol + "://" + params_in_deleteElement.sysDetails.api_hostname + params_in_deleteElement.sysDetails.api_path + '/elements/' + params_in_deleteElement.elementID;
    var options = {
        method: 'DELETE',
        url: url,   
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'x-ibm-client-secret':params_in_deleteElement.sysDetails.client_secret,
            'x-ibm-client-id': params_in_deleteElement.sysDetails.client_id
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