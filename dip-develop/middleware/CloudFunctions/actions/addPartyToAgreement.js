/**
  *
  * main() will be run when you invoke this action
  *
  * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */

  function main(params_in_addPartyToAgreement) {
    console.log("Cloud function addPartyToAgreement with input params >> "+ JSON.stringify(params_in_addPartyToAgreement));
    var openwhisk = require('openwhisk');
    const blocking = true, result = true;
    var ow = openwhisk();
    var params = {
        sysDetails: params_in_addPartyToAgreement.sysDetails,
        filter : 'filter[where][partyName]=' + params_in_addPartyToAgreement.partyName 
    };

    return ow.actions.invoke({actionName: 'common-ow/getPartyByName', blocking, result, params}).then(result => {
        var party = result.parties[0];
        console.log('Party >>>' + JSON.stringify(party));
        if(party){
            console.log('Call insert Agreement has Party');
            var partyID = party.partyID;
            params_in_addPartyToAgreement.partyID = partyID;

            var params = params_in_addPartyToAgreement;

            console.log('param >>>' + JSON.stringify(params));
            //Call to insertAgreementHasParty 
            return ow.actions.invoke({actionName: 'common-ow/insertAgreementHasParty', blocking, result, params}).then(result => {
                console.log("In Insert Agreement Has Party >>> Received the response from insertAgreementHasParty>>> "+JSON.stringify(result));
                return {agreement_agreementID : result.agreement_agreementID,party_partyID:result.party_partyID};
            }).catch(err => {
                console.error('Failed to insert Agreement Has Party details>>>>', err)
                if (err.error.response.result.error.code == "ER_DUP_ENTRY") {
                    var errorObj = {
                        "code": err.error.response.result.error.code,
                        "message": "Failed to associate party to agreement because a party already associate with the agreement ID provided: " + params.agreementID
                        //"stack": err
                    };
                    return { "error": errorObj };
                    
                } else {
                    return {"error": err};
                }
            });

        } else {
            console.log('Party \'' + params_in_addPartyToAgreement.partyName + '\' does not exist.');
            return {"error":"Party \'"+ params_in_addPartyToAgreement.partyName +"\' does not exist."};
        }
    }).catch(err => {
        console.error('Failed to add party to agreement>>>>', err)
        return {"error": err};
    });
}