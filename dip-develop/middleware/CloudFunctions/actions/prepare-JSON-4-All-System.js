
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
      var ow = openwhisk();
      const blocking = true, result = true;
      console.log("INPUT Parms>>>"+ JSON.stringify(params));
      
      return new Promise(function(resolve, reject) {
          var origParams=params;
          var parties=params.parties;
          var getSysDetailsActions = parties.map(getSystemDetails.bind(null, origParams));
          console.log("Parties in prepare-JSON-4-All-System>>> "+JSON.stringify(parties));
          
          function getSystemDetails(params, item, index){
              console.log("Item.partyName>>> "+JSON.stringify(item.partyName));
              var params = { partyname:item.partyName, agreement_4_all_system:params};
              var ret = ow.actions.invoke({actionName: "common-ow/prepare-JSON-4-Individual-System", blocking:true, params: params});
              console.log("Inside map iterator>>> "+JSON.stringify(ret));
              return ret;
          }
          
          return Promise.all(getSysDetailsActions).then(function(results) {
              console.log(results);
              var payload=[];
              for(var i=0; i<results.length; i++){
                  payload[i]=results[i].response.result;
              }
              return resolve({systemDetails_4_All_System:payload});
          }).catch(err => {
            console.error('Failed to get SystemDetails for all the systems', err)
            reject(err);
          }) ; //end of Promise.all
      });
  }
  
  