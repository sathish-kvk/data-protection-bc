/**
 *
 * main() will be invoked when you Run This Action
 *
 * @param OpenWhisk actions accept a single parameter, which must be a JSON object.
 *
 * @return The output of this action, which must be a JSON object.
 *
*/
function main(params_in_publish_proof) {
    var openwhisk = require('openwhisk');
    var ow = openwhisk();
    
    var proofID = params_in_publish_proof.proofID;
    var agreementHash = params_in_publish_proof.agreementHash;
    var partiesWithSignedHash = params_in_publish_proof.partiesWithSignedHash;

    var findProofParams = {
        agreementHash : agreementHash
    }
    console.log("PublishProof input - proofID:\n", JSON.stringify(proofID));
    console.log("PublishProof input - agreementHash:\n", JSON.stringify(agreementHash));
    console.log("PublishProof input - partiesWithSignedHash:\n", JSON.stringify(partiesWithSignedHash));
    return ow.actions.invoke({ name: 'common-ow/findProof', blocking: true, result: true, params: findProofParams }).then(function (result) {
        console.log("Response from findProof\n", JSON.stringify(result));

        if(result.result.length === 0){
            if(proofID === null || proofID === ""){
                return { "error": "ProofID is empty" };
            }
            if(agreementHash === null || agreementHash === ""){
                return { "error": "AgreementHash is empty" };
            }
            if(partiesWithSignedHash === null && partiesWithSignedHash.length === 0){
                return { "error": "SignedHash array is empty" };
            }
            var partySignatures = [];
            partiesWithSignedHash.forEach(function(element,index,array) {
                var item = {
                    party : {
                        partyID: array[index].partyID,
                        name: array[index].partyName
                    },
                    partySignature : array[index].partySignature
                }
                partySignatures.push(item)
            });
            var proofWithPartyInfo = {
                agreementHash : agreementHash,
                partySignatures : partySignatures,
                createdTime : new Date().toISOString()
            };
            var postProofParams = {
                proofID : proofID,
                DIPAuthorityID: "47bb2189-730c-4212-b471-db5130697dac",
                proof: proofWithPartyInfo
            };
            console.log("postProof input:\n", JSON.stringify(postProofParams));
            return ow.actions.invoke({ name: 'common-ow/postProof', blocking: true, result: true, params: postProofParams }).then(function (result) {
                console.log("Response from postProof\n", JSON.stringify(result));
                return result;
            }).catch(err => {
                console.error('Failed to call postProof', err)
                return { "error": err };
            });
        }
        else{
            return result[0];
        }
    }).catch(function (err) {
        console.error('Failed to call findProof', err)
        return { "error": err };
    });
}