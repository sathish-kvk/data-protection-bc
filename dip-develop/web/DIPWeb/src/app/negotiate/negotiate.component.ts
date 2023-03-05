import { Component, OnInit, AfterContentChecked } from '@angular/core';
import {Http, Headers, RequestOptions, Response, RequestMethod} from "@angular/http";
import { Observable } from 'rxjs/Observable';
import { error } from 'selenium-webdriver';
import { ConfirmComponent } from '../confirm/confirm.component';
import { DialogService } from "ng2-bootstrap-modal";
import { AlertComponent } from '../alert/alert.component';
import { first } from 'rxjs/operator/first';
import { AgreementService } from '../agreement.service';



declare var $: any;
declare var jsonEditorObj: any;

@Component({
  selector: 'app-negotiate',
  templateUrl: './negotiate.component.html',
  providers: [AgreementService],
  styleUrls: ['./negotiate.component.css']
})
export class NegotiateComponent implements OnInit, AfterContentChecked {
  checkElementMsg;
  elementExists;
  leftRadiusForUpload = "0px";
  uploadFileStr="select .json file...";
  tmp = JSON.parse(`{
    "agreementName": "Test Agreement",
    "elements":[
      {
        "elementName": "startDate",
        "elementType":"date",
        "elementRules":[
          {
            "ruleType":"constraint",
            "ruleText":"<value>=01/05/2018"
          },
          {
            "ruleType":"constraint",
            "ruleText":"<value>=01/05/2018"
          }
        ] 
      }
    ]
  }`);

  jsonOutput;
  agreementName;
  currentAgreementName;
  currentElements=[];
  currentParties=[];
  treePath;
  eleName;
  eleType;
  agreementJson;
  currentPath;
  selectedElement;
  ruleToAdd;
  agreementID;
  contractDetails;

  itemRemoved; //Element/Party/Rule
  selectedRule;

  jsonComplex;
  jsonSimple;
  publishResult;
  isLoading;
  updateElement; //element selected for editing.
  currentApiKey;
  treeviewTop;
  treeviewLeft;
  fontsizeLarge="19px";
  ruleColor;
  existingElement=[];
  existingParties=[];
  currentAgreement="";

  spacesStore: any[] = [];
  listOfParty: any[] =[];
  listOfPartiesFiltered: any[]=[];

  header: Headers = new Headers({
    "accept": "application/json"
  });
  option: RequestOptions = new RequestOptions({method: RequestMethod.Post});
  reqMethod: RequestMethod;
  loginParty=sessionStorage.getItem("session_party_name");
  public data: string = '';
  jsonElement = JSON.stringify(this.tmp.elements);

  constructor(
    private http: Http, 
    private dialogService:DialogService, 
    private agreementservice: AgreementService) { }

  ngOnInit() {
    jsonEditorObj.init();
    this.getListOfParties();
    this.createEditor();
  }

  createEditor(){
    
    if(this.agreementName){
      this.currentAgreementName = this.agreementName;
      this.agreementName="";
    }

    let tmpElements
    let tmpParties
    if(this.currentElements){
      tmpElements = this.currentElements.map((item) => {
        return item.elementName;
      });
    }
    if(this.currentParties){
      tmpParties = this.currentParties.map((item) => {
        return item.partyName;
      });
    }

    jsonEditorObj.destroy();
    jsonEditorObj.init();
    jsonEditorObj.createJsonEditor(this.currentAgreementName, this.currentElements, this.currentParties);
    
    $(".jsoneditor-field").each((index, value)=>{
      if($(value).text().indexOf("elementType")>-1){
        $(value).parent().parent().remove();
      }

      if($(value).text().indexOf("writeOnce")>-1){
        $(value).parent().parent().remove();
      }

      if($(value).text().indexOf("partyID")>-1){
        $(value).parent().parent().remove();
      }

      if($(value).text().indexOf("elements")>-1){
        $(value).html("ELEMENTS");
        
      }

      if($(value).text().indexOf("parties")>-1){
        $(value).html("PARTIES");
      }

      if($(value).text().indexOf("elementRules")>-1){
        $(value).html("RULES");
      }

      if($(value).text().indexOf("agreementName")>-1){
        $(value).parent().parent().children().children().css("color", "green");
        $(value).parent().parent().children().children().css("font-size", "19px");
      }

      if($(value).text().indexOf("elementName")>-1){
        $(value).parent().parent().children().children().css("color", "purple");
        $(value).parent().parent().children().children().css("font-size", this.fontsizeLarge);
      }

      if($(value).text().indexOf("partyName")>-1){
        $(value).parent().parent().children().children().css("color", "blue");
        $(value).parent().parent().children().children().css("font-size", this.fontsizeLarge);
      }

      if($(value).text().indexOf("ruleType")>-1){
        if($(value).parent().parent().children().children().text().indexOf("formula")>-1){
          $(value).parent().parent().children().children().css("color", "red");
          //$(value).parent().parent().children().children().css("font-size", this.fontsizeLarge);
          this.ruleColor = "red";
        }
        else{
          $(value).parent().parent().children().children().css("color", "orange");
          //$(value).parent().parent().children().children().css("font-size", this.fontsizeLarge);
          this.ruleColor = "orange";
        }
      }

      if($(value).text().indexOf("ruleText")>-1){
        $(value).parent().parent().children().children().css("color", this.ruleColor);
        $(value).parent().parent().children().children().css("font-size", this.fontsizeLarge);
      }
      
    });
    
    $(".jsoneditor-expanded").first().css("visibility", "hidden");
    // hide the root element
    $(".jsoneditor-readonly").css("visibility", "hidden");
    $(".jsoneditor-readonly").parent().parent().parent().parent().parent().siblings().css("visibility", "hidden");
    //hide the context menu in elements and elementRule items
    //$(".jsoneditor-contextmenu").css("visibility", "hidden");
    //$(".jsoneditor-dragarea").css("visibility", "hidden");
    $(".jsoneditor-contextmenu").parent().remove();
    $(".jsoneditor-dragarea").parent().remove();
    $(".jsoneditor-value.jsoneditor-array").first().remove();
    $(".jsoneditor-menu").remove();
    //$(".jsoneditor-menu").html("<div><img src='../../assets/img/editorheader.gif'></div>");
    $(".jsoneditor-menu").css("border-color", "grey");
    $(".jsoneditor").css("border-color", "grey");
    //$(".jsoneditor-field").remove();
    //$(".jsoneditor-field").css("visibility", "hidden");
    $(".jsoneditor-separator").siblings().next().remove();
    $(".jsoneditor-separator").remove();
    //$(".jsoneditor-treepath").children("div").children().prop('disabled', true);

    //ng checked
    //hide elementType and party ID
   
    $(".jsoneditor-field").each((index, value)=>{
      console.log($(this).attr("spellcheck"));
      console.log($(value).text());
      if($(value).text().indexOf("elementType")>-1 ){
        $(value).parent().parent().parent().parent().parent().remove();
        console.log(value);
      }
    });

    // end of hide elementType and party ID
    
    $(".jsoneditor-value.jsoneditor-array").html("");
    
    $(".jsoneditor-value.jsoneditor-object").parent().parent().remove();
    //$(".jsoneditor-tree").css("height", "20px");
    //$(".jsoneditor-expaneded").parent().siblings().first().html("<div>X</div>");
    //$(".jsoneditor-value.jsoneditor-array").css("visibility", "hidden");
    //$(".jsoneditor-expanded").parent().siblings().first().next().html("<div>X</div>");
    $(".jsoneditor-expanded").first().css("visibility", "hidden");
    
    $(".jsoneditor-value.jsoneditor-string").parent().siblings().remove();
    //end of ng check


    
    if(this.treeviewTop>0){
      $("div.jsoneditor-tree").scrollTop(this.treeviewTop);
      console.log(this.treeviewTop);
    }

    if(this.treeviewLeft>0){
      $("div.jsoneditor-tree").scrollLeft(this.treeviewLeft);
    }
    this.getJson();
  }

  getJson(){
    this.jsonOutput = jsonEditorObj.getJson();
    let tmpjson = {
      agreementName: this.currentAgreementName,
      elements: this.currentElements,
      parties: this.currentParties
    };
    
    
    
    this.jsonComplex = JSON.stringify(tmpjson, null, "    ");
    
  }

  ngAfterContentChecked(){
    this.getJson();
    if(JSON.parse(this.jsonOutput)[0]){
      this.currentAgreementName = JSON.parse(this.jsonOutput)[0].agreementName;
    }
    
    
    this.getTreePath();
    
  }

  getTreePath(){
    let tmpTreePath = $(".jsoneditor-treepath").text().split("►");
    let currentObj = {};
    this.selectedRule = -1;
    this.selectedElement = -1;
    let i = 0;
    tmpTreePath.forEach(element => {
      if(element == "elements" || element =="parties" || element=="elementRules"){
        this.itemRemoved = element;
      }
      if(!isNaN(Number(element))){
        currentObj = currentObj[element];
        if(i==1){
          this.selectedElement = element;
        }
        if(i==2){
          this.selectedRule =element;
        }
        i++;
      }
      else{
        if(element==="array"){
          currentObj = JSON.parse(this.jsonOutput);
        }
        else{
          currentObj = currentObj[element];
        }
      }
      
    });
    console.log(currentObj);
  }

  removeItem(){
    this.getTreePath();
    
    switch(this.itemRemoved){
      case "elements": {
        this.currentElements.splice(this.selectedElement, 1);
        break;
      }
      case "parties": {
        this.currentParties.splice(this.selectedElement, 1);
        break;
      }
      case "elementRules": {
        this.currentElements[this.selectedElement].elementRules.splice(this.selectedRule, 1);
        if(this.currentElements[this.selectedElement].elementRules.length == 0){
          let tmpElement = {
            elementName: this.currentElements[this.selectedElement].elementName,
            elementType: this.currentElements[this.selectedElement].elementType
          };
          this.currentElements[this.selectedElement] = tmpElement;
          
        }
      }
    }
    this.filterListOfParties();
    this.createEditor();
  }

  addElement(name:string, type:string){
    this.getJson();
    this.agreementJson = JSON.parse(this.jsonOutput);
    let tmpElements = this.agreementJson;
    let ctrWriteOne = document.getElementById("cbWriteOne") as HTMLInputElement;
    //console.log(currentElements[0]);
    if(tmpElements[0]){
      //console.log(currentElements[0].elements);
      if(tmpElements[0].elements){
        tmpElements[0].elements.push({writeOnce: ctrWriteOne.checked, elementName: name, elementType: type});
        //this.createEditor(tmpElements[0].elements);
        this.currentElements = tmpElements[0].elements;
        this.eleName="";
        ctrWriteOne.checked = true;
        this.createEditor();
        console.log(this.currentElements);
      }
    }
  }

  

  addRule(elementIndex, rule){
    this.getJson();
    this.agreementJson = JSON.parse(this.jsonOutput);
    let tmpElements = this.agreementJson;
    let selectedRuleType;
    if($("input[name=elementRuleUI]:checked").val()=="c"){
      selectedRuleType = "constraint";
    }
    else{
      selectedRuleType = "formula";
    }
    //console.log(currentElements[0]);
    if(tmpElements[0]){
      //console.log(currentElements[0].elements);
      if(tmpElements[0].elements[elementIndex].elementRules){
        tmpElements[0].elements[elementIndex].elementRules.push({ruleType: selectedRuleType, ruleText: rule});
        //this.createEditor(currentElements[0].elements);
        this.currentElements = tmpElements[0].elements;
        this.eleName="";
      }
      else{
        Object.assign(tmpElements[0].elements[elementIndex], {elementRules:[{ruleType: selectedRuleType, ruleText: rule}]});
        //["elementRules"] = [{ruleType: this.selectedElement, ruleText: rule}];    //.push({elementRules:[{ruleType: this.selectedElement, ruleText: rule}]});
        //this.createEditor(currentElements[0].elements);
        this.currentElements =tmpElements[0].elements;
        this.eleName="";
      }
      this.createEditor();
    }
  }

  addParty(name:string){
    let selectedParty = this.getPartyByName(name)[0];
    console.log(selectedParty);
    this.getJson();
    this.agreementJson = JSON.parse(this.jsonOutput);
    let tmpParties = this.agreementJson;
    if(tmpParties[0]){
      //console.log(currentElements[0].elements);
      if(tmpParties[0].parties){
        tmpParties[0].parties.push({partyName: selectedParty.partyName, partyID: selectedParty.partyID});
        //this.createEditor(tmpElements[0].elements);
        this.currentParties = tmpParties[0].parties;
        //this.eleName="";
        this.createEditor();
      }
    }
  }

  newPartyClick(){
    this.addParty($("#listOfNegotiateParties option:selected").text());
    this.filterListOfParties();
  }

  newElementClick(){
    
    this.addElement(this.eleName, $("#elementType option:selected").text());
    
  }

  addExistElementClick(){
    this.addElement($("#listofExistingElement option:selected").text(), $("#listofExistingElement option:selected").val());
  }

  newRuleClick(){
    this.addRule(this.selectedElement, this.ruleToAdd)
    this.ruleToAdd="";
  }

  getListSpace(url:string): void {
    this.http.get(url)
      .toPromise()
      .then(response => response.json())
      .then(res => {
        res.forEach(element => {
          this.spacesStore.push(element);
        });
      }); 
  }

  getListOfParties(): void {
    this.agreementservice.getListOfParties()
      .toPromise()
      .then(res => res.json())
      .then(result => {
        this.listOfParty=result.parties;
        this.listOfParty.sort((a,b) => {return (a.partyName.toLowerCase() > b.partyName.toLowerCase()) ? 1 : ((b.partyName.toLowerCase() > a.partyName.toLowerCase()) ? -1 : 0);} );
      })
      .catch(error => console.log(error)) 
  }

  getPartyByName(name: string): any{
    return this.listOfParty.filter((data) => {
      return data.partyName.trim() === name.trim();      
    });
  }


  showConfirm() {
    let disposable = this.dialogService.addDialog(ConfirmComponent, {
        title:'Create a new contract!!!', 
        message:`Would you like to delete "${this.currentAgreementName}" and create new contract "${this.agreementName}"?`})
        .subscribe((isConfirmed)=>{
            if(isConfirmed) {
                this.currentAgreementName="";
                this.currentElements=[];
                this.currentParties=[];
                this.createEditor();
            }

        });
  }

  closeAlert(){
    this.publishResult="";
  }


  newContractClick(){
    if(this.currentAgreementName){
      this.showConfirm();
    }
    else{
      this.createEditor();
    }
  }

  filterListOfParties(){
    let partyAdded;
    let tmpListOfParties=[];
    this.listOfPartiesFiltered=[];
    this.listOfParty.forEach(el1 => {
      partyAdded=false;
      this.currentParties.forEach(el2 =>{
        if(el1.partyName === el2.partyName){
          partyAdded = true;
        }
      });
      if(!partyAdded){
        this.listOfPartiesFiltered.push(el1);
      }
    });
    
    this.listOfPartiesFiltered.forEach(el1 => {
      partyAdded=false;
      this.existingParties.forEach(el2 =>{
        if(el1.partyName === el2.partyName){
          partyAdded = true;
        }
      });
      if(!partyAdded){
        tmpListOfParties.push(el1);
      }
    });
    
    
    this.listOfPartiesFiltered = tmpListOfParties;
    console.log(this.listOfPartiesFiltered);
  }

  fileChangeEvent(fileInput: any) {
    this.currentAgreementName = fileInput.agreementName || "";
    this.currentElements = fileInput.elements || [];
    this.currentParties = fileInput.parties || [];
    this.createEditor();
    this.filterListOfParties();
    console.log(fileInput);
  }

  getAgreement(){
    this.checkElementMsg="";
    this.contractDetails="Loading agreement details...";
    this.agreementservice.exportAgreement(this.agreementID)
        .toPromise()
        .then(res => res.json())
        .then(result => {
          this.currentAgreementName = result.agreement.agreementName;
          this.contractDetails = JSON.stringify(result.agreement, null, "   ");
          this.currentAgreement = this.contractDetails;
          this.existingElement = result.agreement.elements;
          this.existingParties = result.agreement.parties;
          console.log(this.existingElement);
          this.createEditor();
          this.filterListOfParties();
        })
        .catch(error => {
          if(JSON.parse(error._body).body.error){
            this.checkElementMsg = JSON.parse(error._body).body.error;
          }
          else{
            this.checkElementMsg = JSON.parse(error);
          }
          this.currentAgreementName = "";
          this.existingElement = [];
          this.existingParties = [];
          this.createEditor();
          this.filterListOfParties();
          this.contractDetails ="";
        })
  }

  checkElementExists(){
    this.elementExists = false;
    this.checkElementMsg = '';

    if(this.agreementservice.checkElementExists(this.eleName, this.currentElements)){
      this.elementExists = true;
      this.checkElementMsg = `${this.eleName} is in TreeView already!!!`;
    }
    
    if(this.agreementservice.checkElementExists(this.eleName, this.existingElement)){
      this.elementExists = true;
      this.checkElementMsg = `${this.eleName} is in Contract already!!!`;
    }
  }

  
  negotiateAgreement(){
    this.contractDetails="Negotiating...";
    let jsonBody = {
      agreementID: this.agreementID
      
    };
    if(this.currentElements && this.currentElements.length>0){
      jsonBody["elements"]=this.currentElements;
    }
    if(this.currentParties && this.currentParties.length>0){
      jsonBody["parties"] = this.currentParties;
    }
    console.log(jsonBody);
    
    this.option.method = RequestMethod.Post;
      this.option.headers = new Headers();
      this.option.headers.set("Content-Type", "application/json");
      this.option.headers.set("X-IBM-Client-id", sessionStorage.getItem("session_client_id"));
      this.option.headers.set("X-IBM-Client-secret", sessionStorage.getItem("session_client_secret"));
      this.http.post(`${sessionStorage.getItem('session_api_endpoint')}/negotiate`, JSON.stringify(jsonBody), this.option)
        .toPromise()
        .then(res => res.json())
        .then(result => {
          console.log(result)
          if(result.Message && result.Message.indexOf("is not Negotiate")> -1){
              this.checkElementMsg="There is one or more party whose agreement is not in Negotiate";
          }
          else{
            this.currentElements=[];
            this.currentParties=[];
            this.getAgreement();
          }
          
        })
        .catch(error => {
          if(JSON.parse(error._body).body.error){
            this.checkElementMsg = JSON.parse(error._body).body.error;
            //this.contractDetails = JSON.parse(error._body).body.error;
          }
          else{
            this.checkElementMsg = JSON.stringify(error);
            //this.contractDetails = JSON.parse(error);
          }
          console.log(error);
          this.contractDetails = this.currentAgreement;
        })
     

  }
}
