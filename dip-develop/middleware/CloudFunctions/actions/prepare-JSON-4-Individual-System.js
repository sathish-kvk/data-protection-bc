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
  function main(inp_params) {
      var ow = openwhisk();
      const blocking = true, result = true;
      var orgParams = inp_params;
      var sysDetails4Sql={};
      var cloudFunctions = {};
      var sysDetails4Cloudant = {};
      console.log("Input params>>>" + JSON.stringify(inp_params));
       var partyname=inp_params.partyname;
       var agreement_4_all_system = inp_params.agreement_4_all_system
       //partyname=partyname.toLowerCase();
       // The input may come in upper case or lower case. Let us convert the input in to lower case.
       console.log("partyname>>>>" + partyname);
       params = {partyname:partyname};
                 console.log("params to get-targetsystem-details>>> "+ JSON.stringify(params));
                          return ow.actions.invoke({actionName :'common-ow/get-targetsystem-details', blocking, result, params}).then (result => {
                              console.log('Result of get-targetsystem-details>>>>', JSON.stringify(result));
                              sysDetails4Sql = result.sysDetails4Sql;
                              cloudFunctions = result.cloudFunctions;
                              sysDetails4Cloudant = result.sysDetails4Cloudant;
                              
                             //return {"sysDetails":sysDetails,"options": options,"agreement":agreement_4_all_system};
                             return {"sysDetails4Sql":sysDetails4Sql,"cloudFunctions": cloudFunctions,"sysDetails4Cloudant":sysDetails4Cloudant,"agreement":agreement_4_all_system,"partyName":partyname};
                              
                              
                          }).catch(err => {
                              console.error('Failed to get-targetsystem-details action>>>>', err)
                              reject(err);
                          });  
  }
  