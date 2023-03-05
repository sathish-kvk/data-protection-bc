/**
  *
  * main() will be run when you invoke this action
  *
  * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
 function main(params_in_createHashFromJson) {
  console.log("Cloud function createHash with input Json >> "+ JSON.stringify(params_in_createHashFromJson));
  var crypto = require('crypto');
  var SHA256 = 'sha256';
  var openwhisk = require('openwhisk');
  const blocking = true, result = true;
  var ow = openwhisk();
  
  var inputString = JSON.stringify(params_in_createHashFromJson);
  console.log("Cloud function createHashFromJson with input String >> "+ JSON.stringify(inputString));
  
  var hash = crypto.createHash(SHA256)
 .update(inputString)
 .digest('hex');
 
console.log("Output Hash >>>>" + hash);
return {result: hash};
}
