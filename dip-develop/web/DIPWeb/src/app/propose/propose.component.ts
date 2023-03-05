import { Component, OnInit, AfterContentChecked, ViewChild, ElementRef } from '@angular/core';
import {Http, Headers, RequestOptions, Response, RequestMethod} from "@angular/http";
import { AgreementService } from '../agreement.service';
import {Document} from '../document';
import { empty } from 'rxjs/Observer';

@Component({
  selector: 'app-propose',
  templateUrl: './propose.component.html',
  providers: [AgreementService],
  styleUrls: ['./propose.component.css']
})
export class ProposeComponent implements OnInit {
  leftRadiusForUpload="0px";
  uploadFileStr="select documents...";
  btnSelectDocWidth= "335px";
  header: Headers = new Headers({
    "accept": "application/json"
  });
  option: RequestOptions = new RequestOptions({method: RequestMethod.Post});
  reqMethod: RequestMethod;
  jsonAuthorization;
  agreementId;
  exportJson;
  listOfParties;
  selectedParty;
  elementsInAgreement;
  currentAgreementID="";
  lastPartyApprove = false;
  selectedPartyApiKey="";
  agreementStatus;
  proposing = {};
  documentType ={};
  documentObj={};
  loading = false;
  proposeResult;
  loginParty = sessionStorage.getItem("session_party_name");
  public theBoundProposeElement: Function;

  @ViewChild('fileJson') fileJson: ElementRef;
  @ViewChild('fileDoc') fileDoc: ElementRef;
  

  constructor(private http: Http, private agreementservice: AgreementService) { }

  ngOnInit() {
    this.theBoundProposeElement = this.proposeElement.bind(this);
    //this.getAuthorization();
  }

  exportAgreement(party?: string){
    this.exportJson = "loading...";
    this.elementsInAgreement=[];
    let strAgreementID;
    if(this.agreementId){
      strAgreementID = this.agreementId;
    }else{
      strAgreementID = '';
    }
    this.agreementservice.exportAgreement(strAgreementID)
      //this.http.post(`${sessionStorage.getItem("session_api_endpoint")}/export`, JSON.stringify(jsonBody), this.option)
        .toPromise()
        .then(res => res.json())
        .then(result => {
          
          this.exportJson = JSON.stringify(result, null, "    ");
          //if(this.currentAgreementID !== this.agreementId){
          //  this.currentAgreementID=this.agreementId;
          this.agreementStatus = result.agreement.agreementStatus;
          this.updateElementsInAgreement(result);
            this.lastPartyApprove = false;
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
        })
    //});
    
  }

  updateElementsInAgreement(result){
    if(result.agreement.parties){
      this.elementsInAgreement = result.agreement.elements.filter(element => {
        if(element.elementType !== 'tableHash'){
          return element;
        }
      });
      //this.elementsInAgreement 
      this.proposing ={};
      this.elementsInAgreement.forEach(ele => {
        this.proposing[`${ele.elementID}`] = false;
        if(ele.elementType == 'documentHash' || ele.elementType == 'tableHash'){
          this.documentType[`${ele.elementID}`] = true;
        }
        else{
          this.documentType[`${ele.elementID}`] = false;
        }
      });
      console.log(this.elementsInAgreement);
    }
    else{
      this.elementsInAgreement=[];
    }
  }

  clearJsonView(){
    this.exportJson="";
    this.elementsInAgreement=[];
    this.proposeResult="";
  }
  proposeElement(elementId, proposedVal?){
    let jsonBody;
    if(proposedVal){
      jsonBody = {
        elementID: elementId,
        proposedValue: proposedVal,
        agreementID: this.agreementId
      };
    }
    else{
      jsonBody = {
        elementID: elementId,
        proposedValue: (document.getElementById(elementId) as HTMLInputElement).value,
        agreementID: this.agreementId
      };
    }
    console.log(jsonBody);
    this.proposeResult="";
    this.option.method = RequestMethod.Post;
    this.option.headers = new Headers();
    //let authorStr = new Buffer(this.selectedPartyApiKey);
    this.option.headers.set("Content-Type", "application/json");
    //this.option.headers.set("Authorization", `Basic ${authorStr.toString("base64")}`); //ACME Ltd.
    this.option.headers.set("X-IBM-Client-id", sessionStorage.getItem("session_client_id"));
    this.option.headers.set("X-IBM-Client-secret", sessionStorage.getItem("session_client_secret"));
    this.proposing[`${elementId}`] = true;
    this.loading = true;
    this.http.post(`${sessionStorage.getItem('session_api_endpoint')}/propose`, JSON.stringify(jsonBody), this.option)
      .toPromise()
      .then(res => res.json())
      .then(result => {
        if(result.Message)
        {          
          this.proposeResult = result.Message;
          this.exportAgreement();
          console.log(result.Message);
        }
        else{
          console.log("testing");
          
          let tmpRes = {
            agreement: result.result
          }
          this.exportJson = JSON.stringify(tmpRes, null, "   ");
          this.updateElementsInAgreement(tmpRes);
          
        }
        //this.exportAgreement();          
        this.proposing[`${elementId}`]=false;
        this.loading = false;
        console.log(result);
        //this.exportAgreement(result.cloudFunctions.options.api_key);       
      })
      .catch(error => {
        this.proposing[`${elementId}`]=false;
        this.loading = false;
        if(JSON.parse(error._body).body.error){
          this.proposeResult = JSON.parse(error._body).body.error;
        }
        else{
          this.proposeResult = JSON.stringify(error);
        }
        console.log(error);
      }) 

  }

  inputOnchange(fileInput:any, id: string) {
    let uploadElement:HTMLInputElement = <HTMLInputElement>document.getElementById(id);
    this.proposeResult="";
    if(uploadElement.value.length>1){
      //let fullpath = this.fileJson.nativeElement.value.split("\\");
      
      let fullpath = uploadElement.value.split('\\');
      let filename = fullpath[fullpath.length -1];
      let base64Content;
      let fileObj;
      if(fileInput.target.files){
        if(fileInput.target.files.length > 1){
          this.proposeResult="only one file can be uploaded at a time!!!";
        }
        else if (fileInput.target.files[0]){
          if(fileInput.target.files[0].size > 5120000){
            this.proposeResult=`${filename} is more than 5M, please choose smaller file!!!`
            uploadElement.value ="";
          }
          else{
            const reader = new FileReader();
            let file = fileInput.target.files[0];
            fileObj = {
              agreementID:this.agreementId,
              elementID:id,
              documentType:'',
              documentName:'',
              documentContent:''
            };
            reader.onloadend = ((e) => {
              base64Content = e.target['result'].split(',');
              fileObj['documentName']=filename;
              fileObj['documentContent']=base64Content[1];
              fileObj['documentType']=base64Content[0]
              //this.change.emit(this.fileObj);
              //console.log(this.fileJson.nativeElement.id);
              this.documentObj[id]=fileObj;
              console.log(this.documentObj);
              
            });
            reader.readAsDataURL(file);
          }
        }
      }
      
      }
  }

  proposeDocument(id: string){
    this.exportJson="file uploading..."
    this.proposing[`${id}`] = true;
    this.agreementservice.uploadDocument(this.documentObj[id])
      .toPromise()
      .then(res => res.json())
      .then(result => {
        this.proposeElement(id, result.documentHash);
        this.proposing[`${id}`] = false;
      })
      .catch(error => {
        this.proposing[`${id}`] = false;
        console.log(error);
        this.proposeResult="Document can not be uploaded!!!"
        this.exportAgreement();
      })
  }


}
