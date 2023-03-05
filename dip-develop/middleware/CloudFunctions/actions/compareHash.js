/**
  *
  * main() will be run when you invoke this action
  *
  * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */

 function main(params_in_compareHash) {
    console.log("Cloud function createHash with input params >> "+ JSON.stringify(params_in_compareHash));
    var openwhisk = require('openwhisk');
    const blocking = true, result = true;
    var ow = openwhisk();
    var params = {
        sysDetails:params_in_compareHash.sysDetails4Cloudant,
        agreementID:params_in_compareHash.agreementID,
        hash: params_in_compareHash.hash
    }
    const LATENCY = (1*60*1000); //1 minute
    const SUCCESS = "SUCCESS";
    const FAIL = "FAIL";
    const RETRY = "RETRY";


    return ow.actions.invoke({actionName: 'common-ow/getLatestHashInCloudant', blocking, result, params}).then(result => {
        console.log('Result >>>' + JSON.stringify(result));
        var agreementHash = result.agreementHash[0];
        //Create timestamp
        var currentTimestamp = formatDate(new Date());
        console.log('Current timestamp >>>' + JSON.stringify(currentTimestamp));
        console.log('Agreement Hash >>>' + JSON.stringify(agreementHash));
        if(agreementHash){
        console.log('Agreement TimeStamp >>>' + agreementHash.timestamp);
        var differTimeStamp = (new Date(currentTimestamp).getTime() - new Date(agreementHash.timestamp).getTime());
        console.log("Compare Hash >>> The subtract of current timestamp and hash timestamp is :" + differTimeStamp);
            if(differTimeStamp <= LATENCY) {
                return {status:SUCCESS};
            } else {
                return {status:RETRY};
            }   
        } else {
            return {status:RETRY};
        }
    }).catch(err => {
        console.error('Failed to get latest hash in cloudant>>>>', err);
        return {"error": err};
    });
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