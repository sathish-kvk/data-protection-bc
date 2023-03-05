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
 function main(params_in_updateElements) {
     var ow = openwhisk();
     console.log("INPUT Parms>>>"+ JSON.stringify(params_in_updateElements));
     
     return new Promise(function(resolve, reject) {
         var elements = params_in_updateElements.elements;
         var sysDetails = params_in_updateElements.sysDetails;
         console.log("Elements>>>\n"+ JSON.stringify(elements));
         
         var updateActions = elements.map(updateElements.bind(null, sysDetails));
         
         function updateElements(params, item, index){
             console.log("Parameters to updateElement >>>" + " name: " + item.elementName + " type: " + item.elementType);
             var params = { element : item, sysDetails:params};
             return new Promise(function(resolve, reject){
                 return ow.actions.invoke({actionName: "common-ow/updateElement", blocking:true, result: true, params: params}).then(result =>{
                     resolve(result);
                 }).catch(err =>{
                     reject(err);
                 });
             }).catch(function (err) {
               return err;
             });
         } //end of updateElements function
         
         return Promise.all(updateActions).then(function(results) {
             console.log(results);
             var payload=[];
             var errors = [];
             for(var i=0; i<results.length; i++){
                 if (results[i].error !== undefined){
                   errors.push(results[i].error.response.result.error);
                 }
                 else{
                   payload.push(results[i]);
                 }
             }
             return resolve({elements:payload, errors: errors});
         }).catch(err => {
           console.error('Failed to update elements', err)
           reject(err);
         }) ; //end of Promise.all
     }); //end of return new Promise
 }
 