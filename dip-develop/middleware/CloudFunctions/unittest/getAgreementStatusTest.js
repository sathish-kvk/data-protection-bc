var assert = require('assert');
var main = require('./main.js');
var openwhisk = require('openwhisk');
var ow;
require('linqjs');

describe('validate test suite', function () {
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

    describe('Test case - Return the agreement Status successfully', function (done) {
        it('Return the agreement Status successfully', function () {
            var params = {
                    "agreementID": "fed944f0-2b50-11e8-9314-4b14d7651436"
            };
            params.sysDetails = sysDetails;
            return ow.actions.invoke({ name: 'common-ow/getAgreementStatus', blocking: true, result: true, params: params }).then(function (result) {
                assert.equal(result.agreementStatus.toLowerCase(), "negotiate");
                console.log(JSON.stringify(result));
            }).catch(function (err) {
                console.log(err);
                assert(false);
            });           
        });
    });

    describe('Test case - AgreementId is Empty', function (done) {
        it('Test case - AgreementId is Empty', function () {
            var params = {
                    "agreementID": ""
            };
            params.sysDetails = sysDetails;
            return ow.actions.invoke({ name: 'common-ow/getAgreementStatus', blocking: true, result: true, params: params }).then(function (result) {
                console.log(JSON.stringify(result));
            }).catch(function (err) {
                assert(err.error.response.result.error.toLowerCase().includes("empty"));
                console.log(err);
            });           
        });
    });

}); 