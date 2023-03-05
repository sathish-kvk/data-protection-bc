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
 function main(params_in_updateRules) {
     var ow = openwhisk();
     console.log("INPUT Parms>>>" + JSON.stringify(params_in_updateRules));
 
     return new Promise(function (resolve, reject) {
         var elementRules = params_in_updateRules.elementRules;
         var sysDetails = params_in_updateRules.sysDetails;
         console.log("Elements>>>\n" + JSON.stringify(elementRules));
 
         var updateActions = elementRules.map(updateRule.bind(null, sysDetails));
 
         function updateRule(params, item, index) {
             console.log("Parameters to addRule >>>" + " type: " + item.ruleType + " text: " + item.ruleText);
             var params = { rule: item, sysDetails: params };
             return new Promise(function (resolve, reject) {
                 return ow.actions.invoke({ actionName: "common-ow/updateRule", blocking: true, result: true, params: params }).then(result => {
                     resolve(result);
                 }).catch(err => {
                     reject(err);
                 });
             }).catch(function (err) {
                 return err;
             });
         } //end of addRule function
 
         return Promise.all(updateActions).then(function (results) {
             console.log(results);
             var payload = [];
             var errors = [];
             for (var i = 0; i < results.length; i++) {
                 if (results[i].error !== undefined) {
                     errors.push(results[i].error.response.result.error);
                 }
                 else {
                     payload.push(results[i]);
                 }
             }
             return resolve({ elementRules: payload, errors: errors });
         }).catch(err => {
             console.error('Failed to update rules', err)
             reject(err);
         }); //end of Promise.all
 
     }); //end of return new Promise
 }
 