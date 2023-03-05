var assert = require('assert');
var main = require('./main.js');
var openwhisk = require('openwhisk');
var ow;

/**
* Create a function which delegates to openwhisk to run a function f
*/

function makeAdapter(f) {
    return function(params) {
        return ow.actions.invoke({name: f,
            blocking: true,
            result:true,
            params:params
        });
    };
}

/**
* For each function in an object, create an openwhisk adapter.
* return an object with each adapter function.
*/
function adapt(obj) {
    var adapter= {}
    for (var p in obj) {
        adapter[p] = makeAdapter(p)
    }

    return adapter;
}

describe('addPartyToAgreement test suite', function() {
    before( function() {
        options = { 
            apihost: 'openwhisk.eu-gb.bluemix.net',
            api_key: '7b126823-fdd0-45ec-b372-7f3958d3c2dd:LDpEEb4RrBGs0lo2bhm9hD4GaRbwsmsmh4jCXbkTWRohnO2ydNS39OindzAXjYyv' 
        };
        ow = openwhisk(options);
        main = adapt(main,ow);
    });

    /*describe('Test case 1 - Associate non-existing party name to the agreement', function(done) {
        it('Test non-existing party name', function() {
            var params = {
                "sysDetails": {
                    "api_hostname": "api.eu.apiconnect.ibmcloud.com/",
                    "client_id": "3258ddf8-f98e-4ee0-b5bc-6d7b90de4ff7",
                    "api_path": "dxc-digital-innovation-platform-acme-ltd/lb-prod/api",
                    "client_secret": "V3xD7gL7hT5jR4sQ1fX0uD7cO3kW7dT4gY2dY4wO3sE2jE3qV0",
                    "api_protocol": "https"
                },
                "agreementID": "f9ba20c0-4e82-11e8-a230-e97c8bff1003",
                "partyName": "TestLandlordAgent"
            };

            return ow.actions.invoke({name: 'common-ow/addPartyToAgreement', blocking: true, result:true, params:params}).then(function(result) {
                console.log(JSON.stringify(result));
                assert(false);
            }).catch(function(err) {
                console.log(err.error.response.result.error);
                assert.equal(err.error.response.result.error, "Party \'"+ params.partyName +"\' does not exist.");
            });
        });
    });

    /*describe('Test case 2 - Add a party already associate with the agreement', function(done) {
        it('Add a party already associate with the agreement', function() {
            var params = {
                "sysDetails": {
                    "api_protocol": "https",
                    "api_hostname": "api.eu.apiconnect.ibmcloud.com/",
                    "api_path": "dxc-digital-innovation-platform-dxcv/dxc-dip/api",
                    "client_id": "444a4a69-3862-4b03-9522-a7851ff5bd48",
                    "client_secret": "fB2dP4hC5bM0fN3dT7xM8dS8rM8tP2iR5wT7yI4rR6sF7qN8oD"
                },
                "agreementID": "0358aa70-0d74-11e8-b282-8f111ca6e8fd",
                "partyName": "Fuel Total Systems Corp"
            };

            return ow.actions.invoke({name: 'common-ow/addPartyToAgreement', blocking: true, result:true, params:params}).then(function(result) {
                console.log(JSON.stringify(result));
                assert(false);
            }).catch(function(err) {
                var errorCode = err.error.response.result.error.code;
                console.log(err.error.response.result.error.message);
                assert.equal(errorCode, "ER_DUP_ENTRY");
            });
        });
    });*/

    describe('Test case 3 - Associate a party to the agreement (happy case)', function(done) {
        it('Associate a party to the agreement', function() {
            var params = {
                "sysDetails": {
                    "api_hostname": "api.eu.apiconnect.ibmcloud.com/",
                    "client_id": "3258ddf8-f98e-4ee0-b5bc-6d7b90de4ff7",
                    "api_path": "dxc-digital-innovation-platform-acme-ltd/lb-prod/api",
                    "client_secret": "V3xD7gL7hT5jR4sQ1fX0uD7cO3kW7dT4gY2dY4wO3sE2jE3qV0",
                    "api_protocol": "https"
                },
                "agreementID": "ffba6fc0-4e87-11e8-8095-69b65b365d2d",
                "partyName" : "TestLandlordAgent"
            };
            return ow.actions.invoke({name: 'common-ow/addPartyToAgreement', blocking: true, result:true, params:params}).then(function(result) {
                console.log(JSON.stringify(result));
                assert.equal(result.agreement_agreementID, params.agreementID);
            }).catch(function(err) {
                console.log("Expected: " + err.expected);
                console.log("Actual: " + err.actual);
                assert(false);
            });
        });
    });
});