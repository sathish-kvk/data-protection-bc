/**
  *
  * main() will be run when you invoke this action
  *
  * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
 function main(params_to_sign) {
    var crypto = require('crypto');
    var unsignedHash = params_to_sign.unsignedHash;
    console.log("Hash >>>" + unsignedHash);
    const blocking = true, result = true;
    var openwhisk = require('openwhisk');
    var ow=openwhisk();
    
    return ow.actions.invoke({ actionName: 'common-ow/digital-locker', blocking:true, result:true}).then(result => {
            var privateKey = result.rsaKey.privatekey;
            // sign hash with private key
            var signer = crypto.createSign('sha256');
            signer.update(unsignedHash);
            var signedHash = signer.sign(privateKey,'base64');
            //save to cloudant
            var date = new Date();
            var params = {
                sysDetails : result.sysDetails4Cloudant,
                agreementID : params_to_sign.agreementID,
                unsignedHash : params_to_sign.unsignedHash,
                signedHash : signedHash,
                timestamp : date
            }
            return ow.actions.invoke({actionName: 'common-ow/insertSignature', blocking, result, params}).then(result => {
                console.log("In Write Signature To Cloudant >>> Received the response from insertSignature>>> "+JSON.stringify(result));
                return {"signedHash":signedHash};
            }).catch(err => {
                console.error('Failed to write signature to Cloudant details>>>>', err);
                return { "error": err };
            });
        }).catch(err => {
            console.error('Failed to sign>>>>', err)
            return { "error": err };
        });
}
 