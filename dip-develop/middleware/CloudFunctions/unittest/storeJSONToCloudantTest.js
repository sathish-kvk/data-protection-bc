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

describe('createHash test suite', function() {
    before( function() {
        options = {
            apihost: 'openwhisk.eu-gb.bluemix.net',
            api_key: '7b126823-fdd0-45ec-b372-7f3958d3c2dd:aQt4MTBdfaPGi3Nm9K36rl6VXwkR6W0pVGDP8gkTY2J8AAFB1GcA94YymWRr19Hz'
        };
        
        ow = openwhisk(options);
        agreementJson = require("./data/storeJSONToCloudant/agreementJsonFromExport.json");
        main = adapt(main,ow);
    });

    describe('Test case 1 - Store the input JSON in local Cloudant', function(done) {
        it('Store the input JSON in local Cloudant', function() {
            var params = {
                agreement: agreementJson
            }
            var agreementID = agreementJson.agreementID;

            return ow.actions.invoke({name: 'common-ow/storeJSONToCloudant', blocking: true, result:true, params:params}).then(function(result) {
                console.log(JSON.stringify(result));
                assert.equal(result.agreement.agreementID, agreementID);
            }).catch(function(err) {
                console.log(JSON.stringify(err));
                assert.equal(false);
            });
        });
    });
});