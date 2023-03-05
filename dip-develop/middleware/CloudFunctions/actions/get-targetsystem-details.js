/**
  *
  * main() will be invoked when you Run This Action
  *
  * @param OpenWhisk actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
  function main(inp_params_4_targetsysdetails) {
    
    console.log("Input params>>>" + JSON.stringify(inp_params_4_targetsysdetails));
     var partyname=inp_params_4_targetsysdetails.partyname;
     //var JSON_4_AllSystems=inp_params_4_targetsysdetails.json_4_all_system;
     partyname=partyname.toLowerCase();
     // The input may come in upper case or lower case. Let us convert the input in to lower case.
     console.log("partyname>>>>" + partyname);
    
      switch(partyname){
         case 'tinh-party-a':
                    return {
         			            "sysDetails": {
         			                "partyname":"tinh-party-A",
         			                "partyid":"",
                                    "api_protocol": "https",
                                    "api_hostname": "api.eu.apiconnect.ibmcloud.com/",
                                    "api_path": "dxc-digital-innovation-platform-tinh-party-a/tinh-party-a-lb-prod/api",
                                    "client_id": "41ef3abc-0635-4974-a980-36fa52d95b9c",
                                    "client_secret":"H1uW8hJ3jV4oC4eR4tQ5kG2iJ0yJ2hO7bY7vO0yB8fN2nS7jU3"
                                },
         			            "options" :{ 
                                    "apihost": "openwhisk.eu-gb.bluemix.net",
                                    "api_key": "12dc3bda-3e27-4a57-b569-58dc88c218cc:vFQeLq4zPIR5dILnGDeEOC6qoCeIKAq8PCjDahmsQ8UGoDftRVJjdpjkPv896MIA" 
                                }
 			            }
 			            
 			            
             break;
        case 'tinh-party-b':
                    return {
         			            "sysDetails": {
         			                "partyname":"tinh-party-B",
         			                "partyid":"",
                                    "api_protocol": "https",
                                    "api_hostname": "api.eu.apiconnect.ibmcloud.com/",
                                    "api_path": "dxc-digital-innovation-platform-tinh-party-b/tinh-party-b-lb-prod/api",
                                    "client_id": "411ebacb-41ef-4bf3-b9d6-549d9a80b450",
                                    "client_secret":"dR5sT8lF7mX7gJ1pA4rW8fK1gV0sH7jM4nD7rE6jD2dJ3jT3xG"
                                },
         			            "options" :{ 
                                    "apihost": "openwhisk.eu-gb.bluemix.net",
                                    "api_key": "62e5874d-327d-4d9d-a663-aa0b7ce5a45f:ho3fRHpj4XJceCSpdQOzBAc8pqz9kWn82dtYVebBuhaukv1a0MFlJqZ3QAtUvzvy" 
                                }
 			            }
 			            
 			            
             break;
        case 'tinh-party-c':
                    return {
         			            "sysDetails": {
         			                "partyname":"tinh-party-C",
         			                "partyid":"",
                                    "api_protocol": "https",
                                    "api_hostname": "api.eu.apiconnect.ibmcloud.com/",
                                    "api_path": "dxc-digital-innovation-platform-tinh-party-c/tinh-party-c-lb-prod/api",
                                    "client_id": "41ef3abc-0635-4974-a980-36fa52d95b9c",
                                    "client_secret":"H1uW8hJ3jV4oC4eR4tQ5kG2iJ0yJ2hO7bY7vO0yB8fN2nS7jU3"
                                },
         			            "options" :{ 
                                    "apihost": "openwhisk.eu-gb.bluemix.net",
                                    "api_key": "d8e714cb-b7f2-441e-9c57-848bba8df20a:HRFVJAiJGT7bbsExn6cUrhYkErHm3jbVdfRn6Xcu4bpzBpLDR6348QY4R6pkataK" 
                                }
 			            }
 			            
 			            
             break;     
         case 'toyota motor corporation':
                    return {
         			            "sysDetails": {
         			                "partyname":"Toyota Motor Corporation",
         			                "partyid":"",
                                    "api_protocol": "https",
                                    "api_hostname": "api.eu.apiconnect.ibmcloud.com/",
                                    "api_path": "dxc-digital-innovation-platform-dxcv/dxc-dip/api",
                                    "client_id": "444a4a69-3862-4b03-9522-a7851ff5bd48",
                                    "client_secret":"fB2dP4hC5bM0fN3dT7xM8dS8rM8tP2iR5wT7yI4rR6sF7qN8oD"
                                },
         			            "options" :{ 
                                    "apihost": "openwhisk.eu-gb.bluemix.net",
                                    "api_key": "12dc3bda-3e27-4a57-b569-58dc88c218cc:vFQeLq4zPIR5dILnGDeEOC6qoCeIKAq8PCjDahmsQ8UGoDftRVJjdpjkPv896MIA" 
                                }
 			            }
 			      
 			      
             break;
     }
     
	
}
