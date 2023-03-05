/**
  *
  * main() will be invoked when you Run This Action
  *
  * @param OpenWhisk actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
 var openwhisk = require('openwhisk');
 function main(params) {
     const blocking = true, result = true;
     console.log("INPUT Parms>>>" + JSON.stringify(params));
     const TIMEOUT = (30 * 1000); //30 second
     const SUCCESS = "SUCCESS";
     const FAIL = "FAIL";
     const RETRY = "RETRY";
     var startTime = new Date().getTime();
     var agreementHash = params.agreementHash;
 
     var compareHashCall = function (item) {
        console.log("Inside compareHash item>>> " + JSON.stringify(item));
        var ow = openwhisk(item.cloudFunctions.options);
        var params = {
            sysDetails4Cloudant: item.sysDetails4Cloudant,
            agreementID: item.agreement.agreementID,
            hash: agreementHash
        };
        console.log("Compare Hash Params  >>>" + JSON.stringify(params));
        return new Promise(function (resolve, reject) {
            return ow.actions.invoke({ actionName: "/" + "_" + "/common-ow/compareHash", blocking: true, result: true, params: params }).then(result => {
                console.log("Inside map iterator compareHash>>> " + JSON.stringify(result));
                resolve(result);
            }).catch(err => {
                console.error('Failed to call compareHash on party ', err);
                reject(err);
            });
        });
    }

    function compareHashUntil(item){
      return compareHashCall(item).then(function (result) {
        console.log("Result from compareHashCall >>>" + JSON.stringify(result));
        if (result.status == SUCCESS) {
            return result;
        } else if (result.status == RETRY) {
            if ((new Date().getTime() - new Date(startTime).getTime()) <= TIMEOUT) {
                return compareHashUntil(item);
            } else {
                return {status:FAIL};
            }
        }
    });
    }

    return new Promise(function (resolve, reject) {
        var origParams = params;
        var systemDetailsJSON_4_All_SystemList = params.final_JSON_4_OtherParties.agreementJSON_4_All_System;
        var compareHashActions = systemDetailsJSON_4_All_SystemList.map(compareHashAction.bind(null, origParams));

        function compareHashAction(params, item, index) {
        return new Promise(function (resolve, reject) {    
            return compareHashUntil(item).then(function (result){
              console.log("Inside compareHashUntil function ===>>>" + JSON.stringify(result));
              resolve(result);
            });
         }); 
        }
        return Promise.all(compareHashActions).then(function (results) {
            console.log("Compare Hash Params Promise.all  >>>" + JSON.stringify(results));
            var notSuccess = results.some(element => {
                return element.status != SUCCESS;
            });
            if (notSuccess) {
                resolve({status:FAIL});
            } else {
                resolve({status:SUCCESS});
            }
        }).catch(err => {
            console.error('Failed to compare-hash-in-multiple-party-system', err)
            reject(err);
        }); //end of Promise.all
     });
 }
 