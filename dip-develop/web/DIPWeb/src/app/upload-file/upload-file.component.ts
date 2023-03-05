import { Component, Input, OnInit, ViewChild, ContentChild, Renderer, ElementRef, Output, EventEmitter } from '@angular/core';




@Component({
  selector: 'upload-file',

  templateUrl: './upload-file.component.html'
})

export class UploadFileComponent implements OnInit {
  // @Input() hash: string;
  
  @Input() textToDisplay:string;
  @Input() leftRadius: string;
  @Input() btnWidth: string;
  @Input() rightRadius: string;
  @Output() change = new EventEmitter();
  filename: string = '';
  fullpath: string[];
  inputSource: string;
  fileObj: any [];
  initString: string = "Load";
  
  
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
          this.change.emit(JSON.parse(e.target['result']));
          //this.change.emit(this.fileObj);
        });
  
        reader.readAsText(file);
      } 
      }
  }

  fileChangeEvent(fileInput: any) {
    
  }
 
}