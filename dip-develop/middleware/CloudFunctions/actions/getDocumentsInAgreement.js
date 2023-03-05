/**
  *
  * main() will be invoked when you Run This Action
  *
  * @param OpenWhisk actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
 function main(params_in_getDocumentsinAgreement) {
    console.log("Input params params_in_getDocumentsinAgreement>> "+ JSON.stringify(params_in_getDocumentsinAgreement));
    var request = require("request");
    var openwhisk = require('openwhisk');
    var ow = openwhisk();
    return ow.actions.invoke({ actionName: 'common-ow/digital-locker', blocking:true, result:true}).then(result => {
        params_in_getDocumentsinAgreement.sysDetails = result.sysDetails4Sql;
        params_in_getDocumentsinAgreement.filter = "filter[order]=createdDate DESC&filter[where][agreementID]=" +params_in_getDocumentsinAgreement.agreementID 
             + "&filter[fields][documentHashID]=true"
             + "&filter[fields][agreementID]=true"
             + "&filter[fields][elementID]=true"
             + "&filter[fields][documentName]=true"
             + "&filter[fields][documentType]=true"
             + "&filter[fields][createdDate]=true";

        var url = params_in_getDocumentsinAgreement.sysDetails.api_protocol + "://" + params_in_getDocumentsinAgreement.sysDetails.api_hostname + params_in_getDocumentsinAgreement.sysDetails.api_path + '/documents';
        if (params_in_getDocumentsinAgreement.filter !== undefined){
            url = url + "?" + params_in_getDocumentsinAgreement.filter;
        }
        var options = {
            method: 'GET',
            url: url,
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                'x-ibm-client-secret':params_in_getDocumentsinAgreement.sysDetails.client_secret,
                'x-ibm-client-id': params_in_getDocumentsinAgreement.sysDetails.client_id
            },
            json: true
        };
        
        return new Promise(function(resolve, reject){
            console.log("Request options>>>>"+JSON.stringify(options))
            request(options, function(error, response, body) {
                if(error) {
                    reject(error);
                }
                else{
                    console.log(JSON.stringify(body));
                    var documents = [];
                    var elementID = "";
                    // Get the fisrt element if the document was uploaded for element multiple
                    for (let index = 0; index < body.length; index++) {
                        const document = body[index];
                        if (elementID !== document.elementID){
                            var elements = documents.filter(doc => doc.elementID == document.elementID);
                            //only push to documents if elementID does not exist
                            if (elements.length == 0){
                                documents.push(document);
                            }
                            // assign new element
                            elementID = document.elementID;
                        }
                    }
                    resolve({ 'documents': documents });
                }
            })
        })
    });   
}