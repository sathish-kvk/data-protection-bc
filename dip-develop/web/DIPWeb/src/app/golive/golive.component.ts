import { Component, OnInit, AfterContentChecked } from '@angular/core';
import {Http, Headers, RequestOptions, Response, RequestMethod} from "@angular/http";
import { RouterModule,Router} from '@angular/router';
import { AgreementService } from '../agreement.service';
declare var $: any;
@Component({
  selector: 'app-golive',
  templateUrl: './golive.component.html',
  providers: [AgreementService],
  styleUrls: ['./golive.component.css']
})
export class GoliveComponent implements OnInit, AfterContentChecked {

  header: Headers = new Headers({
    "accept": "application/json"
  });
  option: RequestOptions = new RequestOptions({method: RequestMethod.Post});
  reqMethod: RequestMethod;
  jsonAuthorization;
  agreementId;
  exportJson;
  listOfParties;
  selectedParty=sessionStorage.getItem('session_party_name');
  partiesInAgreement;
  currentAgreementID="";
  lastPartyApprove = false;
  selectedPartyStatus="";
  selectedContract;
  listOfContracts;
  selAgreementID;
  client_id:string=sessionStorage.getItem('session_client_id');
  spaceName=sessionStorage.getItem('session_party_name');
  currentAgreementStatus="";
  isLoading= false;
  partiesStatus=[];
  isLoadingStatus = false;
  //loginParty-sessionStorage.getItem("s");
  constructor(
    private http: Http,
    private router:Router,
    private agreementservice: AgreementService
  ) { }

  ngOnInit() {
    this.getUnapprovedContracts();
  } 

  exportAgreement(party?){
    this.exportJson="loading agreement...";
    this.currentAgreementStatus="";
    this.isLoading = true;
    this.agreementservice.exportAgreement(this.agreementId)
      //this.http.post(`${sessionStorage.getItem("session_api_endpoint")}/export`, JSON.stringify(jsonBody), this.option)
        .toPromise()
        .then(res => res.json())
        .then(result => {
          this.exportJson = JSON.stringify(result, null, "    ");
          this.getAgreementStatus();
          //if(this.currentAgreementID !== this.agreementId){
          //  this.currentAgreementID=this.agreementId;
            if(result.agreement.parties){
              this.partiesInAgreement = result.agreement.parties;
              this.currentAgreementStatus = result.agreement.agreementStatus;
              console.log(this.partiesInAgreement);
            }
            //this.checkAgreementStatus();
            this.lastPartyApprove = false;
            this.isLoading = false;
          //}
          console.log(this.exportJson);
        })
        .catch(error => {
          console.log(error._body);
          if(JSON.parse(error._body).body.error){
            this.exportJson = JSON.parse(error._body).body.error;
          }
          else{
            this.exportJson = JSON.parse(error);
          }
          this.partiesStatus = []; //reset the table Party status in left-hand side.
          this.selectedPartyStatus="";
          this.isLoading=false;
        })
  }

  getUnapprovedContracts(){
    this.option.method = RequestMethod.Post;
    this.option.headers = this.header;
    this.option.headers.set("Content-Type", "application/json");
    this.option.headers.set("X-IBM-Client-id", sessionStorage.getItem("session_client_id"));
    this.option.headers.set("X-IBM-Client-secret", sessionStorage.getItem("session_client_secret"));
    console.log(this.option.headers);
    this.http.post(`${sessionStorage.getItem("session_api_endpoint")}/getUnapprovedContracts`, null, this.option)
      .toPromise()
      .then(res => res.json())
      .then(result => {
        this.listOfContracts=result.result;
        console.log(this.listOfContracts);
      })
      .catch(error => console.log(error)) 
  }

  clearJsonView(){
    this.exportJson="";
    //console.log(this.selAgreementID);
    this.agreementId = this.selAgreementID;
    //this.getCurrentAgreementStatus();
    
    this.exportAgreement();
  }

  onTypeAgreementID(){
    this.selAgreementID = this.agreementId;
  }

  onChangeAgreementID(){
    console.log(document.getElementById("selContracts").innerText);
    
    if($("#selContracts option:selected").text()===""){
      document.getElementById("btnApprove").setAttribute("disabled", "true");
      //console.log("flase");
    }
    else{
      document.getElementById("btnApprove").removeAttribute("disabled");
      //console.log("run");
    }
  }



  approveAgreement(partyStr?){
    this.exportJson="approving...";
    this.currentAgreementStatus="";
    this.isLoading = true;
    let jsonBody = {
      agreementID: this.agreementId
    };
    this.option.method = RequestMethod.Post;
    this.option.headers = new Headers();
    this.option.headers.set("Content-Type", "application/json");
    this.option.headers.set("X-IBM-Client-id", sessionStorage.getItem("session_client_id"));
    this.option.headers.set("X-IBM-Client-secret", sessionStorage.getItem("session_client_secret"));
    this.http.post(`${sessionStorage.getItem("session_api_endpoint")}/golive`, JSON.stringify(jsonBody), this.option)
      .toPromise()
      .then(res => res.json())
      .then(result => {
        this.exportAgreement();
        this.isLoading = false;
      })
      .catch(error => {
        if(JSON.parse(error._body).body.error){
          this.exportJson = JSON.parse(error._body).body.error;
        }
        else{
          this.exportJson = JSON.parse(error);
        }
        console.log(error)
        this.isLoading = false;
      }) 
  }
  /*
  getAgreementStatus(){
    let curParty = $("#partyInAgreement option:selected").text();
    console.log(curParty);
    let curStatus = this.partiesInAgreement.filter((ele, index, array) =>{
      return ele.partyName.indexOf(curParty.trim()) > -1;
    });
    this.selectedPartyStatus = curStatus[0].agreementStatus;

  }
  */

  ngAfterContentChecked(){
    //document.getElementById("btnLogout").style.cursor = "pointer";
    this.agreementservice.checkSessionEnd();
    //console.log(document.getElementById("selContracts").innerText);
    if($("#selContracts option:selected").text()===""){
      document.getElementById("btnApprove").setAttribute("disabled", "true");
      //console.log("flase");
    }
    else{
      document.getElementById("btnApprove").removeAttribute("disabled");
      //console.log("run");
    }
  }

  getCurrentAgreementStatus(){
    console.log(this.listOfContracts.filter((ele, index, array) => {
      return ele.agreementID.indexOf(this.agreementId) > -1;
    }));
  }

  getAgreementStatus(){
    this.isLoadingStatus = true;
    this.partiesStatus=[];
    this.agreementservice.getAgreementStatus(this.agreementId)
      .toPromise()
      .then(result => result.json())
      .then(res => {
        console.log(res)
        this.partiesStatus = res.result;
        if(this.partiesStatus.length>0){
          this.partiesStatus.sort((a,b) => {return (a.partyName.toLowerCase() > b.partyName.toLowerCase()) ? 1 : ((b.partyName.toLowerCase() > a.partyName.toLowerCase()) ? -1 : 0);} );
        }
        this.isLoadingStatus = false
      })
      .catch(error => {
        this.isLoadingStatus = false
        
        console.log(error)
      })
  }
}
