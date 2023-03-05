var assert = require('assert');
var main = require('./main.js');
var openwhisk = require('openwhisk');
var ow;


describe('evaluate test suite', function () {
    before(function () {
        sysDetails = {
            "api_protocol": "https",
            "api_hostname": "api.eu.apiconnect.ibmcloud.com/",
            "api_path": "dxc-digital-innovation-platform-dxcv/dxc-dip/api",
            "client_id": "444a4a69-3862-4b03-9522-a7851ff5bd48",
            "client_secret": "fB2dP4hC5bM0fN3dT7xM8dS8rM8tP2iR5wT7yI4rR6sF7qN8oD"
        };
        options = {
            apihost: 'openwhisk.eu-gb.bluemix.net',
            api_key: 'cf98fbdc-7477-4527-a82e-1b4df0e2768b:w5PCI8qZrzXJIJfKU39rve4YZRhOVKqU00k2g6kcWAtQXoeUaT0lVcNEoN04spIo'
        };
        ow = openwhisk(options);
    });

    // describe('Test case 1 - Evaluate rule with integer data', function (done) {
    //     it('Evaluate rule with integer data', function () {
    //         var params = {
    //             "sysDetails": sysDetails,
    //             "rule": {
    //                 "ruleID": "fd3bf2a0-1007-11e8-a7aa-4b5346a46f87"
    //             },
    //             "proposedValue": 15
    //         };

    //         return ow.actions.invoke({ name: 'common-ow/evaluate', blocking: true, result: true, params: params }).then(function (result) {
    //             console.log(JSON.stringify(result));
    //             assert(true);
    //         }).catch(function (err) {
    //             var msg = err.error.response.result.error.code;
    //             console.log(err.error.response.result.error.errorMessage);
    //             assert(false);
    //         });
    //     });
    // });

    // describe('Test case 2 - Evaluate rule with date data', function (done) {
    //     it('Evaluate rule with date data', function () {
    //         var params = {
    //             "sysDetails": sysDetails,
    //             "rule": {
    //                 "ruleID": "0358aa73-0d74-11e8-b282-8f111ca6e8fd"
    //             },
    //             "proposedValue": "3/3/2019"
    //         };

    //         return ow.actions.invoke({ name: 'common-ow/evaluate', blocking: true, result: true, params: params }).then(function (result) {
    //             console.log(JSON.stringify(result));
    //             assert(true);
    //         }).catch(function (err) {
    //             var msg = err.error.response.result.error.code;
    //             console.log(err.error.response.result.error.errorMessage);
    //             assert(false);
    //         });
    //     });
    // });
    
    describe('Test case 2 - Evaluate rule with invalid data', function (done) {
        it('Evaluate rule with invalid data', function () {
            var params = {
                "sysDetails": sysDetails,
                "rule": {
                    "ruleID": "0d1e7690-0bb0-11e8-abff-55ef624708be"
                },
                "proposedValue": "3/3/2019"
            };

            return ow.actions.invoke({ name: 'common-ow/evaluate', blocking: true, result: true, params: params }).then(function (result) {
                console.log(JSON.stringify(result));
                assert(true);
            }).catch(function (err) {
                var msg = err.error.response.result;
                console.log(msg);
                assert(true);
            });
        });
    });
}); 