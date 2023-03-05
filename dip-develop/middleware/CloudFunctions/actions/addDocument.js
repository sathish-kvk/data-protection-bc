/**
  *
  * main() will be run when you invoke this action
  *
  * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
function main(params_in_addDocument) {
    var crypto = require('crypto');
    var SHA256 = 'sha256';
    var openwhisk = require('openwhisk');
    var uuid = require('uuid');
    const blocking = true, result = true;
    var ow = openwhisk();
    // params_in_addDocument.documentContent is in base64 string format
    var documentID = uuid.v1();
    var createdDate = new Date();
    
    var documentHashID = "";
    if (params_in_addDocument.documentHashID){
        documentHashID = params_in_addDocument.documentHashID;
    }else{
        documentHashID = crypto.createHash(SHA256).update(params_in_addDocument.documentContent).digest('hex');
    }

    if (params_in_addDocument.documentID){
        documentID = params_in_addDocument.documentID;
    }

    if (params_in_addDocument.createdDate){
        createdDate = params_in_addDocument.createdDate
    }

    var paramsInsertDocumentHash = {
        documentHashID: documentHashID,
        documentContent: params_in_addDocument.documentContent
    }

    return ow.actions.invoke({ actionName: 'common-ow/insertDocumentHash', blocking: true, result: true, params: paramsInsertDocumentHash }).then(result => {
        console.log("In insertDocumentHash >>> Received the response from insertDocumentHash>>> " + JSON.stringify(result));
        var params = {
            documentID: documentID,
            documentHashID: documentHashID,
            agreementID: params_in_addDocument.agreementID,
            elementID: params_in_addDocument.elementID,
            documentName: params_in_addDocument.documentName,
            documentType: params_in_addDocument.documentType,
            createdDate: createdDate
        }
        return ow.actions.invoke({ actionName: 'common-ow/insertDocument', blocking: true, result: true, params }).then(result => {
            console.log("In insertDocument >>> Received the response from insertDocument>>> " + JSON.stringify(result));
            return { "documentHash": documentHashID };
        }).catch(err => {
            console.error('Failed to insertDocument>>>>', err);
            return { "error": err };
        });
    }).catch(err => {
        console.error('Failed to insertDocument>>>>', err);
        return { "error": err };
    });

}
