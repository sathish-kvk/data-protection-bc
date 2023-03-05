var assert = require('assert');
var main = require('./main.js');
var openwhisk = require('openwhisk');
var ow;


describe('addAgreement test suite', function () {
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

    describe('Test case 1 - Add existing agreement ID', function (done) {
        it('Add  existing agreement ID', function () {
            var params = {
                "sysDetails": sysDetails,
                "agreement": {
                    "agreementHash": "",
                    "agreementName": "",
                    "agreementChannelID": "",
                    "agreementStatus": "Negotiate",
                    "agreementID": "063370a0-04e0-11e8-994a-d3bc779b6eb7",
                    "lastProofID": ""
                }
            };

            return ow.actions.invoke({ name: 'common-ow/addAgreement', blocking: true, result: true, params: params }).then(function (result) {
                console.log(JSON.stringify(result));
                assert(false);
            }).catch(function (err) {
                var msg = err.error.response.result.error.code;
                console.log(err.error.response.result.error.errorMessage);
                //assert(true);
                assert.equal(msg, "ER_DUP_ENTRY");
            });
        });
    });
    describe('Test case 2 - Add blank agreement ID', function (done) {
        it('Add blank agreement ID', function () {
            var params = {
                "sysDetails": sysDetails,
                "agreement": {
                    "agreementHash": "Agreement 0000x",
                    "agreementName": "Agreement 0000x",
                    "agreementChannelID": "Agreement 0000x",
                    "agreementStatus": "",
                    "agreementID": "",
                    "lastProofID": "Agreement 0000x"
                }
            };
            return ow.actions.invoke({ name: 'common-ow/addAgreement', blocking: true, result: true, params: params }).then(function (result) {
                console.log(JSON.stringify(result));
                assert(true);
            }).catch(function (err) {
                console.log(err);
                assert(false);
                //assert.equal(err, "Test case 2 - Add blank agreement ID");
            });
        });
    });
}); 