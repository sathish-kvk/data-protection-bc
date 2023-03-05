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
  function main(params_in_deleteElements) {
      var ow = openwhisk();
      console.log("INPUT Parms>>>" + JSON.stringify(params_in_deleteElements));
  
      return new Promise(function (resolve, reject) {
          var elements = params_in_deleteElements.elements;
          var sysDetails = params_in_deleteElements.sysDetails;
          console.log("Elements>>>\n" + JSON.stringify(elements));
  
          var deleteActions = elements.map(deleteElement.bind(null, sysDetails));
  
          function deleteElement(params, item, index) {
              var params = { elementID: item.elementID, sysDetails: params };
              var ret = ow.actions.invoke({ actionName: "common-ow/deleteElement", blocking: true, params: params });
              console.log("Inside map iterator>>> " + JSON.stringify(ret));
              return ret;
          } //end of deleteElement function
  
          return Promise.all(deleteActions).then(function (results) {
              console.log(results);
              var payload = [];
              for (var i = 0; i < results.length; i++) {
                  payload[i] = results[i].response.result;
              }
              return resolve({ result: payload });
          }).catch(err => {
              console.error('Failed to delete elements', err)
              reject(err);
          }); //end of Promise.all
  
      }); //end of return new Promise
  }
  