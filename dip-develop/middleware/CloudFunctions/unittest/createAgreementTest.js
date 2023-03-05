var assert = require('assert');
var openwhisk = require('openwhisk');
var ow;
var sysDetails;
var simpleContract;
var simpleContractInvalid;
var simpleContractInvalidParty;
var simpleContractInvalidElementType;
var simpleContractDuplicate;
var createdAgreementID="";

describe('createAgreement test suite', function() {
    before( function() {
        sysDetails = {
            "api_protocol": "https",
            "api_hostname": "api.eu.apiconnect.ibmcloud.com",
            "api_path": "/dxc-digital-innovation-platform-dxcv/dxc-dip/api",
            "client_id": "444a4a69-3862-4b03-9522-a7851ff5bd48",
            "client_secret": "fB2dP4hC5bM0fN3dT7xM8dS8rM8tP2iR5wT7yI4rR6sF7qN8oD"
        };

        options = { 
            apihost: 'openwhisk.eu-gb.bluemix.net',
            api_key: 'cf98fbdc-7477-4527-a82e-1b4df0e2768b:iPptzOPUThPJhnTvUinOM1AYjwVk3s25SlWCn5XIUqgHKhOjFjjVZ8BrFLJtcjMG' 
        };
        ow = openwhisk(options);
        simpleContract = require("./data/createAgreement/simpleContract.json");
        simpleContractInvalid = require("./data/createAgreement/simpleContract-invalid.json");
        simpleContractInvalidParty = require("./data/createAgreement/simpleContract-invalid-party.json");
        simpleContractInvalidElementType = require("./data/createAgreement/simpleContract-invalid-element-type.json");
        simpleContractDuplicate = require("./data/createAgreement/simpleContract-duplicate.json");

        simpleContract.sysDetails = sysDetails;
        simpleContractInvalid.sysDetails = sysDetails;
        simpleContractInvalidParty.sysDetails = sysDetails;
        simpleContractInvalidElementType.sysDetails = sysDetails;
        simpleContractDuplicate.sysDetails = sysDetails;
        //console.log(JSON.stringify(simpleContract));
    });
    
    after(function() {
        console.log('Clean up data');
        if (createdAgreementID !== ''){
            console.log('Remove agreement with ID: ' + createdAgreementID);
            var params = {sysDetails : sysDetails, agreementID:createdAgreementID};
            return ow.actions.invoke({name: 'common-ow/removeAgreement', blocking: true, result:true, params:params}).then(function(result) {
                console.log(JSON.stringify(result));
            }).catch(function(err) {
                console.log(JSON.stringify(err));
            });
        }
    });
    
    describe('Test case 1 - create agreement from JSON successfully', function(done) {
        it('Create Agreement from JSON', function() {
            var params = simpleContract;
            return ow.actions.invoke({name: 'common-ow/createAgreement', blocking: true, result:true, params:params}).then(function(result) {
                console.log(JSON.stringify(result));
                createdAgreementID = result.agreementID;
                assert(true);
            }).catch(function(err) {
                console.log(JSON.stringify(err));
                assert(false);
            });
        });
    });

    describe('Test case 2 - create agreement from JSON unsuccessfully - invalid rule types', function(done) {
        it('Invalid rule type', function() {
            var params = simpleContractInvalid;
            return ow.actions.invoke({name: 'common-ow/createAgreement', blocking: true, result:true, params:params}).then(function(result) {
                console.log(JSON.stringify(result));
                assert(false);
            }).catch(function(err) {
                var error = err.error.response.result.error;
                // Get list of error messages
                var errors = error.error.response.result.error;
                for (let index = 0; index < errors.length; index++) {
                    const errorMsg = errors[index];
                    console.log(errorMsg);
                }
                assert(true);
            });
        });
    });
    describe('Test case 3 - create agreement from JSON unsuccessfully - invalid element type', function(done) {
        it('Invalid element type', function() {
            var params = simpleContractInvalidElementType;
            return ow.actions.invoke({name: 'common-ow/createAgreement', blocking: true, result:true, params:params}).then(function(result) {
                console.log(JSON.stringify(result));
                assert(false);
            }).catch(function(err) {
                var error = err.error.response.result.error;
                // Get list of error messages
                var errors = error.error.response.result.error;
                for (let index = 0; index < errors.length; index++) {
                    const errorMsg = errors[index];
                    console.log(errorMsg);
                }
                assert(true);
            });
        });
    });
    describe('Test case 4 - create agreement from JSON unsuccessfully - invalid Party', function(done) {
        it('Invalid Party Name', function() {
            var params = simpleContractInvalidParty;
            return ow.actions.invoke({name: 'common-ow/createAgreement', blocking: true, result:true, params:params}).then(function(result) {
                console.log(JSON.stringify(result));
                assert(false);
            }).catch(function(err) {
                var error = err.error.response.result.error;
                // Get list of error messages
                var errors = error.error.response.result.error;
                for (let index = 0; index < errors.length; index++) {
                    const errorMsg = errors[index];
                    console.log(errorMsg);
                }
                assert(true);
            });
        });
    });

    describe('Test case 5 - create agreement from JSON unsuccessfully - duplicate agreement', function(done) {
        it('duplicate agreement', function() {
            var params = simpleContractDuplicate;
            return ow.actions.invoke({name: 'common-ow/createAgreement', blocking: true, result:true, params:params}).then(function(result) {
                console.log(JSON.stringify(result));
                assert(false);
            }).catch(function(err) {
                var errorMsg = err.error.response.result.error;
                console.log(errorMsg);
                assert(true);
            });
        });
    });
}); 