/**
  *
  * main() will be invoked when you Run This Action
  *
  * @param OpenWhisk actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */

function main(params_input) {
    var openwhisk = require('openwhisk');
    var ow = openwhisk();
    var request = require("request");

    console.log("INPUT >>>>>>>>>>\n", JSON.stringify(params_input));

    var elements = params_input.elements;
    console.log('========================================');
    console.log('ELEMENTS: ', elements);
    if(elements !== undefined && elements.length > 0) {
        return ow.actions.invoke({ actionName: 'common-ow/digital-locker', blocking: true, result: true }).then(result => {
            console.log("Response from common-ow/digital-locker\n", JSON.stringify(result));
            var sysDetails4Cloudant = result.sysDetails4Cloudant;
            var filter = "";
            elements.forEach((name,index) =>{
                filter = filter.concat("&filter[where][or][" + index +"][name]=" + name);
            })

            var url = sysDetails4Cloudant.api_protocol + "://" + sysDetails4Cloudant.api_hostname + sysDetails4Cloudant.api_path + '/tableHashes?' + filter.substring(1);
            if (params_input.includedName === true){
                url = url + "&filter[fields][name]=true";
            }
            var options = {
                method: 'GET',
                url: url,
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    'x-ibm-client-secret':sysDetails4Cloudant.client_secret,
                    'x-ibm-client-id': sysDetails4Cloudant.client_id
                },
                json: true
            };
            
            return new Promise(function(resolve, reject){
                console.log('========================================');
                console.log('Request Options\n', JSON.stringify(options));
                request(options, function(error, response, body) {
                    if(error) {
                        reject(error);
                    }
                    else {
                        console.log('========================================');
                        console.log('Response Body\n', JSON.stringify(body));
                        var invalidTables = [];
                        if(body.length > 0){
                            console.log('========================================');
                            console.log('LOOKUP TABLES RESULT\n', JSON.stringify(body));
                            resolve({ 
                                result: true,
                                tables: body
                            });
                        }
                        else{
                            console.log('========================================');
                            console.log("NOT FOUND ", elements);
                            resolve({ 
                                result: false,
                                tables: []
                            });
                        }
                    }
                })
            }).catch(function (err) {
                console.error('getLookupTable4Elements error ', err)
                return { error: err };
            });
        }).catch(function (err) {
            console.error('Fail to call digital-locker', err)
            return { error: err };
        });
    }
    else{
        console.log('EMPTY ELEMENTS');
        return { result: true };
    }
}
