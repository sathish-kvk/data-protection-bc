var assert = require('assert');
var openwhisk = require('openwhisk');
var ow;
var proofAssetData = "";
var agreementHash = "";
describe('createAgreement test suite', function() {
    before( function() {
        options = { 
            apihost: 'openwhisk.eu-gb.bluemix.net',
            api_key: 'cf98fbdc-7477-4527-a82e-1b4df0e2768b:iPptzOPUThPJhnTvUinOM1AYjwVk3s25SlWCn5XIUqgHKhOjFjjVZ8BrFLJtcjMG' 
        };
        ow = openwhisk(options);
        proofAssetData = require("./data/blockchain/proofAssetData.json");
        agreementHash = proofAssetData.proof.agreementHash;
    });
    
    describe('Test case 1 - should postProof successfully', function(done) {
        it('should postProof successfully', function() {
            var params = proofAssetData;
            return ow.actions.invoke({name: 'common-ow/postProof', blocking: true, result:true, params:params}).then(function(result) {
                var transactionId = result.transactionId;
                console.log("transaction id:" + transactionId);
                assert(true);
            }).catch(function(err) {
                console.log(JSON.stringify(err));
                assert(false);
            });
        });
    });
    
    describe('Test case 2 - should findProof just created', function(done) {
        it('should findProof just created', function() {
            var params = {"agreementHash" : agreementHash };
            return ow.actions.invoke({name: 'common-ow/findProof', blocking: true, result:true, params:params}).then(function(result) {
                console.log("proofID: " + result.proofID);
                var proof = result.proof;
                console.log("agreementHash: " + proof.agreementHash);
                for(let i=0; i < proof.partySignatures.length; i++ ){
                    var partySignature = proof.partySignatures[i];
                    var partyID = partySignature.party.split("#")[1];
                    console.log("partyID: " + partyID + " --- partySignature:" +partySignature.partySignature );
                }
                console.log("createdTime: "+ proof.createdTime);
                assert(true);
            }).catch(function(err) {
                console.log(JSON.stringify(err));
                assert(false);
            });
        });
    });
}); 