var assert = require('assert');
var main = require('./main.js');
var openwhisk = require('openwhisk');
var ow;


describe('validate test suite', function () {
    before(function () {
        sysDetails = {
            "api_hostname": "api.eu.apiconnect.ibmcloud.com/",
            "client_id": "3258ddf8-f98e-4ee0-b5bc-6d7b90de4ff7",
            "api_path": "dxc-digital-innovation-platform-acme-ltd/lb-prod/api",
            "client_secret": "V3xD7gL7hT5jR4sQ1fX0uD7cO3kW7dT4gY2dY4wO3sE2jE3qV0",
            "api_protocol": "https"
        };
        sysDetails4Cloudant = {
            "api_hostname": "api.eu.apiconnect.ibmcloud.com/",
            "client_id": "286d4c43-a8f6-4e4b-892e-81f7327a2d54",
            "api_path": "dxc-digital-innovation-platform-acme-ltd/lb-prod/api/cloudant",
            "client_secret": "Y4aU6vR3xJ8rO5uC6tD1gO6nK6hK0vH1eU6sD6bU8uG3yS8hM8",
            "api_protocol": "https"
        };
        options = {
            "apihost": "openwhisk.eu-gb.bluemix.net",
            "api_key": "7b126823-fdd0-45ec-b372-7f3958d3c2dd:LDpEEb4RrBGs0lo2bhm9hD4GaRbwsmsmh4jCXbkTWRohnO2ydNS39OindzAXjYyv"
        };
        ow = openwhisk(options);
    });

    describe('Test case - Check agreement exist', function (done) {
        it('Test case - Check agreement exist', function () {
            var params = {
                "agreementID": "45626be0-5748-11e8-a7d6-473e198eb1e3"
        };
       
        return ow.actions.invoke({ name: 'common-ow/checkExistAgreement', blocking: true, result: true, params: params }).then(function (result) {
            assert.equal(result.exists,true);
            console.log(JSON.stringify(result));
        }).catch(function (err) {
            console.log(err);
            assert(false);
        });           
            

        });
    });

    describe('Test case - AgreementId is Empty', function (done) {
        it('Test case - AgreementId is Empty', function () {
            var params = {
                "agreementID": ""
        };
     
        return ow.actions.invoke({ name: 'common-ow/checkExistAgreement', blocking: true, result: true, params: params }).then(function (result) {
            console.log(JSON.stringify(result));
        }).catch(function (err) {
            assert(err.error.response.result.error.includes("AgreementID is empty"));
            console.log(err);
        });           
            

        });
    });

}); 