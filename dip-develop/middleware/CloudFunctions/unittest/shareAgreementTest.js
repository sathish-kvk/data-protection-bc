var assert = require('assert');
var main = require('./main.js');
var openwhisk = require('openwhisk');
var ow;

/**
* Create a function which delegates to openwhisk to run a function f
*/

function makeAdapter(f) {
    return function (params) {
        return ow.actions.invoke({
            name: f,
            blocking: true,
            result: true,
            params: params
        });
    };
}

/**
* For each function in an object, create an openwhisk adapter.
* return an object with each adapter function.
*/
function adapt(obj) {
    var adapter = {}
    for (var p in obj) {
        adapter[p] = makeAdapter(p)
    }

    return adapter;
}

describe('shareAgreement test suite', function () {
    before(function () {
        /* sysDetails4Sql = {
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
            apihost: 'openwhisk.eu-gb.bluemix.net',
            api_key: '7b126823-fdd0-45ec-b372-7f3958d3c2dd:LDpEEb4RrBGs0lo2bhm9hD4GaRbwsmsmh4jCXbkTWRohnO2ydNS39OindzAXjYyv'
        }; */

        sysDetails4Sql = {
            "api_hostname": "api.eu.apiconnect.ibmcloud.com/",
    "client_id": "a837286c-2a53-49b9-9f38-cb95a9f869f7",
    "api_path": "dxc-digital-innovation-platform-testlandlord/lb-prod/api",
    "client_secret": "K3xB5oT7bQ1oL8oM6vO1sE4iT2sF6pR3lP8tD5kO3iE6vL6pB3",
    "api_protocol": "https"
        };
        sysDetails4Cloudant = {
            "api_hostname": "api.eu.apiconnect.ibmcloud.com/",
    "client_id": "ca1d4d3d-dff0-454b-a74a-06c9bc795642",
    "api_path": "dxc-digital-innovation-platform-testlandlord/lb-prod/api/cloudant",
    "client_secret": "xP5hR5jN4uX7yU6tA1rI8cM7lK4dW6sM3uF1bO5iR6rE3tJ5eD",
    "api_protocol": "https"
        };
        options = {
            "apihost": "openwhisk.eu-gb.bluemix.net",
      "api_key": "d10c6858-cdcb-48a5-a4a5-8faf656ac2e5:6PSSteQJQzIO4Zv2o19PFbCx9FflCNw0q8fm74aFPRDxAiQR7l4T0iJIrGN6L2KC"
        };
        ow = openwhisk(options);
        simpleContractForShare = require("./data/shareAgreement/simpleContractForShare.json");
        simpleContractForShare.sysDetails4Cloudant = sysDetails4Cloudant;
        simpleContractForShare.sysDetails4Sql = sysDetails4Sql;
        //simpleInvalidContractForShare = require("./data/shareAgreement/simpleContract-invalid.json");
        //simpleInvalidContractForShare.sysDetails = sysDetails;
        //console.log(JSON.stringify(simpleContractForShare));
        main = adapt(main, ow);
    });

    describe('Test case 1 - Share an Agreement', function (done) {
        it('Share an Agreement', function () {
            var params = simpleContractForShare;
            params.initiatorParty = "Acme Ltd";
            return ow.actions.invoke({ name: 'common-ow/shareAgreement', blocking: true, result: true, params: params }).then(function (result) {
                console.log(JSON.stringify(result));
                assert.equal(result.info.message, "Agreement \'" + simpleContractForShare.agreementName + "\' has been created. Trigger is invoked to share to other parties.");
            }).catch(function (err) {
                console.log(JSON.stringify(err));
                assert.equal(false);
            });
        });
    });

    /*describe('Test case 2 - Share an invalid Agreement', function(done) {
        it('Sharing invalid an Agreement', function() {
           var params = simpleInvalidContractForShare;
           params.initiatorParty = "Toyota Motor Corporation";
            return ow.actions.invoke({name: 'common-ow/shareAgreement', blocking: true, result:true, params:params}).then(function(result) {
               console.log(JSON.stringify(result));
               assert.equal(false);
            }).catch(function(err) {
               var error = err.error.response.result.error;
               var errors = error.response.result.error.error.response.result.error;
               for (let index = 0; index < errors.length; index++) {
                   const errorMsg = errors[index];
                   console.log(errorMsg);
               }
                assert(true);
            });
        });
    });*/
});