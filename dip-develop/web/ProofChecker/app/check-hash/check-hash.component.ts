import { Component, OnInit } from '@angular/core';
import { Router, RouteParams } from '@angular/router-deprecated';
import {SpinnerComponent} from '../spinner/spinner';
import {PartyNameComponent} from '../party-name/partyname';

import {
  ProofService,
  Proof,
  Party,
  MessageService
} from '../shared/shared';

@Component({
  selector: 'check-hash',
  directives: [SpinnerComponent, PartyNameComponent],
  templateUrl: 'app/check-hash/check-hash.component.html',
  styleUrls: ['app/shared/assets/css/check-hash.component.css']
})

export default class CheckHashComponent implements OnInit {
  //==========testing multi-proof return purpose=================
  multiProof = JSON.parse(`[
    {
      "$class": "1org.dxc.dip.ProofAsset",
      "proofID": "de3e7bd1-16b9-4a3a-b1d1-bb701487699f",
      "proof": {
        "$class": "org.dxc.dip.Proof",
        "agreementHash": "75D1CA1913AA5E1DA0D3ED72139F19EBE4024BDC96FE0C4DF830FF9AFBC3C856",
        "partySignatures": [
          {
            "$class": "org.dxc.dip.PartySignature",
            "party": "1resource:org.dxc.dip.Party#2938d3dc-a1d7-4d22-92b8-c884301a708f",
            "partySignature": "2BEA936A08ABB998BC5FFCD3D69B0042236A911265C48C4FDFA35AFE032FBFF0"
          },
          {
            "$class": "org.dxc.dip.PartySignature",
            "party": "2resource:org.dxc.dip.Party#48574d2c-3a95-466d-a442-b3b6584dbcf3",
            "partySignature": "02F52EA89D3259B88AC42F2D84B4E7C040A882CA4401E7172E5AF9458B4EE822"
          }
        ],
        "createdTime": "2019-03-19T04:03:36.052Z"
      }
    },
    {
      "$class": "2org.dxc.dip.ProofAsset",
      "proofID": "de3e7bd1-16b9-4a3a-b1d1-bb701487699f",
      "proof": {
        "$class": "org.dxc.dip.Proof",
        "agreementHash": "75D1CA1913AA5E1DA0D3ED72139F19EBE4024BDC96FE0C4DF830FF9AFBC3C856",
        "partySignatures": [
          {
            "$class": "org.dxc.dip.PartySignature",
            "party": "3resource:org.dxc.dip.Party#361374d1-ba46-4704-aa97-946ff22a74fe",
            "partySignature": "2BEA936A08ABB998BC5FFCD3D69B0042236A911265C48C4FDFA35AFE032FBFF0"
          },
          {
            "$class": "org.dxc.dip.PartySignature",
            "party": "4resource:org.dxc.dip.Party#48574d2c-3a95-466d-a442-b3b6584dbcf3",
            "partySignature": "02F52EA89D3259B88AC42F2D84B4E7C040A882CA4401E7172E5AF9458B4EE822"
          }
        ],
        "createdTime": "2018-03-19T04:03:36.052Z"
      }
    }
  ]`);
  proofArray: any;
  //============end of test======================================
  resultArray: boolean = false;
  resultNotArray: boolean = false;
  hash: string = '';
  hashFound: boolean = false;
  proofDetails: any;
  data: any;
  fakeApiData: any;
  message: string;
  inputHash: string = '';
  proofs: Proof[] = [];
  proofFound: string ='';
  proofDate:string = '';
  proofTime: string = '';
  loading: boolean = false;
  constructor(
    private router: Router,
    private routeParams: RouteParams,
    private proofService: ProofService,
    private messageService: MessageService
  ) {}

  getData(): void {
    //this.proofService.getDataFromApi('{agreementHask: "++"}').then(res => this.data = res);
    //this.proofService.getFakeDataApi().then(res => this.fakeApiData = res);
    
  }

  ngOnInit(): void {
    //this.getData();
    if(this.routeParams.get('hash')){
      this.hash =  this.routeParams.get('hash');
      //this.checkHash();
    }
    //console.log(this.fakeApiData);
    
  }

  checkHash() {
    //alert(this.data.string);
    //this.proofDetails = this.data.find((item: any) => item.hash === this.hash);
    this.message="";
    this.proofs= [];
    this.loading = true;
    this.hashFound=false;
    this.proofService.getDataFromApi(this.hash)
      .map(res => res.json())
      .map(item => {
        console.log(item);
        return item.result;
      })
      .subscribe(result => {
        this.loading = false;
        
        //console.log(result.constructor);
        //console.log(result);
        if(result.constructor === Array && result[0]){
          this.resultArray = true;
          this.proofArray = result;
          // = {name :'', partySignature:''};
          let tmpProof: Proof;
          let tmpParty: Party;
          //this.proofs = result;
          
          result.forEach(element => {
            tmpProof  = {date:'', time:"", party:[], agreementHash:"", proofJson:""};
            tmpProof.date = element.proof.createdTime.split("T", 1);
            tmpProof.time = element.proof.createdTime.split("T", 2)[1].split(".", 1);
            tmpProof.proofJson = JSON.stringify(element, null, "  ")
            //tmpProof.party = element.proof.partySignatures;

            element.proof.partySignatures.forEach(item => {
              tmpParty = {party:'', partySignature:''};
              tmpParty.party = item.party;
              tmpParty.partySignature = item.partySignature;
              tmpProof.party.push(tmpParty);
            });
            this.hashFound = true;
            this.proofs.push(tmpProof);
            
          });
          
          //document.getElementById("Raw").style.display="none";
        }
        else{
          this.resultArray =false;
          console.log(result);
          if(result.proofID){
            this.proofDetails = result.proof;
            this.proofDate = result.proof.createdTime.split("T", 1);
            this.proofTime = result.proof.createdTime.split("T", 2)[1].split(".", 1);
            console.log(`date: ${this.proofDate}, time: ${this.proofTime}`);
            this.proofFound = JSON.stringify(result, null, "  ");
            this.hashFound = true;
            // this.messageService.clear();
            this.message = '';
          }
          else{
            this.hashFound = false;
            // this.messageService.add('No proof found with the hash supplied');
            this.message = 'No proof found with the hash supplied!';
          }
        }
      }
      , error => {
        this.hashFound = false;
        this.message = JSON.stringify(JSON.parse(error._body));
      });
    
  }

  checkInput() {
    //this.checkHash();
    // console.log('hash', this.hash)
    if(this.hash && this.hashFound == true) {
      this.router.navigate(['CheckInputComponent', { hash: this.hash}]);
      // this.router.navigate(['checkinput', { hash: this.hash}]);
      console.log('ok to send', this.hash);
    } else {
      return;
    }
  }

  openCity(evt, cityName) {
    // Declare all variables
    let i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
}
}