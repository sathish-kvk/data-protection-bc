/**
  *
  * main() will be invoked when you Run This Action
  *
  * @param OpenWhisk actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
  function main(params_in_exportAgreement) {
    var request = require("request");
    var url = params_in_exportAgreement.sysDetails.api_protocol + "://" + params_in_exportAgreement.sysDetails.api_hostname + params_in_exportAgreement.sysDetails.api_path + '/agreements';
    var currentTimestamp = formatDate(new Date());
    console.log("Current Timestamp " + currentTimestamp);
    var options = {
        method: 'POST',
        url: url,   
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'x-ibm-client-secret':params_in_exportAgreement.sysDetails.client_secret,
            'x-ibm-client-id': params_in_exportAgreement.sysDetails.client_id
        },
        body:{
            "agreement":params_in_exportAgreement.body,
            "timestamp":currentTimestamp
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

/**
 * This function for formating the date in human-readable
 * @param {} date 
 */
function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
        hour = d.getHours();
        min =  d.getMinutes();
        second = d.getSeconds();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-') +" "+[hour, min, second].join(':')
}
     
 