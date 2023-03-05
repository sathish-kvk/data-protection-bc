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

describe('Compare hash test suite', function() {
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
            api_key: 'cf98fbdc-7477-4527-a82e-1b4df0e2768b:w5PCI8qZrzXJIJfKU39rve4YZRhOVKqU00k2g6kcWAtQXoeUaT0lVcNEoN04spIo'
        };
        ow = openwhisk(options);
        main = adapt(main,ow);
    });

    /*describe('Test case 1 - compare Hash function - expected SUCCESS', function(done) {
        it('compare Hash Function', function() {
            var params = {
                "sysDetails":sysDetails,
                "agreementID":"1609ee50-3267-11e8-9e5b-b349ccf119ff",
                "hash":"13f286a1a89c4c8b7d078edd58458a3f50987902bad6e86555273ad349e4c225"
            }
            return ow.actions.invoke({name: 'common-ow/compareHash', blocking: true, result:true, params:params}).then(function(result) {
                console.log(JSON.stringify(result));
                assert.equal("SUCCESS", result.status);
            }).catch(function(err) {
                console.log(JSON.stringify(err));
                assert.equal(false);
            });
        });
    });*/

    describe('Test case 2 - compare Hash function - expected RETRY', function(done) {
        it('compare Hash Function', function() {
            var params = {
                "sysDetails":sysDetails,
                "agreementID":"1609ee50-3267-11e8-9e5b-b349ccf119ff",
                "hash":"13f286a1a89c4c8b7d078edd58458a3f50987902bad6e86555273ad349e4c225"
            }
            return ow.actions.invoke({name: 'common-ow/compareHash', blocking: true, result:true, params:params}).then(function(result) {
                console.log(JSON.stringify(result));
                assert.equal("RETRY", result.status);
            }).catch(function(err) {
                console.log(JSON.stringify(err));
                assert.equal(false);
            });
        });
    });
});