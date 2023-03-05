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
  function main(params_in_deleteRules) {
      var ow = openwhisk();
      console.log("INPUT Parms>>>" + JSON.stringify(params_in_deleteRules));
  
      return new Promise(function (resolve, reject) {
          var elementRules = params_in_deleteRules.elementRules;
          var sysDetails = params_in_deleteRules.sysDetails;
          console.log("Elements Rules>>>\n" + JSON.stringify(elementRules));
  
          var deleteActions = elementRules.map(deleteRule.bind(null, sysDetails));
  
          function deleteRule(params, item, index) {
              var params = { ruleID: item.ruleID, sysDetails: params };
              var ret = ow.actions.invoke({ actionName: "common-ow/deleteRule", blocking: true, params: params });
              console.log("Inside map iterator>>> " + JSON.stringify(ret));
              return ret;
          } //end of deleteRule function
  
          return Promise.all(deleteActions).then(function (results) {
              console.log(results);
              var payload = [];
              for (var i = 0; i < results.length; i++) {
                  payload[i] = results[i].response.result;
              }
              return resolve({ result : payload });
          }).catch(err => {
              console.error('Failed to delete rules', err)
              reject(err);
          }); //end of Promise.all
  
      }); //end of return new Promise
  }
  