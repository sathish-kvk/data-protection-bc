import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import { Http, Headers, RequestOptions, Response, RequestMethod } from "@angular/http";
import { RouterModule,Router} from '@angular/router';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
  
})
export class LoginComponent {

  client_id:string;
  client_idAlert:string;
  client_idAlert_success:string;
 
  option: RequestOptions = new RequestOptions({method: RequestMethod.Post});
  jsonAuthorization;
  loading=false;
  

  header: Headers = new Headers({
    "accept": "application/json"
  });
 
   constructor(private http: Http,private router:Router) {
    console.log('constructor ran...');  
    }
   
  ngOnInit() {
    if(sessionStorage.getItem('session_client_id')!=null){
      this.router.navigate(['/']);  
    }
    this.client_idAlert="";
    this.client_idAlert_success=""; 
 
  }
  
  
  getAuthorization() {   
    this.option.method = RequestMethod.Post;
    this.option.headers = new Headers();
    this.option.headers.set("Content-Type", "application/json");
    this.option.headers.set("Authorization", "Basic OTg0MGE5YzYtM2EwNS00NTFkLTg5MWItMjdkZGFiZDMzNmViOlNmUENZM0Q2SFdjVFMzRGxRT2xJMzh2Nm1tU2tUMzMzeXoybUVFd1p5RFU2VUFQYmNqS2x1OWw5YVRidzFCNlU="); 
    this.option.body={
      "clientId" : this.client_id
  };
    this.loading=true;
    this.http.post("https://openwhisk.eu-gb.bluemix.net/api/v1/namespaces/DXC-Digital-Innovation-Platform_DIP-Service-Catalogue/actions/digital-locker?blocking=true&result=true", null, this.option)
      .toPromise()
      .then(res => res.json())
      .then(result => {
        this.jsonAuthorization = result;
        console.log(this.jsonAuthorization);
        console.log(this.client_id);
      
        if(!result.sysDetails&&this.client_id!=null)
        {   
          this.client_idAlert="The key is not correct, please use another one.";
          console.log(this.client_idAlert);
          this.client_id = "";
          this.loading=false;       
        }
        else if(result.sysDetails&&this.client_id!=null){
          this.client_idAlert="";
          this.client_idAlert_success="Login success!";
          console.log(this.client_idAlert_success);
          if ( typeof(Storage) !== "undefined") {
            sessionStorage.setItem('session_client_id',this.client_id);          
            sessionStorage.setItem('session_client_secret',result.sysDetails.client_secret);          
            sessionStorage.setItem('session_api_endpoint',result.sysDetails.api_endpoint);
            sessionStorage.setItem('session_party_name', result.sysDetails.party_name);
            //console.log(sessionStorage.getItem("session_api_endpoint"));   
          } else {
            alert('Your browser is too old. Please upgrade your browser now!');
        } 
        this.loading = false;
        this.router.navigate(['/']); 
        }
        
      })
      .catch(error => {
        console.log(error);
        this.loading=false;
      })
  }

  checkEnterKey(e){
    if(e.keyCode == 13 || e.keyCode == 10){
      this.getAuthorization();
    }
  }
}