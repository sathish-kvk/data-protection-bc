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
    var openwhisk = require('openwhisk');
    console.log("Input params>>>" + JSON.stringify(inp_params_4_targetsysdetails));
    var partyname=inp_params_4_targetsysdetails.partyname;
     //var JSON_4_AllSystems=inp_params_4_targetsysdetails.json_4_all_system;
    partyname=partyname.toLowerCase();
     // The input may come in upper case or lower case. Let us convert the input in to lower case.
    console.log("partyname>>>>" + partyname);
    
	switch(partyname){
		{{range .PartySysDetails}}
		 case '{{.PartyName}}':
			var options = { 
							"apihost": "openwhisk.eu-gb.bluemix.net",
							"api_key": "{{.ApiKey}}" 
						  };
			var ow=openwhisk(options);
			return ow.actions.invoke({ actionName:  "/"+ "_" +'/common-ow/digital-locker', blocking:true, result:true}).then(result => {
				return result;
			});
			break;
		{{end}}
		
	}
}
exports.main = main;