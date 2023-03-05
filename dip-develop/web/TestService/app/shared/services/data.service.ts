import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, RequestMethod, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { DataStruct } from '../shared';




declare var $:any;


@Injectable()
export default class DataService {
  dataStore: DataStruct[] = [];
  dataFeed: Observable<DataStruct>;
  spacesFeed: Observable<any>;
  configJson: any ='';
  actionJs: any = '';
  publishTo: string ='';
  //private http: Http;
  private dataObserver: any;
  spacesObserver: any;
  actionResponse: string = "";
  spacesStore: any[] = [];
  resCreateAct: string[] = [];
  partyApiKey: string;

  header: Headers = new Headers({
    "accept": "application/json"
  });
  
  option: RequestOptions = new RequestOptions({method: RequestMethod.Post});
  reqMethod: RequestMethod;
  jsonAuthorization;
  currentSpace;
  listOfParty: any[] =[];
  //private dataUrl;
  //private dataUrl = 'https://jsonplaceholder.typicode.com/posts';

  //======= pre-define api-key for each space ==========
  spaceApiKey: string = `
  {
    "DXCV": "Basic Y2Y5OGZiZGMtNzQ3Ny00NTI3LWE4MmUtMWI0ZGYwZTI3NjhiOmRkMDA0T1JhMVRBQ2xSRXEwQm9JSlowSU1leFQ3U0tKSmw2N1hRbzZGRlVyc2VNbmFsNTVVdVZaRTdzeFljSkE=",
    "TestLandlord": "Basic ZDEwYzY4NTgtY2RjYi00OGE1LWE0YTUtOGZhZjY1NmFjMmU1OkVqNGo0ZXp0QmJUS3J0akluOW5BalE3WExzT3ZjV1pvblJFa0lNMzZ2b3A4YnBlS3dhYVA1dFZiSGl4SG1lVGY=",
    "TestTenant": "Basic YzE1OTAwODAtZjc0ZS00MmIwLWE5NDYtNzk4NzJmYjZmMzgxOmkyQVR4WWhJdXRGcHlFUXlsT0FVZEdJamVHZGx6U2RRRUZTYmZuVVVHdzBrY0sxcU9LeFY3ZWFLYWZ4cXJVcGY=",
    "TestLandlordAgent": "Basic ZGJkNmNmODItOGRiYS00Nzk1LThlMzQtOGVhZWNhZWQ0OTBhOlZ6YXNTWGZOaHRYOWU1aDh1MjdubzY5SWNldENKZHk4cXlEbVVnbXdwWGdMMFR2bHVSWG8zbTMxNU5nMVk3Zno=",
    "TestPropertyManager": "Basic ZjQ5MDgzOTUtNjk4Ni00MTViLTlhODctNTAyMmNmMDZkYjdmOnFxaWRsckY1RklpTTZJNlVxcnl6ZTI5UDh1VWdmZmd4dmZpNDVBQ1pieEFha3QzUElmOTk4U1ZENzk5N1pnSGU="
  }
  `;

  jsonApiKey: any;
  
  
  
  //================end of pre-definied=================

  //================= get authorization ================
  getAuthorization(){
    this.option.method = RequestMethod.Post;
    //this.option.headers = this.header;
    //this.option.headers.delete("*");
    this.option.headers = new Headers();
    this.option.headers.set("Content-Type", "application/json");
    this.option.headers.set("Authorization", "Basic N2IxMjY4MjMtZmRkMC00NWVjLWIzNzItN2YzOTU4ZDNjMmRkOk5GMm1SQndCOVhLMG1zcWROZ0lFajJFMFVGMmpNeW04V2s4VkU4SnlrS244eVhYd1ZYVjFTMGlMSGNrN2M1MDk="); //ACME Ltd.
    this.http.post("https://openwhisk.eu-gb.bluemix.net/api/v1/namespaces/_/actions/common-ow/digital-locker?blocking=true&result=true", null, this.option)
      .toPromise()
      .then(res => res.json())
      .then(result => {
        this.jsonAuthorization=result;
        this.currentSpace = result.cloudFunctions.cf_path.split("_", 2)[1];
        this.getListOfParties();
      })
      .catch(error => console.log(error));
  };
  
  getListOfParties() {
    this.option.method = RequestMethod.Get;
    this.option.headers = this.header;
    this.option.headers.set("Content-Type", "application/json");
    this.option.headers.set("x-ibm-client-id", this.jsonAuthorization.sysDetails4Sql.client_id);
    this.option.headers.set("x-ibm-client-secret", this.jsonAuthorization.sysDetails4Sql.client_secret);
    this.http.get(`https://api.eu.apiconnect.ibmcloud.com/${this.jsonAuthorization.sysDetails4Sql.api_path}/parties?filter[order]=partyName`, this.option)
      .toPromise()
      .then(res => res.json())
      .then(result => {
        result.forEach(element => {
          this.spacesStore.push(element);
        });
        console.log(this.spacesStore);
      })
      .catch(error => console.log(error)) 
  }

  getPartyApiKey(partyname: string){
    this.option.method = RequestMethod.Post;
    //this.option.headers = this.header;
    //this.option.headers.delete("*");
    this.option.headers = new Headers();
    this.option.headers.set("Content-Type", "application/json");
    this.option.headers.set("Authorization", "Basic N2IxMjY4MjMtZmRkMC00NWVjLWIzNzItN2YzOTU4ZDNjMmRkOk5GMm1SQndCOVhLMG1zcWROZ0lFajJFMFVGMmpNeW04V2s4VkU4SnlrS244eVhYd1ZYVjFTMGlMSGNrN2M1MDk="); //ACME Ltd.
    return this.http.post("https://openwhisk.eu-gb.bluemix.net/api/v1/namespaces/_/actions/common-ow/get-targetsystem-details?blocking=true&result=true", `{"partyname":"${partyname}"}`, this.option)
      .toPromise()
      .then(res => res.json())
      .then(result => {
        console.log(result);
        this.partyApiKey = result.cloudFunctions.options.api_key;
        return result;
        //this.currentSpace = result.cloudFunctions.cf_path.split("_", 2)[1];
        //this.publishAction();
      })
      .catch(error => console.log(error));
  }

  constructor(private dataUrl: string, private http: Http) {

    this.dataFeed = new Observable(observer => {
      this.dataObserver = observer;
    });
    this.spacesFeed =new Observable(observer => {
      this.spacesObserver = observer;
    });
    this.option.headers = this.header;
    //this.option.headers.set("host", "openwhisk.eu-gb.bluemix.net");
    this.option.headers.set("accept", "application/json");
    this.option.headers.set("Content-Type", "application/json");
    //this.option.headers.set("Access-Control-Allow-Methods", "PUT, GET, POST");
    this.option.headers.set("Authorization", "Basic Y2Y5OGZiZGMtNzQ3Ny00NTI3LWE4MmUtMWI0ZGYwZTI3NjhiOmRkMDA0T1JhMVRBQ2xSRXEwQm9JSlowSU1leFQ3U0tKSmw2N1hRbzZGRlVyc2VNbmFsNTVVdVZaRTdzeFljSkE=");
    this.jsonApiKey = JSON.parse(this.spaceApiKey);
  }

  testActionInParty(strPartyName: string, strBody: string, serviceUrl: string){
    //console.log(this.selectedParty);
    let jsonBody = {
      partyname: strPartyName
    };
    this.option.method = RequestMethod.Post;
    this.option.headers = new Headers();
    this.option.headers.set("Content-Type", "application/json");
    this.option.headers.set("Authorization", "Basic N2IxMjY4MjMtZmRkMC00NWVjLWIzNzItN2YzOTU4ZDNjMmRkOk5GMm1SQndCOVhLMG1zcWROZ0lFajJFMFVGMmpNeW04V2s4VkU4SnlrS244eVhYd1ZYVjFTMGlMSGNrN2M1MDk="); //ACME Ltd.
    this.http.post(`https://openwhisk.eu-gb.bluemix.net/api/v1/namespaces/_/actions/common-ow/get-targetsystem-details?blocking=true&result=true`, JSON.stringify(jsonBody), this.option)
      .toPromise()
      .then(res => res.json())
      .then(result => {
        console.log(result.cloudFunctions.options.api_key);
        //this.exportAgreement(result.cloudFunctions.options.api_key);
        this.testAction(strBody, serviceUrl, result.cloudFunctions.options.api_key);
      })
      .catch(error => {
        console.log(error)
        //if(error.Type)
        this.actionResponse = "there is no ApiKey returned for the selected Party";
      }) 
  }


  private testAction(strBody: string, serviceUrl:string, strApiKey): void{
    console.log(btoa(strApiKey));
    this.option.method = "post";
    this.option.headers.set("accept", "application/json");
    this.option.headers.set("Content-Type", "application/json");
    this.option.headers.set("Authorization", `Basic ${btoa(strApiKey)}`);
    this.http.post(`https://openwhisk.eu-gb.bluemix.net/api/v1/namespaces/_/actions/common-ow/${serviceUrl}?blocking=true&result=true`, strBody, this.option)
      .map(response => response.json())
      .subscribe(
        tasks => {
          this.dataStore = tasks;
          //tasks.forEach(task => this.dataObserver.next(task));
          this.actionResponse = JSON.stringify(tasks, null, " ");
        },
        error => {console.log(error);
          if(error._body.indexOf("The requested resource does not exist") !== -1){
            this.actionResponse = `Function ${serviceUrl} does not exist in selected party!!!`;
          }
          else{
        this.actionResponse = JSON.stringify(error, null, " ");
          }
        }
      );

  }

  private fetchTasks(): void {
    
    this.http.get(this.dataUrl)
      .map(response => response.json())
      .map(stream => stream.map(res => {
        return {
          id: res.id,
          name: res.title
        }
      }))
      .subscribe(
        tasks => {
          this.dataStore = tasks;
          tasks.forEach(task => this.dataObserver.next(task))
        },
        error => console.log(error)
      );
  }

  getListSpace(url:string): void {
    this.http.get(url)
      .map(response => response.json())
      .map(val => val.map(res => {
          return {
            guid: res.guid,
            name: res.name
          }
      }))
      .subscribe(data => {
        data.forEach(space => this.spacesStore.push(space));
        //console.log(data);
      },
      error => console.log(error)
      ); 
  }

  addUser(task: DataStruct): void {
    this.dataObserver.next(task);
  }
  
  getServiceRespond(url:string): void{
    this.http.get(url)
      .toPromise()
      .then(res => res.json())
      .then(data => {
        this.configJson = data;
        //this.publishTo = data.publishTo[0].toLowerCase();
        //console.log(data.publishTo.indexOf('parties')<0);
        if(data.publishTo.indexOf('parties')<0){
          //$('#role-selector').multiselect('select', data.publishTo);
          //$('#party-selector').multiselect('select', data.publishTo);
        }
        else{
          this.publishTo = 'parties';
        }
      }); 
  }

  /*
  getServiceRespond(url:string): void{
    jsonFile(url).then(res => {
      console.log(res);
    });
  }
  */
  getJsRespond(url:string): void{
    this.http.get(url)
      .toPromise()
      .then(res => res.text())
      .then(data => this.actionJs = data); 
  }

  publishAction(spaces: string[], actionName:string): any {
    let jsonBody : any = "";
    let action: string = this.actionJs.replace(/\n/g, " ");
    //let action: string = this.actionJs;
    console.log(this.actionJs.replace(/\n/g, " "));
    for(let i=0; i < spaces.length; i++){
      //console.log('{"actionname": "' + actionName + '","actioncode":\`' + `${action}` + '\`,"authorization": "' + this.jsonApiKey[spaces[i]] + '"}');
      this.getPartyApiKey(spaces[i]).then(res => {
        //console.log("apiKey: " + this.partyApiKey);
        //console.log(res);

        jsonBody = `{
          "actionname": "${actionName}",
          "actioncode":"${action}",
          "authorization": "Basic ${btoa(res.cloudFunctions.options.api_key)}"
        }`;
        console.log(jsonBody);
        this.http.post(`/createaction`, jsonBody, this.option)
          .map(res => res.json())
          .subscribe(result => {
            console.log(JSON.stringify(result));
            if(result.name){
              this.resCreateAct.push(`"${result.name}" has been created in namespace "${result.namespace}"\n`);
            }
            else{
              this.resCreateAct.push(`${JSON.stringify(result)}\n`);
            }
            //alert(this.resCreateAct);
            return JSON.stringify(result);
            //window.alert(`Action "${result.name}" has been created in namespace "${result.namespace}"`);
          },
          error => {
            console.log(error);
            return error.message;
          }
        );
      });
      /*
      jsonBody = `{
        "actionname": "${actionName}",
        "actioncode":"${action}",
        "authorization": "${this.jsonApiKey[spaces[i]]}"
      }`;
      console.log(jsonBody);
      this.http.post(`/createaction`, jsonBody, this.option)
        .map(res => res.json())
        .subscribe(result => {
          console.log(JSON.stringify(result));
          if(result.name){
            this.resCreateAct.push(`"${result.name}" has been created in namespace "${result.namespace}"\n`);
          }
          else{
            this.resCreateAct.push(`${JSON.stringify(result)}\n`);
          }
          //alert(this.resCreateAct);
          return JSON.stringify(result);
          //window.alert(`Action "${result.name}" has been created in namespace "${result.namespace}"`);
        },
        error => {
          console.log(error);
          return error.message;
        }
      );
      */
    }

  }

  testPubllish(){

  }
  
}
