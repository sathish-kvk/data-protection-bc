/**
  *
  * main() will be run when you invoke this action
  *
  * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */

  function main(params_in_exportAgreement) {
    console.log("Cloud function exportAgreement with input params >> "+ JSON.stringify(params_in_exportAgreement));
    var openwhisk = require('openwhisk');
    var hash = require('object-hash');
	var deleteKey = require('key-del');
    const blocking = true, result = true;
    var ow = openwhisk();
    var params = {
        sysDetails: params_in_exportAgreement.sysDetails,
        filter : 'filter[include][elements]=elementRules&filter[where][agreementID]=' + params_in_exportAgreement.agreementID 
    };
	var DEFAULT_VERSION = "1.0";
	var oldVersion = "";
	var newVersion = "";

    return ow.actions.invoke({actionName: 'common-ow/getAgreementAndDescendants', blocking, result, params}).then(result => {
		console.log('Result >>>>>>>>>>>' + JSON.stringify(result));
        var agreement = result.result[0];
        console.log('Agreement >>>' + JSON.stringify(agreement));
        if(agreement){
			//Remove unnessessary fields
            agreement = deleteKey(agreement, ['element_parent_elementID', 'fk_agreementID','fk_ElementID', 'fk_ElementID']);
            //Add parties for agreement
            var params = {
                sysDetails: params_in_exportAgreement.sysDetails,
                filter : 'filter[fields][party_partyID]=true&filter[include][party]&filter[where][agreement_agreementID]=' + params_in_exportAgreement.agreementID
            };
            return ow.actions.invoke({actionName: 'common-ow/getPartiesByAgreement', blocking, result, params}).then(result => {
            console.log("In getting parties by agreement>>> Received the response from getPartiesByAgreement>>> "+JSON.stringify(result));
            var parties = [];	
            result.parties.forEach(function(entry) {
                var party = {
                    "partyID":entry.party.partyID,
                    "partyName":entry.party.partyName
                }
                parties.push(party);
            });

            agreement.parties = parties;
            //Ending add parties
            //Hash new agreement for comparing with the previous verion
            var newAgreementHash = hash(agreement);
            console.log('New Agreement Hash >>>' + JSON.stringify(newAgreementHash));
            //Call to get previous version of agreement.
			//Change the param to cloudant url
            params_in_exportAgreement.sysDetails.api_path = params_in_exportAgreement.sysDetails.api_path + '/cloudant';
            params_in_exportAgreement.filter = "filter[_id]=true&filter[_rev]=true&filter[version]=true&filter[hash]=true&filter[agreement]=true&filter[where][agreement.agreementID]="+ agreement.agreementID +"&filter[order]=version%20DESC&filter[limit]= 1";
            var params = params_in_exportAgreement;
            console.log('param befor calling getNewestAgreementFromCloudant  >>>' + JSON.stringify(params));
            return ow.actions.invoke({actionName: 'common-ow/getNewestAgreementInCloudant', blocking, result, params}).then(result => {
            console.log("In getting latest Agreement from Cloudant >>> Received the response from getNewestAgreementInCloudant>>> "+JSON.stringify(result));
            var cdAgreement = result.agreements[0];
            console.log('Latest Agreement from Cloudant >>>' + JSON.stringify(cdAgreement));
            if(cdAgreement) {
                //Compare the hash between old and new agreement
                if(newAgreementHash == cdAgreement.hash) {
					//No Change return the newest Agreement from Cloudant
                    return {"result":cdAgreement};
                }
             oldVersion = cdAgreement.version;
            } 
            console.log('Call write Agreement to Cloudant');
			//Checking version of agreement
		   if(oldVersion){
			   newVersion = Number(Number(oldVersion) + 0.1).toFixed(1);
		   } else {
			   newVersion = DEFAULT_VERSION;
		   }
		    console.log('New version of Agreement is ' + newVersion);
            params_in_exportAgreement.hash = newAgreementHash;
            params_in_exportAgreement.body = agreement;
			params_in_exportAgreement.version = newVersion;
            console.log('Param before calling writeAgreementToCloudant  >>>' + JSON.stringify(params));
            //Call to exportAgreement
            return ow.actions.invoke({actionName: 'common-ow/writeAgreementToCloudant', blocking, result, params}).then(result => {
                console.log("In Write Agreement To Cloudant >>> Received the response from writeAgreementToCloudant>>> "+JSON.stringify(result));
                return {result};
            }).catch(err => {
                console.error('Failed to write Agreement to Cloudant details>>>>', err)
            });
            
        }).catch(err => {
                console.error('Failed to get latest Agreement from Cloudant details>>>>', err)
        });

        }).catch(err => {
        console.error('Failed to get parties from agreement details>>>>', err)
        });       

      } else {
            console.log('Agreement ID \''+ params_in_exportAgreement.agreementID +'\' does not exist.');
            return {"error":"Agreement ID \'"+ params_in_exportAgreement.agreementID +"\' does not exist."};
      }
    }).catch(err => {
        console.error('Failed to write agreement to cloudant>>>>', err)
    });
}

 exports.main = main;