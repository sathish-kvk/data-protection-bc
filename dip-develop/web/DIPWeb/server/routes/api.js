const express = require('express');
const router = express.Router();

// declare axios for making http requests
const axios = require('axios');
const API = 'https://jsonplaceholder.typicode.com';

var http = require('https');
var options = {
  "method": "",
  "hostname": "api.eu-gb.bluemix.net",
  "port": null,
  "path": "",
  "headers": {
    "Authorization":"bearer eyJhbGciOiJIUzI1NiIsImtpZCI6ImtleS0xIiwidHlwIjoiSldUIn0.eyJqdGkiOiI0ZTJjMWZlZDg3ODY0NDE0OWNjZWU1ZjJhODNhZDUwYyIsInN1YiI6IjEyY2FiMzJlLWY1ZWMtNDJlZS05M2Q3LWIxODliNDViYjI3OCIsInNjb3BlIjpbImNsb3VkX2NvbnRyb2xsZXIucmVhZCIsInBhc3N3b3JkLndyaXRlIiwiY2xvdWRfY29udHJvbGxlci53cml0ZSIsIm9wZW5pZCIsInVhYS51c2VyIl0sImNsaWVudF9pZCI6ImNmIiwiY2lkIjoiY2YiLCJhenAiOiJjZiIsImdyYW50X3R5cGUiOiJwYXNzd29yZCIsInVzZXJfaWQiOiIxMmNhYjMyZS1mNWVjLTQyZWUtOTNkNy1iMTg5YjQ1YmIyNzgiLCJvcmlnaW4iOiJ1YWEiLCJ1c2VyX25hbWUiOiJkdnUyN0Bjc2MuY29tIiwiZW1haWwiOiJkdnUyN0Bjc2MuY29tIiwiaWF0IjoxNTI0NDUyOTA0LCJleHAiOjE1MjU2NjI1MDQsImlzcyI6Imh0dHBzOi8vdWFhLm5nLmJsdWVtaXgubmV0L29hdXRoL3Rva2VuIiwiemlkIjoidWFhIiwiYXVkIjpbImNsb3VkX2NvbnRyb2xsZXIiLCJwYXNzd29yZCIsImNmIiwidWFhIiwib3BlbmlkIl19.-iiBP_HDGqSNBGmKb0GgfA4ITCExTT8r3OrYdUCG4rQ",
    "accept": "application/json",
    "content-type": "application/json"
  }
};

/* GET api listing. */
router.get('/', (req, res) => {
  res.send('api works');
});

// Get all posts
router.get('/posts', (req, res) => {
  // Get posts from the mock api
  // This should ideally be replaced with a service that connects to MongoDB
  axios.get(`${API}/posts`)
    .then(posts => {
      res.status(200).json(posts.data);
    })
    .catch(error => {
      res.status(500).send(error)
    });
});

router.get('/spaces', (request, response) => {
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

module.exports = router;