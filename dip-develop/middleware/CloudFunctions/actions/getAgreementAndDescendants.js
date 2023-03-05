/**
  *
  * main() will be invoked when you Run This Action
  *
  * @param OpenWhisk actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
  function main(params_in_getAgreement) {
    console.log("Input params params_in_getAgreement>> "+ JSON.stringify(params_in_getAgreement));
    var request = require("request");
    var url = params_in_getAgreement.sysDetails.api_protocol + "://" + params_in_getAgreement.sysDetails.api_hostname + params_in_getAgreement.sysDetails.api_path + '/agreements';
    var filter = "filter[include]=parties&filter[include][elements]=elementRules&filter[where][agreementID]=" + params_in_getAgreement.agreementID;
    url = url + "?" + filter;
    var options = {
        method: 'GET',
        url: url,
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'x-ibm-client-secret':params_in_getAgreement.sysDetails.client_secret,
            'x-ibm-client-id': params_in_getAgreement.sysDetails.client_id
        }
        //json: true
    };
    
    return new Promise(function(resolve, reject){
        console.log("Request options>>>>"+JSON.stringify(options))
        request(options, function(error, response, body) {
            if(error) {
                reject(error);
            } else {  
                var json = {};
                try {
                  json = JSON.parse(body);
                } catch (e) {
                  console.log("Exception: ");      
                  var len = Math.min(body.length, 10);
                  var bodyStr = body.substring(0, len);
                  json = { 'msg': bodyStr };
                  console.log('body=' + bodyStr);
                }
                if(json.constructor.name === 'Object') {
                  resolve(json);
                } else { // openwhisk fails if response in not JSON object {}
                  resolve({ 'result' : json});
                }
            }
        })
    })
}