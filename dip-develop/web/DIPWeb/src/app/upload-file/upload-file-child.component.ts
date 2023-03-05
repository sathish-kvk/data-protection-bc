import { Component, Input, Output, OnInit, Directive, OnChanges } from '@angular/core';

@Component({
    selector: 'upload-file-child',
    template: '<input type="file" id="uploadfile" (click)="ngOnClick($event)" ng2FileSelect />'
  })
  
  export class UploadFileChildComponent implements OnInit {
    //@Output click
    // @Input() hash: string;
    filename: string = "";
  
    
    constructor() {

    }
    
    ngOnInit(): void {
      
    }
  
  
    ngOnClick(e): void {
      e.target.preventDefault();
        alert("ok");
    }


  }