var assert = require('assert');
var main = require('./main.js');
var openwhisk = require('openwhisk');
var ow;


describe('validate test suite', function () {
    before(function () {
        sysDetails4Cloudant = {
            "api_hostname": "api.eu.apiconnect.ibmcloud.com/",
            "client_id": "4da8634a-30d6-4a46-a74f-e8c81e35cd54",
            "api_path": "dxc-digital-innovation-platform-acme-ltd/lb-prod/api/cloudant",
            "client_secret": "gN3eQ2oN5rT7aK7eP1rR4iB4wV2jX0vE6bH4sP3pG5uQ3uF8cV",
            "api_protocol": "https"
        };
        sysDetails4Sql = {
            "api_hostname": "api.eu.apiconnect.ibmcloud.com/",
            "client_id": "77fc4cc2-1e5c-4702-8b58-5ce70f68cc95",
            "api_path": "dxc-digital-innovation-platform-acme-ltd/lb-prod/api",
            "client_secret": "eS6qM8hP0kX5bP0aL0yQ4xA5qJ7uB2cR3dW7vY4bP6fT2hS7uQ",
            "api_protocol": "https"
        };
        options = {
            "apihost": "openwhisk.eu-gb.bluemix.net",
            "api_key": "7b126823-fdd0-45ec-b372-7f3958d3c2dd:aQt4MTBdfaPGi3Nm9K36rl6VXwkR6W0pVGDP8gkTY2J8AAFB1GcA94YymWRr19Hz" 
        };
        ow = openwhisk(options);
    });

    // describe('Test case 1 - Return the updated agreement JSON successfully', function (done) {
    //     it('Return the updated agreement JSON successfully', function () {
    //         var params = {
    //                 "agreementID": "575ce590-58de-11e8-a075-f993f39667e8",
    //                 "elementID": "575d0ca4-58de-11e8-a075-f993f39667e8",
    //                 "proposedValue": "6"
    //         };
            
           

    //         return ow.actions.invoke({ name: 'common-ow/validate', blocking: true, result: true, params: params }).then(function (result) {
    //             var updatedElementValue = result.elements.first(x=>x.elementID == params.elementID).elementValue;
    //             assert.equal(updatedElementValue, params.proposedValue);
    //             console.log(JSON.stringify(result));

    //         }).catch(function (err) {
    //             console.log(err.error.response.result.error);
    //             assert(false);
    //         });           
    //     });
    // });

    describe('Test case 2 - AgreementID is empty', function (done) {
        it('AgreementID is empty', function () {
            var params = {
                    "agreementID": "",
                    "elementID": "390b2770-1bab-11e8-83e1-1d105301eb32",
                    "proposedValue": "10-Oct-2018"
            };
            

            return ow.actions.invoke({ name: 'common-ow/validate', blocking: true, result: true, params: params }).then(function (result) {
                console.log(JSON.stringify(result));

            }).catch(function (err) {
                assert.equal(err.error.response.result.error,"AgreementID is empty")
                assert(true);
            });
        });
    });

    describe('Test case 3 - Agreement Status is not Live', function (done) {
        it('Agreement Status is not Live', function () {
            var params = {
                    "agreementID": "67705740-58e9-11e8-8308-f5d43dd1af5f",
                    "elementID": "677168b5-58e9-11e8-8308-f5d43dd1af5f",
                    "proposedValue": "10-Oct-2018"
            };
         

            return ow.actions.invoke({ name: 'common-ow/validate', blocking: true, result: true, params: params }).then(function (result) {
                console.log(JSON.stringify(result));
            }).catch(function (err) {
                assert(err.error.response.result.error.includes("NOT Live"));
            });
        });
    });

    describe('Test case 4 - Proposed value type does not match with proposed value type', function (done) {
        it('Proposed value type does not match with proposed value type', function () {
            var params = {
                    "agreementID": "575ce590-58de-11e8-a075-f993f39667e8",
                    "elementID": "575d0ca4-58de-11e8-a075-f993f39667e8",
                    "proposedValue": "2018gf"
            };
         

            return ow.actions.invoke({ name: 'common-ow/validate', blocking: true, result: true, params: params }).then(function (result) {
                console.log(JSON.stringify(result));
            }).catch(function (err) {
                assert(err.error.response.result.error.includes("does not match with proposed value type"));
            });
        });
    });

    describe('Test case 5 - Element has Formula type', function (done) {
        it('Element has Formula type', function () {
            var params = {
              
                  "agreementID": "575ce590-58de-11e8-a075-f993f39667e8",
                  "elementID": "575d0ca7-58de-11e8-a075-f993f39667e8",
                    "proposedValue": "10-Oct-2018"
            };
          

            return ow.actions.invoke({ name: 'common-ow/validate', blocking: true, result: true, params: params }).then(function (result) {
                console.log(JSON.stringify(result));
            }).catch(function (err) {
                assert(err.error.response.result.error.includes("has a formula rule"));
            });
        });
    });

    describe('Test case 6 - Proposed value violate rule text with NUMBER Type', function (done) {
        it('Proposed value violate rule text', function () {
            var params = {
                    "agreementID": "575ce590-58de-11e8-a075-f993f39667e8",
                    "elementID": "575d0ca4-58de-11e8-a075-f993f39667e8",
                    "proposedValue": "2000"
            };
          

            return ow.actions.invoke({ name: 'common-ow/validate', blocking: true, result: true, params: params }).then(function (result) {
                console.log(JSON.stringify(result));
            }).catch(function (err) {
                console.log(err.error.response.result.error);
                assert(err.error.response.result.error.includes("violate"));
            });
        });
    });

    describe('Test case 7 - Proposed value violate rule text with TEXT Type', function (done) {
        it('Proposed value violate rule text', function () {
            var params = {
                    "agreementID": "575ce590-58de-11e8-a075-f993f39667e8",
                    "elementID": "575d0cac-58de-11e8-a075-f993f39667e8",
                    "proposedValue": "http://difference.com"
            };
          

            return ow.actions.invoke({ name: 'common-ow/validate', blocking: true, result: true, params: params }).then(function (result) {
                console.log(JSON.stringify(result));
            }).catch(function (err) {
                console.log(err.error.response.result.error);
                assert(err.error.response.result.error.includes("violate"));
            });
        });
    });

    describe('Test case 8 - Calculate elementValue Division by zero', function (done) {
        it('Calculate elementValue', function () {
            var params = {
                "agreementID": "575ce590-58de-11e8-a075-f993f39667e8",
                "elementID": "575d0cab-58de-11e8-a075-f993f39667e8",
                    "proposedValue": "0"
            };
           

            return ow.actions.invoke({ name: 'common-ow/validate', blocking: true, result: true, params: params }).then(function (result) {
                console.log(JSON.stringify(result));
            }).catch(function (err) {
                console.log(err.error.response.result.error);
                assert(err.error.response.result.error.includes("Division by zero"));
            });
        });
    });
    
}); 