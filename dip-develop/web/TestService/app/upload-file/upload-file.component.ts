import { Component, Input, OnInit, ViewChild, ContentChild, Renderer, ElementRef, Output, EventEmitter } from '@angular/core';
import { Router, RouteParams } from '@angular/router-deprecated';



@Component({
  selector: 'upload-file',

  templateUrl: 'app/upload-file/upload-file.component.html',
  styleUrls: ['app/upload-file/upload-file.component.css']
})

export default class UploadFileComponent implements OnInit {
  // @Input() hash: string;
  filename: string = '';
  fullpath: string[];
  initString: string = "Select a file .json";
  @Output() change = new EventEmitter();
  inputSource: string;
  fileObj: any [];
  
  
  @ViewChild('test') childCom: ElementRef;
  
  constructor(
    private router: Router,
    private routeParams: RouteParams,
    private renderer: Renderer
  ) {}
  
  ngOnInit(): void {
    this.filename = this.initString;
  }

  ngAfterViewInit(): void {
    
  }

  clickBtn() {
    let event = new MouseEvent('click', {bubbles: false});
    this.childCom.nativeElement.dispatchEvent(event);
    
  }

  inputOnchange(fileInput:any): void {
    
    //alert(this.childCom.nativeElement.value);
    //this.filename = this.childCom.nativeElement.value;
    if(this.childCom.nativeElement.value.length>1){
      this.fullpath = this.childCom.nativeElement.value.split("\\");
      //this.fileObj.push(this.fullpath);
      this.filename = this.fullpath[this.fullpath.length -1];
      if (fileInput.target.files && fileInput.target.files[0]) {
        //alert("run");
        const reader = new FileReader();
        let file = fileInput.target.files[0];
  
        reader.onload = ((e) => {
          //this.fileObj.push(e.target['result']);
          this.change.emit(e.target['result']);
          //this.change.emit(this.fileObj);
        });
  
        reader.readAsText(file);
      } 
    }
   
    
 
  }

  fileChangeEvent(fileInput: any) {
    
  }
 
}