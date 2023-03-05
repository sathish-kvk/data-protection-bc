import { Component, Input, OnInit } from '@angular/core';
import { Router, RouteParams } from '@angular/router-deprecated';
// import  { sha256 }  from 'js-sha256';
import { sha256 } from 'js-sha256';
import {UploadFileComponent} from '../upload-file/uploadfile';


@Component({
  selector: 'check-input',
  directives:[UploadFileComponent],
  templateUrl: 'app/check-input/check-input.component.html',
  styleUrls: ['app/shared/assets/css/check-hash.component.css']
})

export default class CheckInputComponent implements OnInit {
  // @Input() hash: string;

  inputHash: string;

  inputSource: string;

  hashedSource: string = '';

  isMatched: boolean = false;

  //testHash: string = "e0d9d84a00849e546fe52f3eaa76fa890e723efb61e9dc17dbc526123d5b9d20";
  
  constructor(
    private router: Router,
    private routeParams: RouteParams
  ) {}
  
  ngOnInit(): void {
    if(this.routeParams.get('hash')){
      this.inputHash =  this.routeParams.get('hash');
    }
    else {
      this.inputHash = "";
    }
  }

  checkInput(source: string) {
    try{
      let jsonInput = JSON.parse(this.inputSource).agreement;
      jsonInput.agreementHash = '';
      console.log(jsonInput)
      this.hashedSource = sha256(JSON.stringify(jsonInput));
      //this.hashedSource = sha256(JSON.stringify(JSON.parse(this.inputSource)));
    }
    catch(error){
      this.hashedSource = "Error: can not parse the Json Source";
    }
    
    // console.log('inputSource', this.inputSource);
    // console.log('hashedSource', sha256(this.inputSource));
    //if (this.testHash === this.hashedSource) {
    if (this.inputHash === this.hashedSource) {
      this.isMatched = true;
      console.log(this.isMatched);
    } else {
      this.isMatched = false;
      console.log(this.isMatched);
    }

  }
  goBack() {
    this.router.navigate(['CheckHashComponent', { hash: this.inputHash}]);
    console.log("go back to check input");
  }

  fileChangeEvent(fileInput: any) {
    /*
    if (fileInput.target.files && fileInput.target.files[0]) {
      
      const reader = new FileReader();
      let file = fileInput.target.files[0];

      reader.onload = ((e) => {
        this.inputSource = e.target['result'];
      });

      reader.readAsText(file);
    } 
    */
    this.inputSource = fileInput;
    this.hashedSource = '';
    this.isMatched = false;
  }
}