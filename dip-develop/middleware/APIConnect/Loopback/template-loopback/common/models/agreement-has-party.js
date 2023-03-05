'use strict';

module.exports = function (Agreementhasparty) {
 Agreementhasparty.remoteMethod('deleteAgreementParties', {
        description: 'Delete all matching records.',
        accepts: [
            { arg: 'condition', type: 'Agreementhasparty',http: {source:'body'} }
        ],
        http: { path: '/delete', verb: 'post' },
        returns: {
            arg: 'count',
            type: 'object',
            description: 'The number of instances deleted',
            root: true
        }

    });

    Agreementhasparty.deleteAgreementParties = function (condition, callback) {
        console.log("Get condition on Deleting agreement_has_parties >>>", condition);
        if (condition == null) {
            let err = new Error('Cannot found conditions');
            console.error('Delete agreement_has_parties into SQL with error >>>> ', err);
            callback(err, null)
            return;
        }
        var params = {
                    where: {
                        party_partyID:condition.party_partyID,
                        agreement_agreementID:condition.agreement_agreementID
                    }    
            }
            
        console.log("Finding deleted agreement-has-party params >>>", params);
        Agreementhasparty.findOne(params, function (err, instance) {
            if (err) {
                console.error('Find agreement_has_parties into SQL with error >>>> ', err);
                callback(err, null);
                return;
            }

            if (!instance) {
                let _error = new Error("Cannot find any instance to delete");
                console.error('Cannot find any instance to delete>>>',JSON.stringify(condition));
                callback(_error, null);
                return;
            }
            var params = {
                    party_partyID:condition.party_partyID,
                    agreement_agreementID:condition.agreement_agreementID
                 
                }
            console.info("Delete agreement_has_parties condition" + JSON.stringify(params));
            Agreementhasparty.destroyAll(params, function (error, info) {
                if (error) {
                    console.error('Delete agreement_has_parties into SQL with error >>>> ', error);
                    callback(error, null);
                }

                let response = { message: "The number of instance deleted", count: info.count };
                console.info("Delete agreement_has_parties successful>>>", JSON.stringify(instance));
                return callback(null, response);
            });
        });
    }
};
