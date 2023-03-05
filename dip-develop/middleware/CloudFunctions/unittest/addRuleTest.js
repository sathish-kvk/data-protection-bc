var assert = require('assert');
var main = require('./main.js');
var openwhisk = require('openwhisk');
var ow;


describe('addRule test suite', function () {
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

    describe('Test case 1 - Add rule with empty ElementID', function (done) {
        it('Test case 1 - Add rule with empty ElementID', function () {
            var params = {
                "sysDetails": sysDetails,
                "rule": {
                    "ruleID": "",
                    "ruleType": "Constraint",
                    "ruleText": "Loi test",
                    "fk_ElementID": ""
                }
            };

            return ow.actions.invoke({ name: 'common-ow/addRule', blocking: true, result: true, params: params }).then(function (result) {
                console.log(JSON.stringify(result));
                assert(false);
            }).catch(function (err) {
                var msg = err.error.response.result.error;
                console.log(err.error.response.result);
                //assert(true);
                assert.equal(msg, "fk_ElementID is empty");
            });
        });
    });

    describe('Test case 2 - Add rule with invalid ruleType', function (done) {
        it('Test case 2 - Add rule with invalid ruleType', function () {
            var params = {
                "sysDetails": sysDetails,
                "rule": {
                    "ruleID": "",
                    "ruleType": "Rule #1",
                    "ruleText": "Loi test",
                    "fk_ElementID": "11b01a30-07e6-11e8-9b44-75658ead6f3b"
                }
            };

            return ow.actions.invoke({ name: 'common-ow/addRule', blocking: true, result: true, params: params }).then(function (result) {
                console.log(JSON.stringify(result));
                assert(false);
            }).catch(function (err) {
                var msg = err.error.response.result.error;
                console.log(err.error.response.result);
                //assert(true);
                assert.equal(msg, "ruleType is not correct: " + params.rule.ruleType + ". It must be either Constraint or Formula");
            });
        });
    });

    describe('Test case 3 - Add rule with the element having rule(s) and given ruleType = Formula', function (done) {
        it('Test case 3 - Add rule with the element having rule(s) and given ruleType = Formula', function () {
            var params = {
                "sysDetails": sysDetails,
                "rule": {
                    "ruleID": "",
                    "ruleType": "Formula",
                    "ruleText": "Loi test",
                    "fk_ElementID": "11b01a30-07e6-11e8-9b44-75658ead6f3b"
                }
            };

            return ow.actions.invoke({ name: 'common-ow/addRule', blocking: true, result: true, params: params }).then(function (result) {
                console.log(JSON.stringify(result));
                assert(false);
            }).catch(function (err) {
                var msg = err.error.response.result.error;
                console.log(err.error.response.result);
                //assert(true);
                if (msg.indexOf("cannot add rule") >= 0)
                    assert(true);
                else
                    assert(false);
            });
        });
    });

    describe('Test case 4 - Add rule with the elelemnt having a rule with type Formula', function (done) {
        it('Test case 4 - Add rule with the elelemnt having a rule with type Formula', function () {
            var params = {
                "sysDetails": sysDetails,
                "rule": {
                    "ruleID": "",
                    "ruleType": "constraint",
                    "ruleText": "Loi test",
                    "fk_ElementID": "11b01a30-07e6-11e8-9b44-75658ead6f3b"
                }
            };

            return ow.actions.invoke({ name: 'common-ow/addRule', blocking: true, result: true, params: params }).then(function (result) {
                console.log(JSON.stringify(result));
                assert(false);
            }).catch(function (err) {
                var msg = err.error.response.result.error;
                console.log(err.error.response.result);
                //assert(true);
                if (msg.indexOf("cannot add any rule") >= 0)
                    assert(true);
                else
                    assert(false);
            });
        });
    });

    describe('Test case 5 - Add rule happy case', function (done) {
        it('Test case 5 - Add rule happy case', function () {
            var params = {
                "sysDetails": sysDetails,
                "rule": {
                    "ruleID": "",
                    "ruleType": "constraint",
                    "ruleText": "Loi test",
                    "fk_ElementID": "8530962224775168"
                }
            };

            return ow.actions.invoke({ name: 'common-ow/addRule', blocking: true, result: true, params: params }).then(function (result) {
                console.log(JSON.stringify(result));
                assert(true);
            }).catch(function (err) {
                //var msg = err.error.response.result.error;
                console.log(err);
                assert(false);
            });
        });
    });
}); 