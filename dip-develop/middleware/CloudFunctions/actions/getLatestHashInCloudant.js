/**
  *
  * main() will be invoked when you Run This Action
  *
  * @param OpenWhisk actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
 function main(params_in_getLatestHashInCloudant) {
    console.log("Input params params_in_getLatestHashInCloudant>> "+ JSON.stringify(params_in_getLatestHashInCloudant));
    var request = require("request");
    var filter = "filter[fields][_id]=true&filter[fields][_rev]=true&filter[fields][agreementID]=true&filter[fields][hash]=true&filter[fields][timestamp]=true&filter[where][agreementID]="+ params_in_getLatestHashInCloudant.agreementID + "&filter[where][hash]="+params_in_getLatestHashInCloudant.hash + "&filter[order]=timestamp:string%20DESC&filter[limit]= 1";
    var url = params_in_getLatestHashInCloudant.sysDetails.api_protocol + "://" + params_in_getLatestHashInCloudant.sysDetails.api_hostname + params_in_getLatestHashInCloudant.sysDetails.api_path + '/agreements?'+filter
    var options = {
        method: 'GET',
        url: url,
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'x-ibm-client-secret':params_in_getLatestHashInCloudant.sysDetails.client_secret,
            'x-ibm-client-id': params_in_getLatestHashInCloudant.sysDetails.client_id
        },
        json: true
    };
    
    return new Promise(function(resolve, reject){
    console.log("Request options>>>>"+JSON.stringify(options))
    request(options, function(error, response, body) {
        if(error) {
            reject(error);
        }
        else{
            console.log(JSON.stringify(body));
            resolve({'agreementHash': body});
        }
    })
    })
}
 