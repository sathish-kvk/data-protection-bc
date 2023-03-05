/**
  *
  * main() will be run when you invoke this action
  *
  * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */

 function main(input_params) {
    console.log("add-document-multiple-parties Input >>>>>>>>>> "+ JSON.stringify(input_params));
    var openwhisk = require('openwhisk');
    var ow = openwhisk();

    var agreementID = input_params.agreementID;
    var elementID = input_params.elementID;
    
    var parties = input_params.parties;

    if (agreementID === null || agreementID == "") {
        return { error: "agreementID is empty" };
    }

    if (elementID === null || elementID == "") {
        return { error: "elementID is empty" };
    }
    
    
    if (parties === null || parties.length === 0) {
        return { error: "Parties is empty" };
    }

    return new Promise(function(resolve, reject) {
        var params = {
            agreementID : agreementID,
            elementID : elementID
        }
        return ow.actions.invoke({ actionName: "common-ow/downloadDocument", blocking: true, result: true, params: params }).then(result => {
            console.log('downloadDocument result\n', JSON.stringify(result));

            if(result.documents.length > 0){
                var document = result.documents[0];
                var addDocumentParams = {
                    documentID :  document.documentID,
                    documentHashID : document.documentHashID,
                    agreementID : document.agreementID,
                    elementID : document.elementID,
                    documentName : document.documentName,
                    documentContent : document.documentHash.documentContent,
                    documentType : document.documentType,
                    createdDate : document.createdDate
                }
                var addDocumentAtions = parties.map(addOnEach.bind(null));
                function addOnEach(item){
                    var ow = openwhisk(item.cloudFunctions.options);
                    return new Promise(function (resolve, reject) {
                        return ow.actions.invoke({ actionName: "/"+ "_" + "/common-ow/addDocument", blocking: true, result: true, params: addDocumentParams }).then(result => {
                            console.log('========================================');
                            console.log('addDocument on each party - ' + item.partyName);
                            resolve(result);
                        }).catch(err => {
                            console.error('Failed to call addDocument:', item.partyName + '\n', err);
                            reject(err);
                        });
                    }).catch(function (err) {
                        return err;
                    });
                }

                return Promise.all(addDocumentAtions).then(function(results) {
                    console.log('======================================== addDocument other parties result ========================================\n', JSON.stringify(results));

                    resolve({ result : results });
                }).catch(err => {
                    console.error('Failed to call addDocumentAtions - Promise.all', err)
                    reject(err);
                });
            }
            else{
                console.log('Document is not found - DocumentHash= ' + documentHash);
                resolve({result: 'Document is not found - DocumentHash= ' + documentHash});
            }
        }).catch(err => {
            console.error('Failed to call downloadDocument', err);
            reject(err);
        });
    }).catch(function (err) {
        console.error('Fail to return Promise', err)
        return { error: err };
    });
}