var assert = require('assert');
var main = require('./main.js');
var openwhisk = require('openwhisk');
var ow;
require('linqjs');

describe('Validate test suite', function () {
    before(function () {
        sysDetails4Sql = {
            "api_hostname": "api.eu.apiconnect.ibmcloud.com/",
            "client_id": "77fc4cc2-1e5c-4702-8b58-5ce70f68cc95",
            "api_path": "dxc-digital-innovation-platform-acme-ltd/lb-prod/api",
            "client_secret": "eS6qM8hP0kX5bP0aL0yQ4xA5qJ7uB2cR3dW7vY4bP6fT2hS7uQ",
            "api_protocol": "https"
        };
        sysDetails4Cloudant = {
            "api_hostname": "api.eu.apiconnect.ibmcloud.com/",
            "client_id": "4da8634a-30d6-4a46-a74f-e8c81e35cd54",
            "api_path": "dxc-digital-innovation-platform-acme-ltd/lb-prod/api/cloudant",
            "client_secret": "gN3eQ2oN5rT7aK7eP1rR4iB4wV2jX0vE6bH4sP3pG5uQ3uF8cV",
            "api_protocol": "https"
        };
        options = {
            apihost: 'openwhisk.eu-gb.bluemix.net',
            api_key: "7b126823-fdd0-45ec-b372-7f3958d3c2dd:aQt4MTBdfaPGi3Nm9K36rl6VXwkR6W0pVGDP8gkTY2J8AAFB1GcA94YymWRr19Hz"
        };
        ow = openwhisk(options);
    });

    describe('Test case - Call goLive', function (done) {
        it('Test case - goLive successfully', function () {   

            var params = {
                "sysDetails4Sql": sysDetails4Sql,
                "sysDetails4Cloudant":sysDetails4Cloudant,
                "agreementID": "nnguyen77id0" //1609ee50-3267-11e8-9e5b-b349ccf119ff",
        };
            return ow.actions.invoke({ name: 'common-ow/goLive', blocking: true, result: true, params: params }).then(function (result) {
                console.log("Response from common-ow/goLive\n", JSON.stringify(result));
                assert.equal(result.agreementStatus,"Live");
                
            }).catch(function (err) {
                console.error(err)
                assert(false);
            });
        });
    });    
}); 