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

describe('Consensus test suite', function() {
    before( function() {
        options = { 
            apihost: 'openwhisk.eu-gb.bluemix.net',
            api_key: '7b126823-fdd0-45ec-b372-7f3958d3c2dd:LDpEEb4RrBGs0lo2bhm9hD4GaRbwsmsmh4jCXbkTWRohnO2ydNS39OindzAXjYyv' 
        };
        ow = openwhisk(options);
        exportedJson = require("./data/consensus/exportedJson.json");
        exportedJsonChange = require("./data/consensus/exportedJsonChange.json");
        //exportedJson.sysDetails = sysDetails;
        main = adapt(main,ow);
    });

    describe('Test case 1 - Consensus an Agreement no change JSON', function(done) {
        it('Consensus an Agreement', function() {
            var params = {
                exportedJson : exportedJson,
                initiatorParty :"Acme Ltd"
            }
            return ow.actions.invoke({name: 'common-ow/consensus', blocking: true, result:true, params:params}).then(function(result) {
                console.log(JSON.stringify(result));
                assert(true);
            }).catch(function (err) {
                console.log(JSON.stringify(err));
                assert(false);
            });
        });
    });

    describe('Test case 2 - Consensus an Agreement with the Json change', function(done) {
        it('Consensus an Agreement with the Json change', function() {
            var params = {
                exportedJson : exportedJsonChange,
                initiatorParty :"Acme Ltd"
            }
            return ow.actions.invoke({name: 'common-ow/consensus', blocking: true, result:true, params:params}).then(function(result) {
                console.log(JSON.stringify(result));
                assert(true);
            }).catch(function (err) {
                console.log(JSON.stringify(err));
                assert(false);
            });
        });
    });
});