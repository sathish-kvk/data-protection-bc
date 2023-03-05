/**
  *
  * main() will be run when you invoke this action
  *
  * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
 function main(params_in_downloadDocument) {
    console.log("Input params params_in_downloadDocument>> "+ JSON.stringify(params_in_downloadDocument));
    var openwhisk = require('openwhisk');
    const blocking = true, result = true;
    var ow = openwhisk();
    
    return ow.actions.invoke({ actionName: 'common-ow/digital-locker', blocking:true, result:true}).then(result => {
            var params = {
                sysDetails : result.sysDetails4Sql,
                filter: "filter[include]=documentHash&filter[order]=createdDate DESC&filter[limit]=1&filter[where][agreementID]=" + params_in_downloadDocument.agreementID 
                        + "&filter[where][elementID]=" + params_in_downloadDocument.elementID
            }
            return ow.actions.invoke({actionName: 'common-ow/getDocument', blocking: true, result:true, params}).then(result => {
                console.log("In downloadDocument >>> Received the response from getDocument>>> "+JSON.stringify(result));
                return {"documents" : result.documents};
            }).catch(err => {
                console.error('Failed to downloadDocument>>>>', err);
                return { "error": err };
            });
        }).catch(err => {
            console.error('Failed to downloadDocument>>>>', err)
            return { "error": err };
        });
}
 