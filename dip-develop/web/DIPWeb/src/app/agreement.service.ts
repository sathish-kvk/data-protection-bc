import { Injectable } from '@angular/core';
import { Component, OnInit, AfterContentChecked } from '@angular/core';
import {Http, Headers, RequestOptions, Response, RequestMethod} from "@angular/http";
import { Observable } from 'rxjs/Observable';
import { error } from 'selenium-webdriver';
import { first } from 'rxjs/operator/first';
import {Router} from '@angular/router';
import {Document} from './document';

@Injectable()
export class AgreementService {
  header: Headers = new Headers({
    "accept": "application/json",
    "x-ibm-client-id": sessionStorage.getItem("session_client_id"),
    "x-ibm-client-secret": sessionStorage.getItem("session_client_secret")
  });
  option: RequestOptions = new RequestOptions({method: RequestMethod.Post});
  reqMethod: RequestMethod;
  
  downloading = false;
 

  constructor(private http:Http, private router: Router) { 
    this.option.method = RequestMethod.Post;
    this.option.headers = this.header;
    this.option.headers.set("Content-Type", "application/json");
    this.option.headers.set("x-ibm-client-id", sessionStorage.getItem("session_client_id"));
    this.option.headers.set("x-ibm-client-secret", sessionStorage.getItem("session_client_secret"));
  }

  getListOfParties(): any {
    return this.http.post(`${sessionStorage.getItem("session_api_endpoint")}/getPartyList`, null, this.option)  
  }

  exportAgreement(agreementID){
    let jsonBody = {
      agreementID: agreementID
    };
    return this.http.post(`${sessionStorage.getItem("session_api_endpoint")}/export`, JSON.stringify(jsonBody), this.option)
  }

  checkSessionEnd() {
    if(!sessionStorage.getItem("session_client_id")){
      this.router.navigate(['/login']); 
    }
  }

  checkElementExists(element: string, elementArr: any[]):boolean{
    let tmpExist = false;
    if(element && elementArr.length > 0){
      elementArr.filter((str, index, arr) => {
        if(str.elementName.toLowerCase() === element.toLowerCase()){
          tmpExist = true;
        }
      })
    }
    return tmpExist;
  }

  downloadDoc(elementID, agreementID){
    this.downloading = true;
    let jsonBody = {
      elementID: elementID,
      agreementID: agreementID
    };
    this.http.post(`${sessionStorage.getItem("session_api_endpoint")}/downloadDocument`, JSON.stringify(jsonBody), this.option)
      .toPromise()
      .then(res => res.json())
      .then(result => {
        this.saveFile(result.documents[0]);
        this.downloading = false;
      })
      .catch(error => {
        this.downloading = false;
      })
  }

  getDocumentContent(docHash){
    this.downloading = true;
    let jsonBody = {
      documentHash: docHash
    };
    return this.http.post(`${sessionStorage.getItem("session_api_endpoint")}/downloadDocument`, JSON.stringify(jsonBody), this.option)
  }

  saveFile(fileObj:any){
    let text = fileObj['documentHash']['documentContent'];
    let bstr = atob(text), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    let dataType = fileObj['documentType'];
    var blob = new Blob([u8arr], { type: dataType});
    var anchor = document.createElement("a");
    anchor.download = fileObj['documentName'];
    anchor.href = window.URL.createObjectURL(blob);
    anchor.target ="_blank";
    anchor.style.display = "none"; // just to be safe!
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }

  uploadDocument(doc:Document){
    let jsonBody = {
      agreementID: doc.agreementID,
      elementID: doc.elementID,
      documentName: doc.documentName,
      documentContent: doc.documentContent,
      documentType: doc.documentType
    };
    return this.http.post(`${sessionStorage.getItem("session_api_endpoint")}/uploadDocument`, JSON.stringify(jsonBody), this.option)
  }

  getDocumentsInAgreement(ID){
    let jsonBody = {
      agreementID: ID
    };
    return this.http.post(`${sessionStorage.getItem("session_api_endpoint")}/getDocumentsInAgreement`, JSON.stringify(jsonBody), this.option)
  }

  getTableHashes(){
    return this.http.post(`${sessionStorage.getItem("session_api_endpoint")}/getTableHashes`, null, this.option)
  }

  addTableHash(jsonBody: Object){
    return this.http.post(`${sessionStorage.getItem("session_api_endpoint")}/addTableHash`, JSON.stringify(jsonBody), this.option)   
  }

  deleteTableHash(tableHashName: Object){
    return this.http.post(`${sessionStorage.getItem("session_api_endpoint")}/deleteTableHash`, JSON.stringify(tableHashName), this.option)   
  }

  // agreement status of all parties in the Agreement.
  getAgreementStatus(agreementID: string): any {
    let jsonBody = {
      agreementID: agreementID
    }
    return this.http.post(`${sessionStorage.getItem("session_api_endpoint")}/getAgreementStatus4Parties`, JSON.stringify(jsonBody), this.option)
  }

}
