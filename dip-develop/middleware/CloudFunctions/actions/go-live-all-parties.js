
 function main(params) {
    console.log("go-live-all-parties Input >>>>>> "+ JSON.stringify(params));
    var openwhisk = require('openwhisk');
    var ow = openwhisk();
    var agreementID = params.agreementID;
    var allParties = params.parties;

    return new Promise(function(resolve, reject) {
        var goLiveActions = allParties.map(goLiveOnEachParty.bind(null));
        function goLiveOnEachParty(item){
            var ow = openwhisk(item.cloudFunctions.options);
            var goLiveParams = {
                agreementID: item.agreement.agreementID
            };
            return new Promise(function (resolve, reject) {
                return ow.actions.invoke({ actionName: "/"+ "_" + "/common-ow/goLive", blocking: true, result: true, params: goLiveParams }).then(result => {
                    console.log('goLive on each Party - ' + item.partyName + '\n', JSON.stringify(result));
                    resolve(result);
                }).catch(err => {
                    console.error('Failed to call goLive on ', item.partyName, err)
                    reject(err);
                });
            }).catch(function (err) {
                return err;
            });
        }

        return Promise.all(goLiveActions).then(function(results) {
            console.log("goLive on all parties result >>>>>>>>>>\n", JSON.stringify(results));

            var hasErrorResponse = results.some(element => {
                return element.result === undefined;
            });
            
            if(!hasErrorResponse){
                var hashFromConsensus = results[0].result.agreementHash;
                console.log("Hash from consensus >>>>>>>>>>\n" + hashFromConsensus);

                var signActions = allParties.map(signEachParty.bind(null));
                function signEachParty(item){
                    var ow = openwhisk(item.cloudFunctions.options);
                    var params = {
                        agreementID : agreementID,
                        unsignedHash : hashFromConsensus
                    };
                    return new Promise(function (resolve, reject) {
                        return ow.actions.invoke({ actionName: "/"+ "_" +"/common-ow/sign", blocking: true, result: true, params: params }).then(result => {
                            console.log('Signed on each party - '+ item.partyName + '\n', JSON.stringify(result));
                            resolve(result);
                        }).catch(err => {
                            console.error('Failed to call sign on party ',  JSON.stringify(item.partyName), err)
                            reject(err);
                        });
                    }).catch(function (err) {
                        return err;
                    });
                }
                return Promise.all(signActions).then(function(results) {
                    console.log('Sign on all parties result >>>>>>>>>>\n', JSON.stringify(results));

                    var params = { 
                        agreementID : agreementID 
                    };
                    return ow.triggers.invoke({ triggerName: 'trigger-4-update-status-all-parties', params: params}).then(result => {
                        console.log('Call trigger-4-update-status-all-parties done >>>>>>>>>> ', JSON.stringify(result));

                        var params = {
                            agreementID : agreementID,
                            agreementHash : hashFromConsensus
                        };
                        return ow.actions.invoke({ actionName: 'common-ow/proof', blocking: false, result: true, params: params }).then(result => {
                            console.log('Call Proof done >>>>>>>>>>', JSON.stringify(result));
    
                            return resolve({result: "SUCCESS"});
                        }).catch(err => {
                            console.error('Failed to call proof', err)
                            reject(err);
                        }); 
                    }).catch(err => {
                        console.error('Failed to call trigger-4-update-status-all-parties', err)
                        reject(err);
                    });
                }).catch(err => {
                    console.error('Failed to call sign in Promise.all ', err)
                    reject(err);
                });
            }
            else{
                return resolve({ result: "Fail Response In Call Golive On All Parties"});
            }
        }).catch(err => {
            console.error('Failed to call goLive in Promise.all ', err)
            reject(err);
        }); 
    }).catch(err => {
        console.error('Fail to return Promise', err)
        return { error: err };
    });
}