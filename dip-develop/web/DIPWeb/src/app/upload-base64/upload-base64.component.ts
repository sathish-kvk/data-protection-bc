import { Component, OnInit, Input, Output, ViewChild, EventEmitter, ElementRef, Renderer } from '@angular/core';
import { FILE } from 'dns';

@Component({
  selector: 'app-upload-base64',
  templateUrl: './upload-base64.component.html',
  styleUrls: ['./upload-base64.component.css']
})
export class UploadBase64Component implements OnInit {

  
  @Input() textToDisplay:string;
  @Input() leftRadius: string;
  @Input() btnWidth: string;
  @Input() rightRadius: string;
  @Output() change = new EventEmitter();
  filename: string = '';
  fullpath: string[];
  inputSource: string;
  fileObj = {
    documentName: '',
    documentContent: '',
    documentType:''
  };
  initString: string = "Load";
  base64Content;
  
  @ViewChild('test') childCom: ElementRef;
  
  constructor(

    private renderer: Renderer
  ) {}
  
  ngOnInit(): void {
    this.filename = this.initString;
  }

  ngAfterViewInit(): void {
    this.filename = this.textToDisplay || this.initString;
    console.log(this.leftRadius);
    if(this.leftRadius){
      document.getElementById("btnupload").style.borderBottomLeftRadius=this.leftRadius;
      document.getElementById("btnupload").style.borderTopLeftRadius= this.leftRadius;
    }
    if(this.rightRadius){
      document.getElementById("btnupload").style.borderBottomRightRadius=this.rightRadius;
      document.getElementById("btnupload").style.borderTopRightRadius= this.rightRadius;
    }
    if(this.btnWidth){
      document.getElementById("btnupload").style.width = this.btnWidth;
    }
    
  }

  clickBtn() {
    let event = new MouseEvent('click', {bubbles: false});
    this.childCom.nativeElement.dispatchEvent(event);
    
  }

  inputOnchange(fileInput:any): void {
    if(this.childCom.nativeElement.value.length>1){
      this.fullpath = this.childCom.nativeElement.value.split("\\");
      //this.fileObj.push(this.fullpath);
      this.filename = this.fullpath[this.fullpath.length -1];
      if (fileInput.target.files && fileInput.target.files[0]) {
        //alert("run");
        const reader = new FileReader();
        let file = fileInput.target.files[0];
        //let myFile = new FILE()
  
        reader.onloadend = ((e) => {
          this.base64Content = e.target['result'].split(',');
          this.fileObj['documentName']=this.filename;
          this.fileObj['documentContent']=this.base64Content[1];
          this.fileObj['documentType']=this.base64Content[0]
          this.change.emit(this.fileObj);
          console.log(this.fileObj);
        });
        reader.readAsDataURL(file);
      } 
      }
  }

  

  fileChangeEvent(fileInput: any) {
    
  }

}
