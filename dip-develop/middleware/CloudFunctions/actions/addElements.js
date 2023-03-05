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
  function main(params_in_insertElements) {
      var ow = openwhisk();
      console.log("INPUT Parms>>>"+ JSON.stringify(params_in_insertElements));
      
      return new Promise(function(resolve, reject) {
          var elements = params_in_insertElements.elements;
          var sysDetails = params_in_insertElements.sysDetails;
          console.log("Elements>>>\n"+ JSON.stringify(elements));
          
          var insertActions = elements.map(addElements.bind(null, sysDetails));
          
          function addElements(params, item, index){
              console.log("Parameters to addElement >>>" + " name: " + item.elementName + " type: " + item.elementType);
              var params = { element : item, sysDetails:params};
              return new Promise(function(resolve, reject){
                  return ow.actions.invoke({actionName: "common-ow/addElement", blocking:true, result: true, params: params}).then(result =>{
                      resolve(result);
                  }).catch(err =>{
                      reject(err);
                  });
              }).catch(function (err) {
                return err;
              });
          } //end of addElements function
          
          return Promise.all(insertActions).then(function(results) {
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
            console.error('Failed to insert elements', err)
            reject(err);
          }) ; //end of Promise.all
      }); //end of return new Promise
  }
  