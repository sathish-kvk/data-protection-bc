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
        sysDetails = {
            "api_hostname": "api.eu.apiconnect.ibmcloud.com/",
            "client_id": "3258ddf8-f98e-4ee0-b5bc-6d7b90de4ff7",
            "api_path": "dxc-digital-innovation-platform-acme-ltd/lb-prod/api",
            "client_secret": "V3xD7gL7hT5jR4sQ1fX0uD7cO3kW7dT4gY2dY4wO3sE2jE3qV0",
            "api_protocol": "https"
        };
        options = {
            "apihost": "openwhisk.eu-gb.bluemix.net",
            "api_key": "7b126823-fdd0-45ec-b372-7f3958d3c2dd:LDpEEb4RrBGs0lo2bhm9hD4GaRbwsmsmh4jCXbkTWRohnO2ydNS39OindzAXjYyv"
        };
        ow = openwhisk(options);
        extendJson = require("./data/extend/extendInput.json");
        main = adapt(main, ow);
    });

    describe('Test case 1 - Extend function', function (done) {
        it('Extend function', function () {
            var params = {
                sysDetails : sysDetails,
                extendJson : extendJson
            };
            var agreementID = extendJson.agreementID;
            return ow.actions.invoke({ name: 'common-ow/extend', blocking: true, result: true, params: params }).then(function (result) {
                console.log(JSON.stringify(result));
                assert.equal(agreementID, result.agreementID);
            }).catch(function (err) {
                console.log(JSON.stringify(err));
                assert(false);
            });
        });
    });
});