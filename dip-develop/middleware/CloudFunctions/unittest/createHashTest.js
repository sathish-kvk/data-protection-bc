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

describe('createHash test suite', function () {
    before(function () {
        //Acme Ltd
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
        };
        //Property Management PLC

        /* sysDetails4Cloudant = {
            "api_hostname": "api.eu.apiconnect.ibmcloud.com/",
            "client_id": "340d70d2-01b9-4f9c-bdaf-b4aa741a6137",
            "api_path": "dxc-digital-innovation-platform-property-management-plc/lb-prod/api/cloudant",
            "client_secret": "lN2jL2oV5lR6aY1bR1oK3gY4jO3xL5kR7hC0dY4vW3jB3qP7eX",
            "api_protocol": "https"
        };
        options = {
            apihost: 'openwhisk.eu-gb.bluemix.net',
            api_key: '20ce7dee-235b-4dc0-95c3-6f10d5e4ae81:UQfmTEa0eLIY73yKQEkWKnkQYFG4yQDd0KxsnFGD6BjkoDkbCItl1stGoECOQ7FA'
        }; */

        //Barnsley Landlord Services

        /* sysDetails4Cloudant = {
            "api_hostname": "api.eu.apiconnect.ibmcloud.com/",
            "client_id": "f889eabc-cdef-43c4-9dee-6578eac657fa",
            "api_path": "dxc-digital-innovation-platform-barnsley-landlord-services/lb-prod/api/cloudant",
            "client_secret": "R3hY2gF4kT5qR8kT2cC6uY0eQ0wX7jY3yC0aH7pS8jB1kF8uU3",
            "api_protocol": "https"
        };
        options = {
            apihost: 'openwhisk.eu-gb.bluemix.net',
            api_key: 'aed2b851-d43f-462f-9165-e95e28fe1323:Kf1alhZ3H2ERJkH3lFiUQzgg58G6XSYDbUhnsHdeml2kuyuzAEtszB66l8JNG1ZN'
        }; */

        //Rigsby Landlords
        
        /* sysDetails4Cloudant = {
            "api_hostname": "api.eu.apiconnect.ibmcloud.com/",
            "client_id": "22e4cf40-0c2e-4eaf-9d00-0b3fee8af2e1",
            "api_path": "dxc-digital-innovation-platform-rigsby-landlords/lb-prod/api/cloudant",
            "client_secret": "qJ6hU2xQ0uB8qE5sW4vW3tB3vD0wY4vM5iE5nC6rH1eF5rM8aP",
            "api_protocol": "https"
        };
        options = {
            apihost: 'openwhisk.eu-gb.bluemix.net',
            api_key: '1477f695-cd5f-4f4f-910d-67a20454a4eb:v5EslQh85I6JAXucgTl03AkN6VRw5QHOYMNMVrO5BUFSg1wVWzUliZFT6PL75SMe'
        }; */
        ow = openwhisk(options);
        //agreementJson = require("./data/createHash/agreement17JsonFromExport.json");
        //agreementJson = require("./data/createHash/agreement18JsonFromExport.json");
        agreementJson = require("./data/createHash/agreementTest.json");
        main = adapt(main, ow);
    });

    describe('Test case 1 - create Hash function', function (done) {
        it('create Hash Function', function () {
            var agreementJsonFromExport = {};
            agreementJsonFromExport.sysDetails4Cloudant = sysDetails4Cloudant;
            agreementJsonFromExport.agreement = agreementJson;
            var agreementID = agreementJson.agreementID;
            var params = agreementJsonFromExport;
            return ow.actions.invoke({ name: 'common-ow/createHash', blocking: true, result: true, params: params }).then(function (result) {
                console.log(JSON.stringify(result));
                assert.equal(agreementID, result.agreementID);
            }).catch(function (err) {
                console.log(JSON.stringify(err));
                assert(false);
            });
        });
    });
});