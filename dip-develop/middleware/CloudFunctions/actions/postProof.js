/**
  *
  * main() will be invoked when you Run This Action
  *
  * @param OpenWhisk actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
function main(params_in_postProof) {
   	var request = require("request");
   
    //For Hyperledger 1.0 we have exposed REST APIs using Compose-rest-server. 
    //Which is running in http://bc-hl.southeastasia.cloudapp.azure.com:3000/explorer
    var url = "http://bc-hl.southeastasia.cloudapp.azure.com:3000/api/PublishProof"

    var options = {
        method: 'POST',
        url: url,
        headers:
        {
            'cache-control': 'no-cache',
            'content-type': 'application/json',
            'accept': 'application/json'
        },
        body:
        {
            proofID: params_in_postProof.proofID,
            authority: params_in_postProof.DIPAuthorityID,
        	proof : params_in_postProof.proof
        },
        json: true
    };
    
    return new Promise(function(resolve, reject){
          console.log("Options>>>>>  " + JSON.stringify(options));
          request(options, function(error, response, body) {
              if(error) {
                  reject(error);
              }
              else{
                  console.log(JSON.stringify(body));
                  resolve(body);
              }
          })
    })
}

