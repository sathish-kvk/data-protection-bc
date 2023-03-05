var express = require("express");
var app = express();
var cfenv = require("cfenv");
var bodyParser = require('body-parser')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

var mydb;
var openwhisk = require("openwhisk");
var http = require("https");

//==========Variants for API-Key============
let listHardCodeApiKey = JSON.parse(`{
  "DXCV": "cf98fbdc-7477-4527-a82e-1b4df0e2768b:dd004ORa1TAClREq0BoIJZ0IMexT7SKJJl67XQo6FFUrseMnal55UuVZE7sxYcJA",
  "TestLandlord": "d10c6858-cdcb-48a5-a4a5-8faf656ac2e5:Ej4j4eztBbTKrtjIn9nAjQ7XLsOvcWZonREkIM36vop8bpeKwaaP5tVbHixHmeTf",
  "TestTenant": "c1590080-f74e-42b0-a946-79872fb6f381:i2ATxYhIutFpyEQylOAUdGIjeGdlzSdQEFSbfnUUGw0kcK1qOKxV7eaKafxqrUpf",
  "TestLandlordAgent": "dbd6cf82-8dba-4795-8e34-8eaecaed490a:VzasSXfNhtX9e5h8u27no69IcetCJdy8qyDmUgmwpXgL0TvluRXo3m315Ng1Y7fz",
  "TestPropertyManager": "f4908395-6986-415b-9a87-5022cf06db7f:qqidlrF5FIiM6I6Uqryze29P8uUgffgxvfi45ACZbxAakt3PIf998SVD7997ZgHe"
}`);

function getApiKey(space) {

    let blocking = true;
    let result = true;
    let name = "common-ow/get-targetsystem-details";
    const params = {partyname:`${space}`};
    var options = {apihost: 'openwhisk.eu-gb.bluemix.net', api_key: currentSpaceApiKey};
    var ow = openwhisk(options);
    //console.log(params);
    return ow.actions.invoke({name, blocking, result, params});
};

let currentSpaceApiKey = process.env.__OW_API_KEY || listHardCodeApiKey["TestTenant"];

app.get("/apikey/:space", (request, response) => {
/*
  var options = {
    "method": "POST",
    "hostname": `openwhisk.eu-gb.bluemix.net`,
    "port": null,
    "path": `/api/v1/namespaces/_/actions/common-ow/get-targetsystem-details?blocking=true&result=true`,
    "headers": {
      "accept": "application/json",
      "content-type": "application/json", 
      "Authorization": `Basic ${new Buffer(currentSpaceApiKey).toString('base64')}`
    }
  };

  let body = "";

  req = http.request(options, function (res) {
    var chunks = [];

    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function () {
      body = Buffer.concat(chunks);
      console.log(body);
      response.json(JSON.parse(body.toString()));
    });
    
  });
  let jsonbody = JSON.parse(`{
    "partyname": "TestLandlord"
  }`);
  req.write(JSON.stringify(jsonbody));
  req.end();
*/
  getApiKey(request.params["space"]).then(res => {
    console.log(res);
    if(res.cloudFunctions){
      response.json(res.cloudFunctions.options.api_key);
    }
    else{
      response.json(JSON.parse("{there is no api-key found}"));
    }
  }).catch(error => response.json(error));
});
/*
app.get("/**", (req, res) => {
  res.redirect("/checkhash")
  //res.
});
*/
app.get("/partyname/:partyID", (request, response) => {
  console.log(appEnv.api_key)
  var options = {
    "method": "GET",
    "hostname": "api.eu.apiconnect.ibmcloud.com",
    "port": null,
    "path": `/dxc-digital-innovation-platform-testtenant/lb-prod/api/parties?filter%5Bwhere%5D%5BpartyID%5D=${request.params["partyID"]}`,
    "headers": {
      "accept": "application/json",
      "content-type": "application/json",
      "x-ibm-client-id": "78a9197c-6fc0-4a5c-a123-b3e43c6b22eb",
      "x-ibm-client-secret": "G6yI2lI1oW1eQ2dS7oH2fT4cR4lH2pF6gC2cS4cN0bN0gN8nQ3"
    }
  };
  
  var req = http.request(options, function (res) {
    var chunks = [];
  
    res.on("data", function (chunk) {
      chunks.push(chunk);
    });
  
    res.on("end", function () {
      var body = Buffer.concat(chunks);
      //console.log(body.toString());
      response.json(JSON.parse(body.toString()));
    });
  });
  req.end();


});

// load local VCAP configuration  and service credentials
var vcapLocal;
try {
  vcapLocal = require('./vcap-local.json');
  console.log("Loaded local VCAP", vcapLocal);
} catch (e) { }

const appEnvOpts = vcapLocal ? { vcap: vcapLocal} : {}

const appEnv = cfenv.getAppEnv(appEnvOpts);

app.use(express.static(__dirname));



var port = process.env.PORT || 3000
app.listen(port, function() {
    console.log("To view your app, open this link in your browser: http://localhost:" + port);
});
