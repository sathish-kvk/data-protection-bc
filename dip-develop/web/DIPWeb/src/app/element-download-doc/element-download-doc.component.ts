import { Component, OnInit, Input } from '@angular/core';
import { AgreementService } from '../agreement.service';
import {Http, Headers, RequestOptions, Response, RequestMethod} from "@angular/http";

@Component({
  selector: 'app-element-download-doc',
  templateUrl: './element-download-doc.component.html',
  styleUrls: ['./element-download-doc.component.css']
})
export class ElementDownloadDocComponent implements OnInit {
  @Input() elementName: string;
  @Input() elementValue: string;
  @Input() docName: string;
  @Input() elementID: string;
  @Input() agreementID: string;
  downloading = false;
  header: Headers = new Headers({
    "accept": "application/json"
  });
  option: RequestOptions = new RequestOptions({method: RequestMethod.Post});
  reqMethod: RequestMethod;

  constructor(private agreementservice: AgreementService, private http: Http) { }

  ngOnInit() {
  }

  

  downLoadDoc(elementID, agreementID){
    this.downloading = true;
    let jsonBody = {
      elementID: elementID,
      agreementID: agreementID
    };
    console.log(jsonBody);
    this.option.method = RequestMethod.Post;
    this.option.headers = new Headers();
    this.option.headers.set("Content-Type", "application/json");
    this.option.headers.set("x-ibm-client-id", sessionStorage.getItem("session_client_id"));
    this.option.headers.set("x-ibm-client-secret", sessionStorage.getItem("session_client_secret"));
    this.http.post(`${sessionStorage.getItem("session_api_endpoint")}/downloadDocument`, JSON.stringify(jsonBody), this.option)
      .toPromise()
      .then(res => res.json())
      .then(result => {
        console.log(result);
        this.agreementservice.saveFile(result.documents[0]);
        this.downloading = false;
      })
      .catch(error => {
        this.downloading = false;
        console.log(error);
      })
  }

}
