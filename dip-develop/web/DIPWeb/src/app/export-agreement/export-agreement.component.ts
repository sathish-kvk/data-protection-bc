import { Component, OnInit, AfterContentChecked } from '@angular/core';
import {Http, Headers, RequestOptions, Response, RequestMethod} from "@angular/http";
import { AgreementService } from 'app/agreement.service'

@Component({
  selector: 'app-export-agreement',
  templateUrl: './export-agreement.component.html',
  providers: [AgreementService],
  styleUrls: ['./export-agreement.component.css']
})
export class ExportAgreementComponent implements OnInit {

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
  elementsInContract;
  documentsInContract=[];
  agreementName='';
  loginParty=sessionStorage.getItem("session_party_name");

  constructor(private http: Http, private agreementservice: AgreementService) { }

  ngOnInit() {

  }

  exportAgreement(apiKey?){

    this.exportJson = "loading...";
    this.documentsInContract=[];
    
    this.agreementservice.getDocumentsInAgreement(this.agreementId)
      .toPromise()
      .then(res => res.json())
      .then(result => {
        if(result.documents){
          this.documentsInContract = result.documents;
          console.log(this.documentsInContract);
        }
        this.agreementservice.exportAgreement(this.agreementId)
      .toPromise()
      .then(res => res.json())
      .then(result => {
        if(result.agreement && result.agreement.elements){
          this.elementsInContract = result.agreement.elements;
          this.elementsInContract = this.elementsInContract.filter((element) => {
            if(element.elementType == "documentHash"){
              return element
            }
          })
        }
        this.exportJson = JSON.stringify(result, null, "    ");
        this.agreementName = result.agreement.agreementName;
        console.log(result);
      })
      .catch(error => {
        console.log(error._body);
        if(error._body){
          if(JSON.parse(error._body).body){
            this.exportJson = JSON.parse(error._body).body.error;
          }
        }
        else{
          this.exportJson = error;
        }
      })
      })
  }

  getDocumentName(eleID){
    let found = "";
    for(let i =0; i<this.documentsInContract.length; i++){
      if(this.documentsInContract[i].elementID === eleID){
        found = this.documentsInContract[i].documentName;
        break
      }
    }
    return found;
  }

  downLoadDoc(eleID){
    this.agreementservice.downloadDoc(eleID, this.agreementId);
  }

  downloadAgreement(agreementName){
    let txtOutputJson = document.getElementById("outputJson") as HTMLInputElement;
    let text = txtOutputJson.value;
    text = text.replace(/\n/g, "\r\n");
    let blob = new Blob([text], { type: "text/plain"});
    let anchor = document.createElement("a");
    anchor.download = agreementName + ".json";
    anchor.href = window.URL.createObjectURL(blob);
    anchor.target ="_blank";
    anchor.style.display = "none"; // just to be safe!
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }
}
