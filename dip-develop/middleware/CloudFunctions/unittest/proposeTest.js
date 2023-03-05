var assert = require('assert');
var main = require('./main.js');
var openwhisk = require('openwhisk');
var ow;

describe('validate test suite', function () {
    before(function () {
        options = {
            "apihost": "openwhisk.eu-gb.bluemix.net",
            "api_key": "7b126823-fdd0-45ec-b372-7f3958d3c2dd:LDpEEb4RrBGs0lo2bhm9hD4GaRbwsmsmh4jCXbkTWRohnO2ydNS39OindzAXjYyv"    
        };

        ow = openwhisk(options);

        agreementID = "575ce590-58de-11e8-a075-f993f39667e8";
        elementID: "575d0ca4-58de-11e8-a075-f993f39667e8";
    });

    describe('Test case 1 - Call propose successfully', function (done) {
        it('Call propose successfully', function () {   

            var params_in_propose = {
                "agreementID": agreementID,
                "elementID": elementID,
                "proposedValue":"12"
            };
            return ow.actions.invoke({ actionName: 'common-ow/propose', blocking: true, result: true, params: params_in_propose }).then(result => {
                console.log("Call propose successfully\n", JSON.stringify(result));
                assert(true);                 
            }).catch(function (err) {
                console.error(err)
                assert(false);
            });
        });
    });
    
    describe('Test case 2 - AgreementID is empty', function (done) {
        it('AgreementID is empty', function () {
            var params = {
                "agreementID":"",
                "elementID": elementID,
                "proposedValue":"12"
            };

            return ow.actions.invoke({ name: 'common-ow/propose', blocking: true, result: true, params: params }).then(function (result) {
                console.log(JSON.stringify(result));
            }).catch(function (err) {
                assert.equal(err.error.response.result.error.toLowerCase(),"agreementid is empty")
                assert(true);
            });
        });
    });

    describe('Test case 3 - ElementID is empty', function (done) {
        it('ElementID is empty', function () {
            var params = {
                "agreementID": agreementID,
                "proposedValue": "12"
            };

            return ow.actions.invoke({ name: 'common-ow/propose', blocking: true, result: true, params: params }).then(function (result) {
                console.log(JSON.stringify(result));
            }).catch(function (err) {
                assert.equal(err.error.response.result.error.toLowerCase(),"elementid is empty")
                assert(true);
            });
        });
    });

    describe('Test case 4 - ProposedValue is empty', function (done) {
        it('ProposedValue is empty', function () {
            var params = {
                "agreementID": agreementID,
                "elementID": elementID,
            };

            return ow.actions.invoke({ name: 'common-ow/propose', blocking: true, result: true, params: params }).then(function (result) {
                console.log(JSON.stringify(result));
            }).catch(function (err) {
                assert.equal(err.error.response.result.error.toLowerCase(),"proposed value is empty")
                assert(true);
            });
        });
    });
}); 