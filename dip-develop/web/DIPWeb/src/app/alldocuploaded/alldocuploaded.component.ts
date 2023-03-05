import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { AgreementService } from '../agreement.service';
import { ConfirmComponent } from '../confirm/confirm.component';
import { DialogService } from "ng2-bootstrap-modal";
import { elementAt } from 'rxjs/operator/elementAt';
declare var $:any

@Component({
  selector: 'app-alldocuploaded',
  templateUrl: './alldocuploaded.component.html',
  providers: [AgreementService],
  styleUrls: ['./alldocuploaded.component.css']
})
export class AlldocuploadedComponent implements OnInit, AfterContentChecked {
  agreementID;
  listDocuments;
  listElements=[];
  loginParty=sessionStorage.getItem('session_party_name');
  fileName;
  jsonValue;
  isLoading = false;

  constructor(private dialogService:DialogService, private agreementservice: AgreementService) { }

  ngOnInit() {
    this.getDocuments();
  }

  showPopup(e){
    //$('[data-toggle="popover"]').attr("title", e.target.id)
    $('[data-toggle="popover"]').attr("data-content", JSON.stringify(this.setContent(e.target.id), null, "  ").toString());
    $('[data-toggle="popover"]').popover()
  }
  

  getDocuments(){
    this.isLoading = true;
    this.agreementservice.getTableHashes()
      .toPromise()
      .then(result => result.json())
      .then(res => {
        this.listDocuments = res.tableHashes;
        //this.setContent();
        this.isLoading = false;
      })
      .catch(error => {
        //console.log(error)
        this.isLoading = false;
      })
  }

  format ( d ) {
    // `d` is the original data object for the row
    let tmpTable="<table style='font-size: 12px' class='table table-condensed table-hover'>";
    //console.log(d)
    d.forEach((val, index) => {
      if(index==0){
        for(let i = 0; i < Object.keys(val).length; i++){
          if(i==0){
            tmpTable += "<tr style='font-weight: bold'>";
          }
          tmpTable += `<td>${Object.keys(val)[i]}</td>`;
          if(i==val.length-1){
            tmpTable += "</tr>";
          }
        }
      }
      for(let i = 0; i < Object.keys(val).length; i++){
        if(i==0){
          tmpTable += "<tr>";
        }
        tmpTable += `<td>${val[Object.keys(val)[i]]}</td>`;
        if(i==val.length-1){
          tmpTable += "</tr>";
        }
      }
    })
    tmpTable += "</table>";
    //alert(tmpTable);
    return tmpTable;
    
  }



  ngAfterContentChecked() {
    //$("#grid-basic").bootgrid();
    //$("table.table.table-condensed.subContent").css("visibility" , "hidden")
  }

  setContent(jsonName): string{
    //console.log(this.listDocuments);
    let found = this.listDocuments.filter(ele => {
      if(ele.name === jsonName)
      {
        //console.log(ele)
        return ele
      }
    })
    //console.log(JSON.stringify(found[0].value, null, "  "))
    let result = JSON.stringify(found[0].value,  null, " ").replace(/\"/g, "'");
    //result = result.replace(/\[/g, "");
    result = result.replace(/\n/g, "</br>");
    
    return result;
  }

  expand(name){
    
    //console.log(document.getElementsByClassName("fa fa").length)
    
    if(document.getElementById(`subTable${name}`).hidden){
      for(let i=0; i <document.getElementsByClassName("subContent").length; i++){
        document.getElementsByClassName("subContent").item(i).setAttribute("hidden", "true");
        document.getElementsByClassName('fa').item(i + 2).setAttribute("class", "fa fa-plus-square-o");
      }
      document.getElementById(`subTable${name}`).hidden = false;
      document.getElementById(`fa${name}`).setAttribute("class", "fa fa-minus-square-o");
      
    }
    else{
      
      document.getElementById(`subTable${name}`).hidden = true;
      document.getElementById(`fa${name}`).setAttribute("class", "fa fa-plus-square-o");
    }
    
  }

  inputOnchange(fileInput:any): void {
    let comJsonFile = document.getElementById("jsonFile") as HTMLInputElement;
    let fullpath;
    this.fileName="";
    this.jsonValue={};
    //alert(this.childCom.nativeElement.value);
    //this.filename = this.childCom.nativeElement.value;
    if(comJsonFile.value.length>1){
      fullpath = comJsonFile.value.split("\\");
      //this.fileObj.push(this.fullpath);
      this.fileName = fullpath[fullpath.length -1];
      if (fileInput.target.files && fileInput.target.files[0]) {
        //alert("run");
        const reader = new FileReader();
        let file = fileInput.target.files[0];
        reader.onloadend = ((e) => {
          //this.fileObj.push(e.target['result']);
          //this.change.emit(JSON.parse(e.target['result']));
          //this.change.emit(this.fileObj);
          this.jsonValue = JSON.parse(e.target['result']);
          //console.log(this.fileName);
          //console.log(this.jsonValue);
        });
        reader.readAsText(file);
      } 
    }
  }

  cleanJsonFile(){
    this.fileName="";
    this.jsonValue={};
    $("#jsonFile").val('')
  }

  addTableHash(){
    let jsonBody = {
      name: this.fileName.split(".")[0],
      value: this.jsonValue
    }
    //console.log(jsonBody);
    this.agreementservice.addTableHash(jsonBody)
      .toPromise()
      .then(res => {
        res.json();
        this.cleanJsonFile();
        this.getDocuments();
      })
      .catch(error => {
        this.cleanJsonFile()
        //console.log(error)
      })
  }

  deleteTableHash(tableHashName){
    let jsonBody = {
      name: tableHashName
    }
    //console.log(jsonBody);
    this.agreementservice.deleteTableHash(jsonBody)
      .toPromise()
      .then(res => {
        res.json();
        this.getDocuments();
      })
      .catch(error => {
        console.log(error)
      })
  }

  confirmDelete(tableHashName: string){
    let disposable = this.dialogService.addDialog(ConfirmComponent, {
      title:'Confirmation', 
      message:`Would you like to delete "${tableHashName}.json"?`})
      .subscribe((isConfirmed)=>{
          //We get dialog result
          if(isConfirmed) {
              this.deleteTableHash(tableHashName);
          }
      });
  }

}
