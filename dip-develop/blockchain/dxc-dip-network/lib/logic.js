'use strict';

/**
 * Post proof
 * @param {org.dxc.dip.PublishProof} publishProof
 * @transaction
 */
function PublishProof(publishProof) {
    return getAssetRegistry('org.dxc.dip.ProofAsset')
        .then(function (result) {
            var factory = getFactory();
            var newProofAsset = factory.newResource('org.dxc.dip', 'ProofAsset', publishProof.proofID);
            newProofAsset.authority = publishProof.authority;
            newProofAsset.proof = publishProof.proof;
            return result.add(newProofAsset);
        });
}