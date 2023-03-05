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

function main(params_input) {
    var ow = openwhisk();
    console.log("INPUT Params>>>>>>>>>>\n", JSON.stringify(params_input));
    var parties = params_input.parties;
    var elements = params_input.elements;

    if (parties === undefined || parties.length === 0) {
        return { "error": "parties is empty" };
    }

    return new Promise(function (resolve, reject) {
        if(elements !== undefined && elements.length > 0){
            var checkActions = parties.map(checkEach.bind(null));
            function checkEach(item){
                var ow = openwhisk(item.cloudFunctions.options);
                var params = {
                    includedName: true,
                    elements : elements
                };
                return new Promise(function (resolve, reject) {
                    return ow.actions.invoke({ actionName: "/"+ "_" + "/common-ow/getLookupTable4Elements", blocking: true, result: true, params: params }).then(result => {
                        console.log('getLookupTable4Elements on each party - ' + item.partyName + ' ==========> ' + result.result);
                        resolve({
                            result: result.result,
                            partyName: item.partyName,
                            tables: result.tables
                        });
                    }).catch(err => {
                        console.error('Failed to call getLookupTable4Elements on:', item.partyName + '\n', err);
                        reject(err);
                    });
                }).catch(function (err) {
                    return err;
                });
            }

            return Promise.all(checkActions).then(function(results) {
                console.log('========================================');
                console.log("getLookupTable4Elements on all parties result\n", JSON.stringify(results));
                for(var i= 0;i< results.length; i++){
                    if(results[i].result === false){
                        console.log('========================================');
                        console.log("LOOKUP TABLES NOT FOUND: " , results[i].partyName, results[i].tables);
                        resolve({
                            result: false,
                            partyName: results[i].partyName,
                            tables: results[i].tables 
                        });
                    }
                }

                resolve({ result: true });
            }).catch(err => {
                console.error('Failed to getLookupTable4Elements', err)
                reject(err);
            });
        }
        else{
            console.log('EMPTY ELEMENTS');
            resolve({ result: true });
        }
    })
}
