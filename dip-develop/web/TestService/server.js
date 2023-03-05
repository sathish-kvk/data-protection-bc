var express = require("express");
var app = express();
var cfenv = require("cfenv");
var bodyParser = require('body-parser')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

var mydb;




var http = require('https');
var options = {
  "method": "",
  "hostname": "api.eu-gb.bluemix.net",
  "port": null,
  "path": "",
  "headers": {
    "Authorization":"Bearer eyJhbGciOiJIUzI1NiIsImtpZCI6ImtleS0xIiwidHlwIjoiSldUIn0.eyJqdGkiOiJkOGZjMDdhMTdiNzk0ZWY5YmY3NzA5YWQ0ODI1MDE1NCIsInN1YiI6IjEyY2FiMzJlLWY1ZWMtNDJlZS05M2Q3LWIxODliNDViYjI3OCIsInNjb3BlIjpbImNsb3VkX2NvbnRyb2xsZXIucmVhZCIsInBhc3N3b3JkLndyaXRlIiwiY2xvdWRfY29udHJvbGxlci53cml0ZSIsIm9wZW5pZCIsInVhYS51c2VyIl0sImNsaWVudF9pZCI6ImNmIiwiY2lkIjoiY2YiLCJhenAiOiJjZiIsImdyYW50X3R5cGUiOiJwYXNzd29yZCIsInVzZXJfaWQiOiIxMmNhYjMyZS1mNWVjLTQyZWUtOTNkNy1iMTg5YjQ1YmIyNzgiLCJvcmlnaW4iOiJ1YWEiLCJ1c2VyX25hbWUiOiJkdnUyN0Bjc2MuY29tIiwiZW1haWwiOiJkdnUyN0Bjc2MuY29tIiwiaWF0IjoxNTIyOTIwOTE5LCJleHAiOjE1MjQxMzA1MTksImlzcyI6Imh0dHBzOi8vdWFhLm5nLmJsdWVtaXgubmV0L29hdXRoL3Rva2VuIiwiemlkIjoidWFhIiwiYXVkIjpbImNsb3VkX2NvbnRyb2xsZXIiLCJwYXNzd29yZCIsImNmIiwidWFhIiwib3BlbmlkIl19.e2_vzp7YMi9U3ioZxdRuSgCsb8uIKRZ0PYsokPrGKCw",
    "accept": "application/json",
    "content-type": "application/json"
  }
};

var optionAction = {
  "method": "",
  "hostname": "openwhisk.eu-gb.bluemix.net",
  "port": null,
  "path": "",
  "headers": {
    "Authorization":"Basic YzE1OTAwODAtZjc0ZS00MmIwLWE5NDYtNzk4NzJmYjZmMzgxOmkyQVR4WWhJdXRGcHlFUXlsT0FVZEdJamVHZGx6U2RRRUZTYmZuVVVHdzBrY0sxcU9LeFY3ZWFLYWZ4cXJVcGY=",
    "accept": "application/json",
    "content-type": "application/json"
  }
};


app.post("/:namespace/:package/:action", (req, res) => {
  var actionPackage;
  if (req.params["package"] && req.params["package"]!="none"){
    actionPackage = `/${req.params["package"]}`;
  } else {
    actionPackage ="";
  }
  optionAction.method = "post";
  optionAction.body = req.body;
  optionAction.path = `/api/v1/namespaces/${req.params["namespace"]}/actions${actionPackage}/${req.params["action"]}?blocking=true&result=true`;

  var returnBody;
  var finalResult = [];
  console.log(optionAction.path);
  var request = http.request(optionAction, (response) => {
    var chunks = [];
    var errorStr = "";

    response.on("data", (chunk) => {
      chunks.push(chunk);
    });

    response.on("error", (chunk) => {
      //chunks.push(chunk.message);
    });

    response.on("end",  () => {
      returnBody = Buffer.concat(chunks);
      var result = JSON.parse(returnBody.toString());
      console.log(result);
      res.jsonp(result.result);
    });

  });

  request.end(JSON.stringify(req.body));
});
/*
app.get("/:companyName/:pathName/:actionName", (req, res) => {
  res.redirect(`/?innovator=${req.params["companyName"]}&folder=${req.params["pathName"]}&jsfile=${req.params["actionName"]}`);
});
*/
app.get('/spaces', (request, response) => {
  options.method = "get";
  options.path = "/v2/spaces?order-by=name";
  var body;
  var finalResult = [];
  var req = http.request(options, (res) => {
    var chunks = [];
  
    res.on("data", (chunk) => {
      chunks.push(chunk);
      //console.log(chunk);
    });
    
    res.on("end",  () => {
      body = Buffer.concat(chunks);
      var result = JSON.parse(body.toString());
      result.resources.forEach(element => {
        finalResult.push({
          guid: element.metadata.guid,
          name: element.entity.name
        });
      });
      response.jsonp(finalResult);
    });
    

   
  });
  
  req.end();
});

app.get("/namespace", (req, res) => {
  //var http = require("https");
  var options = {
    "method": "GET",
    "hostname": "openwhisk.eu-gb.bluemix.net",
    "port": null,
    "path": "/api/v1/namespaces/DXC-Digital-Innovation-Platform_DXCV/actions",
    "headers": {
      "accept": "application/json",
      "content-type": "application/json", 
      "Authorization": "Basic Y2Y5OGZiZGMtNzQ3Ny00NTI3LWE4MmUtMWI0ZGYwZTI3NjhiOmRkMDA0T1JhMVRBQ2xSRXEwQm9JSlowSU1leFQ3U0tKSmw2N1hRbzZGRlVyc2VNbmFsNTVVdVZaRTdzeFljSkE="
    }
  };

 
  var req = http.request(options, function (res) {
    var chunks = [];

    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function () {
      var body = Buffer.concat(chunks);
      console.log(body.toString());
    });
});

req.end();
});



app.post("/createaction", (request, response) => {
  var http = require("https");

  var testoptions = {
    "method": "PUT",
    "hostname":"openwhisk.eu-gb.bluemix.net",
    "path": `api/v1/namespaces/_/actions/common-ow/${request.body.actionname}?overwrite=true`,
    "headers": {
      "Content-Type": "application/json",
      "Authorization": `${request.body.authorization}`,
      "Cache-Control": "no-cache"
    }
  };

  let jsonBody =JSON.parse(`{
    "limits" : {
        "timeout": 60000,
        "memory": 256
    },
    "exec":{
        "code": "${request.body.actioncode}",
        "kind": "nodejs:6"
    },
    "publish": true,
    "version":"1.0.0"
    }`
  );
  
  //console.log(testoptions.hostname);
  var req = http.request(testoptions, function (res) {
    var chunks = [];

    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function () {
      var body = Buffer.concat(chunks);
      //console.log(body.toString());
      response.json(JSON.parse(body.toString()));
    });

    res.on("error", (error) => {
      response.json(error);
    });
  });

  req.write(JSON.stringify(jsonBody));
  //console.log(JSON.stringify(jsonBody));
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
/*
if (appEnv.services['cloudantNoSQLDB'] || appEnv.getService(/cloudant/)) {
  // Load the Cloudant library.
  var Cloudant = require('cloudant');

  // Initialize database with credentials
  if (appEnv.services['cloudantNoSQLDB']) {
     // CF service named 'cloudantNoSQLDB'
     var cloudant = Cloudant(appEnv.services['cloudantNoSQLDB'][0].credentials);
  } else {
     // user-provided service with 'cloudant' in its name
     var cloudant = Cloudant(appEnv.getService(/cloudant/).credentials);
  }

  //database name
  var dbName = 'mydb';

  // Create a new "mydb" database.
  cloudant.db.create(dbName, function(err, data) {
    if(!err) //err if database doesn't already exists
      console.log("Created database: " + dbName);
  });

  // Specify the database we are going to use (mydb)...
  mydb = cloudant.db.use(dbName);
}
*/
//serve static file (index.html, images, css)
app.use(express.static(__dirname));



var port = process.env.PORT || 3000
app.listen(port, function() {
    console.log("To view your app, open this link in your browser: http://localhost:" + port);
});
