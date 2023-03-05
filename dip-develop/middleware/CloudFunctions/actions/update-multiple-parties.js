/**
  *
  * main() will be run when you invoke this action
  *
  * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */

 function main(update_params) {
    console.log("Update-multiple-parties Input >>>>>>>>>> "+ JSON.stringify(update_params));
    var openwhisk = require('openwhisk');
    var ow = openwhisk();

    var agreementID = update_params.agreementID;
    var elementID = update_params.elementID;
    var proposedValue = update_params.proposedValue;
    var parties = update_params.parties;

    if (agreementID === null || agreementID == "") {
        return { "error": "AgreementID is empty" };
    }

    if (elementID === null || elementID == "") {
        return { "error": "ElementID is empty" };
    }

    if (proposedValue === null || proposedValue == "") {
        return { "error": "Proposed value is empty" };
    }
    
    if (parties === null || parties.length === 0) {
        return { "error": "Parties is empty" };
    }

    return new Promise(function(resolve, reject) {
        var updateAtions = parties.map(updateOnEachParties.bind(null));
        function updateOnEachParties(item){
            var ow = openwhisk(item.cloudFunctions.options);
            var params = {
                agreementID : agreementID,
                elementID : elementID,
                proposedValue : proposedValue
            };
            return new Promise(function (resolve, reject) {
                return ow.actions.invoke({ actionName: "/"+ "_" + "/common-ow/update", blocking: true, result: true, params: params }).then(result => {
                    console.log('Update on each party - ' + item.partyName + '\n', JSON.stringify(result));
                    resolve(result);
                }).catch(err => {
                    console.error('Failed to call update on:', item.partyName + '\n', err);
                    reject(err);
                });
            }).catch(function (err) {
                return err;
            });
        }

        return Promise.all(updateAtions).then(function(results) {
            console.log("Update on other parties result\n", JSON.stringify(results));
            
            resolve({ result : results });
        }).catch(err => {
            console.error('Failed to call update - Promise.all', err)
            reject(err);
        });  
    }).catch(function (err) {
        console.error('Fail to return Promise', err)
        return { "error": err };
    });
}