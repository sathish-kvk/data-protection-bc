import { Injectable } from '@angular/core';
import { fakeData } from '../data/mock-data';
import { Headers, Http, RequestOptions, RequestMethod } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { Observable } from 'rxjs/Observable';
import {Proof} from '../shared';
import {ApiKeys} from '../data/ApiKeys';
//import {OpenWhish} from 'openwhisk';


@Injectable()
export default class ProofService {
  //======== declaration ====================
  option: RequestOptions = new RequestOptions({method: RequestMethod.Post});
  header: Headers = new Headers({
    "accept": "application/json"
  });
  foundProof: Proof;

  //======end of declaration==================

  constructor(private http: Http) {
    this.option.headers = this.header;
    
  }

  getData(): Promise<Object> {
    // this.messageService.add('ProofService: fetched data');
    return Promise.resolve(fakeData);
  }

  getDataFromApi(jsonBody: string) {
    // this.messageService.add('ProofService: fetched data');
    console.log(jsonBody);
    let bodyString = JSON.parse(`{
      "agreementHash": "${jsonBody}"
    }`);
    this._setOption(ApiKeys["TestTenant"], "POST");
    let url = "https://openwhisk.eu-gb.bluemix.net/api/v1/namespaces/_/actions/common-ow/findProof?blocking=true&result=true&filter[include]=resolve";
    //console.log(bodyString);


    return this.http.post(url, JSON.stringify(bodyString), this.option)


      //.catch(error => Promise.reject(error.message));
  }


  checkHash(hash: string) {
    // call getProofDetails to get response 
    
  }

  getPartyName(partyID: string){

    let bodyString = JSON.parse(`{
      "partyID": "${partyID}"
    }`);
    let url = `/partyname/${partyID}`;
    //console.log(bodyString);

    this._setOption(ApiKeys["DXCV"], "GET");
    return this.http.get(url, this.option);
  }

  getProofDetails(hash: string): Promise<Object> {
    // return hash, array of party names, array of signed hashes, date and time Proof was posted
    return Promise.resolve(fakeData);
  }

  matchingInput(inputJson: JSON) {
    //uses node-crypt to create a hash of input JSON
    //return success if created and supplied hashes match
    return true;
  }

  private _setOption(author: string, method: string): void {
    this.option.method = method;
    this.option.headers.set("accept", "application/json");
    this.option.headers.set("Content-Type", "application/json");
    this.option.headers.set("Authorization", author|| "");
  }
}

