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
     //console.log("Options >>>>>" + params.options);
     const blocking = true, result = true;
     console.log("INPUT Parms>>>"+ JSON.stringify(params));
     
     return new Promise(function(resolve, reject) {
         var origParams=params;
         var systemDetailsJSON_4_All_SystemList=params.agreementJSON_4_All_System;
         var createAgreementActions = systemDetailsJSON_4_All_SystemList.map(createAgreement.bind(null, origParams));
         
         function createAgreement(params, item, index){
             var ow = openwhisk(item.cloudFunctions.options);
             var params = item.agreement;
             params.sysDetails = item.sysDetails4Sql;
             console.log("Create Agreement  >>>"+ JSON.stringify(params));
             //var ret = ow.actions.invoke({actionName: "common-ow/createAgreement", blocking:true, params: params});
             var ret = ow.actions.invoke({actionName: "/"+ "_" +"/common-ow/createAgreement", blocking:true, params: params});
             console.log("Inside map iterator>>> "+JSON.stringify(ret));
             return ret;
         }
         
         return Promise.all(createAgreementActions).then(function(results) {
             console.log(results);
             var payload=[];
             for(var i=0; i<results.length; i++){
                 payload[i]=results[i].response.result;
             }
             return resolve({agreementCreateResponse:payload});
         }).catch(err => {
           console.error('Failed to create-agreement-into-party-system', err)
           reject(err);
         }) ; //end of Promise.all
     });
 }
 