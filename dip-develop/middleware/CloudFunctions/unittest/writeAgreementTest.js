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

describe('Write Agreement test suite', function() {
    before( function() {
        sysDetails =  {
            "api_hostname": "api.eu.apiconnect.ibmcloud.com/",
            "client_id": "77fc4cc2-1e5c-4702-8b58-5ce70f68cc95",
            "api_path": "dxc-digital-innovation-platform-acme-ltd/lb-prod/api",
            "client_secret": "jA6xV1wY8kF2mL3cN2iT3aN3fY1eK3jJ6uI1gD4yX8lH7xB3aQ",
            "api_protocol": "https"
        }
        options = {
            "apihost": "openwhisk.eu-gb.bluemix.net",
            "api_key": "7b126823-fdd0-45ec-b372-7f3958d3c2dd:LDpEEb4RrBGs0lo2bhm9hD4GaRbwsmsmh4jCXbkTWRohnO2ydNS39OindzAXjYyv"
        }
        ow = openwhisk(options);
        agreementJson = require("./data/writeAgreement/agreementJsonFromExport.json");
        main = adapt(main,ow);
    });

    describe('Test case 1 - Write Agreement function', function(done) {
        it('Write Agreement Function', function() {
            var agreementJsonFromExport = {};
            agreementJsonFromExport.sysDetails = sysDetails;
            agreementJsonFromExport.agreement = agreementJson;
            var agreementID = agreementJson.agreementID;
            var params = agreementJsonFromExport;
            return ow.actions.invoke({name: 'common-ow/writeAgreement', blocking: true, result:true, params:params}).then(function(result) {
                console.log(JSON.stringify(result));
                assert.equal(agreementID, result.agreementID);
            }).catch(function(err) {
                console.log(JSON.stringify(err));
                assert.equal(false);
            });
        });
    });
});