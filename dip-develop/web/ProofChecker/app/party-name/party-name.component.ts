import {Component, Input, ViewChild, ElementRef, AfterViewInit, AfterContentInit} from '@angular/core';
import { Headers, Http, RequestOptions, RequestMethod } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { Observable } from 'rxjs/Observable';
import {ProofService} from '../shared/shared';

/**
 * @title Basic progress-spinner
 */
@Component({
    selector: "party-name",
    templateUrl:'app/party-name/party-name.component.html' 
  })
  export default class PartyNameComponent implements AfterContentInit {  
    @Input() show = false;
    @Input() value = "";
    @ViewChild('partyname') childCom: ElementRef;
    loading: boolean = false;

    constructor(private http: Http, private proofService: ProofService){

    }

    ngAfterContentInit(){
      this.getPartyName();
    }

    getPartyName(){
      //console.log(this.childCom.nativeElement.value);
      this.loading = true
      if(this.value.includes("#")){
        this.proofService.getPartyName(this.value.split("Party#", 2)[1])
          .map(res => res.json())
          .subscribe(result => {
            if(result[0]){
              this.value = JSON.stringify(result[0].partyName);
            }
            else{
              this.value = "no party found!!!";
            }
            this.loading = false;
          });
      }
    }
  }