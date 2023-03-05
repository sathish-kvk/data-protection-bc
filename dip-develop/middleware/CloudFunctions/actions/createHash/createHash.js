/**
  *
  * main() will be run when you invoke this action
  *
  * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */

 function main(params_in_createHash) {
    console.log("Cloud function createHash with input params >> "+ JSON.stringify(params_in_createHash));
    var openwhisk = require('openwhisk');
    var dateFormat = require('dateformat');
    const blocking = true, result = true;
    var ow = openwhisk();
    //var sysDetails4Sql = params_in_createHash.sysDetails4Sql;
    var sysDetails4Cloudant = params_in_createHash.sysDetails4Cloudant;
    var agreementID = params_in_createHash.agreement.agreementID;
    var params = params_in_createHash.agreement;

    return ow.actions.invoke({actionName: 'common-ow/createHashFromJson', blocking, result, params}).then(result => {
        var agreementHash = result.result;
        console.log('Agreement Hash >>>' + JSON.stringify(agreementHash));
        if(agreementHash){
            console.log('Call postHashToCloudant');
            //Create timestamp
            var now = new Date();
            var timestamp = dateFormat(now, "yyyy-mm-dd HH:MM:ss");
            //var timestamp = new Date();
            var params = {
                sysDetails: sysDetails4Cloudant,
                agreementID: agreementID,
                hash: agreementHash,
                timestamp:timestamp
            }
            console.log('params in postHashToCloudant >>>' + JSON.stringify(params));
            //Call to postHashToCloudant 
            return ow.actions.invoke({actionName: 'common-ow/postHashToCloudant', blocking, result, params}).then(result => {
                console.log("In create Hash >>> Received the response from postHashToCloudant>>> "+JSON.stringify(result));
                return {"agreementID" : result.agreementID, "agreementHash": result.hash};
            }).catch(err => {
                console.error('Failed to post the hash to Cloudant details>>>>', err)
                return {"error": err};
            });

        } else {
            console.log('Agreement hash fails to create.');
            return {"error":"Agreement hash fails to create."};
        }
    }).catch(err => {
        console.error('Failed to create agreement hash>>>>', err)
        return {"error": err};
    });
}
exports.main = main;