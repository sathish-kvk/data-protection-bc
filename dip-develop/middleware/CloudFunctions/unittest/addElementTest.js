var assert = require('assert');
var openwhisk = require('openwhisk');
var ow;
var sysDetails;



describe('addElement test suite', function() {
    before( function() {
        sysDetails = {
            "api_protocol": "https",
            "api_hostname": "api.eu.apiconnect.ibmcloud.com/",
            "api_path": "dxc-digital-innovation-platform-dxcv/dxc-dip/api",
            "client_id": "444a4a69-3862-4b03-9522-a7851ff5bd48",
            "client_secret": "fB2dP4hC5bM0fN3dT7xM8dS8rM8tP2iR5wT7yI4rR6sF7qN8oD"
        };

        options = { 
            apihost: 'openwhisk.eu-gb.bluemix.net',
            api_key: 'cf98fbdc-7477-4527-a82e-1b4df0e2768b:iPptzOPUThPJhnTvUinOM1AYjwVk3s25SlWCn5XIUqgHKhOjFjjVZ8BrFLJtcjMG' 
        };
        ow = openwhisk(options);
    });
    describe('Test case 1 - validate element type', function(done) {
        it('Fail to add element for agreement with Type neither Calculation or Proposal', function() {
            var params = {
                "sysDetails": sysDetails,
                "elementID": "f158fa70-1635-11e8-8630-1d1b9b1b5274",
                "elementName": "startDate",
                "elementType": "Proposal",
                "elementValue": "",
                "fk_agreementID": "e458fa70-0635-11e8-8630-1d1b9a1b5473",
                "element_parent_elementID": null
            };

            return ow.actions.invoke({name: 'common-ow/addElement', blocking: true, result:true, params:params}).then(function(result) {
                console.log(JSON.stringify(result));
                assert(false);
            }).catch(function(err) {
                //console.log(err.error.response.result.error);
                //assert(true);
                assert.equal(err.error.response.result.error, "Fail to add element for agreement with Type neither Calculation or Proposal");
            });
        });
    });


    describe('Test case 2 - Check duplicate element name', function(done) {
        it('Check duplicate Element Name within agreement', function() {
            var params = {
                "sysDetails": sysDetails,
                "elementID": "f158fa70-1635-11e8-8630-1d1b9b1b5274",
                "elementName": "endDate",
                "elementType": "date",
                "elementValue": "today",
                "fk_agreementID": "e458fa70-0635-11e8-8630-1d1b9a1b5473",
                "element_parent_elementID": null
            };

            return ow.actions.invoke({name: 'common-ow/addElement', blocking: true, result:true, params:params}).then(function(result) {
                console.log(JSON.stringify(result));
                assert(false);
            }).catch(function(err) {
                //console.log(err.error.response);
                assert.equal(err.error.response.result.error, "Element has to unique within agreement");
            });
        });
    });

    describe('Test case 3 - Add element', function(done) {
        it('Add element to agreement', function() {
            var params = {
                "sysDetails": sysDetails,
                "elementID": "11e11e10-27e6-11e8-9b44-75658ead6f3b",
                "elementName": "endDate6",
                "elementType": "date",
                "elementValue": "",
                "fk_agreementID": "e458fa70-0635-11e8-8630-1d1b9a1b5473",
                "element_parent_elementID": null
            };
           return ow.actions.invoke({name: 'common-ow/addElement', blocking:true, result:true, params:params}).then(function(result) {
                console.log(JSON.stringify(result));
                //console.log('elementID: ' + result.elementID);
                assert.equal(result.elementID,params.elementID);
            }).catch(function(err) {
                //console.log(err.error.response.result.error);
                assert.fail(err.error.response.result.error);
            });
        });
        
    });

}); 