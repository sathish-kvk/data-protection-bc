/**
  *
  * main() will be invoked when you Run This Action
  *
  * @param OpenWhisk actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
function main(params) {
    var request = require("request");
    var openwhisk = require('openwhisk');
    var ow = openwhisk();

    return ow.actions.invoke({ actionName: 'common-ow/digital-locker', blocking: true, result: true }).then(result => {
        var sysDetails4Sql = result.sysDetails4Sql;
        var url = sysDetails4Sql.api_protocol + "://" + sysDetails4Sql.api_hostname + sysDetails4Sql.api_path + '/agreements?filter[where][agreementStatus]=Negotiate';
        var options = {
            method: 'GET',
            url: url,
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                'x-ibm-client-secret': sysDetails4Sql.client_secret,
                'x-ibm-client-id': sysDetails4Sql.client_id
            },
            json: true
        };

        return new Promise(function (resolve, reject) {
            console.log('Request >>>>>>>>>>\n' + JSON.stringify(options))
            request(options, function (error, response, body) {
                if (error) {
                    console.error('Error >>>>>>>>>> ', error);
                    reject(error);
                }
                else {
                    console.log('Number of items = ', body.length);
                    console.log('Response >>>>>>>>>>\n', JSON.stringify(body));
                    resolve({result: body});
                }
            })
        })
    });
}
