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

describe('exportAgreement test suite', function() {
    before( function() {
        options = { 
            apihost: 'openwhisk.eu-gb.bluemix.net',
            api_key: 'cf98fbdc-7477-4527-a82e-1b4df0e2768b:kdfICG8rYOAggOkUeiHCP4M9WZzcS6eDbqFxTO12NMIaNth4lBgjrJv2GKUy8nuj' 
        };
        ow = openwhisk(options);
        main = adapt(main,ow);
    });

    describe('Test case 1 - Export an Agreement', function(done) {
        it('Export an Agreement', function() {
            var params = {
                "agreementID": "337402e0-1b98-11e8-acd4-b33639196e3c"
            };
            return ow.actions.invoke({name: 'common-ow/exportAgreement', blocking: true, result:true, params:params}).then(function(result) {
                console.log(JSON.stringify(result));
                assert.equal(result.agreement.agreementID, params.agreementID);
            }).catch(function(err) {
                console.log("Expected: " + err.expected);
                console.log("Actual: " + err.actual);
                assert(false);
            });
        });
    });

    describe('Test case 2 - Export an existing Agreement', function(done) {
        it('Export an existing Agreement', function() {
            var params = {
                "agreementID": "337402e0-1b98-11e8-acd4-b33639196e3c"
            };
            return ow.actions.invoke({name: 'common-ow/exportAgreement', blocking: true, result:true, params:params}).then(function(result) {
                console.log(JSON.stringify(result));
                assert.equal(result.agreement.agreementID, params.agreementID);
            }).catch(function(err) {
                console.log("Expected: " + err.expected);
                console.log("Actual: " + err.actual);
                assert(false);
            });
        });
    });

    describe('Test case 3 - Export No Change Agreement', function(done) {
        it('Export No Change Agreement', function() {
            var params = {
                "agreementID": "337402e0-1b98-11e8-acd4-b33639196e3c"
            };
            return ow.actions.invoke({name: 'common-ow/exportAgreement', blocking: true, result:true, params:params}).then(function(result) {
                console.log(JSON.stringify(result));
                assert.equal(result.agreement.agreementID, params.agreementID);
            }).catch(function(err) {
                console.log("Expected: " + err.expected);
                console.log("Actual: " + err.actual);
                assert(false);
            });
        });
    });

    describe('Test case 4 - Export non-existing Agreement', function(done) {
        it('Export non-existing Agreement', function() {
            var params = {
                "agreementID": "tinhtest19",
            };
            return ow.actions.invoke({name: 'common-ow/exportAgreement', blocking: true, result:true, params:params}).then(function(result) {
                console.log(JSON.stringify(result));
                assert(false);
            }).catch(function(err) {
                console.log(err.error.response.result.error);
                assert.equal(err.error.response.result.error, "Agreement ID \'"+ params.agreementID +"\' does not exist.");
            });
        });
    });
});