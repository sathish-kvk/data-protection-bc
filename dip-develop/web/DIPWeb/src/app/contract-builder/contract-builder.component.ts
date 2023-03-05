import { Component, OnInit, AfterContentChecked } from '@angular/core';
import {Http, Headers, RequestOptions, Response, RequestMethod} from "@angular/http";
import { ConfirmComponent } from '../confirm/confirm.component';
import { DialogService } from "ng2-bootstrap-modal";
import {AgreementService} from '../agreement.service';


declare var $: any;
declare var jsonEditorObj: any;


@Component({
  selector: 'app-contract-builder',
  templateUrl: './contract-builder.component.html',
  providers:[AgreementService],
  styleUrls: ['./contract-builder.component.css']
})
export class ContractBuilderComponent implements OnInit, AfterContentChecked {
  fileObj: any;
  leftRadiusForUpload = "0px";
  uploadFileStr="document";
  loadAgreementStr="Load";
  checkElementMsg;
  elementExist;
  jsonOutput;
  agreementName;
  currentAgreementName;
  currentElements;
  currentParties=[];
  treePath;
  eleName;
  eleType;
  agreementJson;
  currentPath;
  selectedElement;
  ruleToAdd;

  itemRemoved; //Element/Party/Rule
  selectedRule;

  jsonComplex;
  jsonSimple;
  publishResult;
  isLoading;
  ruleColor;
  fontsizeLarge = "19px";
  fontsizeSmall;
  treeviewTop;
  treeviewLeft;
  writeOne = true;

  spacesStore: any[] = [];
  listOfParty: any[] =[];
  listOfPartiesFiltered: any[]=[];

  header: Headers = new Headers({
    "accept": "application/json"
  });
  option: RequestOptions = new RequestOptions({method: RequestMethod.Post});
  reqMethod: RequestMethod;

  jsonAuthorization;
  //currentSpace;
  loginParty=sessionStorage.getItem("session_party_name");
  
  jsonDisplay;

  constructor(
    private http: Http, 
    private dialogService:DialogService, 
    private dataservice: AgreementService) { }

  ngOnInit() {
    jsonEditorObj.init();
    if(sessionStorage.getItem("session_party_name")){
      this.getListOfParties();
    }
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
    
    //hide elementType and party ID
    
   
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
        $(value).parent().parent().children().children().css("color", "orange");
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
          $(value).parent().parent().children().children().css("color", "green");
          //$(value).parent().parent().children().children().css("font-size", this.fontsizeLarge);
          this.ruleColor = "green";
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
    $(".jsoneditor-contextmenu").parent().remove();
    $(".jsoneditor-dragarea").parent().remove();
    $(".jsoneditor-value.jsoneditor-array").first().remove();
    $(".jsoneditor-menu").remove();
    $(".jsoneditor-menu").css("border-color", "grey");
    $(".jsoneditor").css("border-color", "grey");
    $(".jsoneditor-separator").siblings().next().remove();
    $(".jsoneditor-separator").remove();

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
    this.togglePublishButton();
    this.getTreePath();
    this.getTreeViewPos();
    this.jsonDisplay = JSON.stringify(JSON.parse(this.jsonOutput)[0], null, "   ");
  }

  getTreePath(){
    let tmpTreePath = $(".jsoneditor-treepath").text().split("►");
    console.log(tmpTreePath);
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
      }
    }
  }

  addRule(elementIndex, rule){
    //this.addTableHashElement(this.ruleToAdd);
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
      if(tmpParties[0].parties){
        tmpParties[0].parties.push({partyName: selectedParty.partyName, partyID: selectedParty.partyID});
        this.currentParties = tmpParties[0].parties;
        this.createEditor();
      }
    }
  }

  newPartyClick(){
    this.addParty($("#listofparties option:selected").text());
    this.filterListOfParties();
  }

  newElementClick(){
    this.addElement(this.eleName, $("#elementType option:selected").text());
    
  }

  newRuleClick(){
    this.addRule(this.selectedElement, this.ruleToAdd)
    this.ruleToAdd="";
  }

  getListSpace(url:string): void {
    this.http.get(url)
      .map(res => res.json())
      .subscribe(res => {res.forEach(element => {
        this.spacesStore.push(element);
      });})
  }

  getListOfParties(): void {
    
    this.dataservice.getListOfParties()
      .toPromise()
      .then(res => res.json())
      .then(result => {
        this.listOfParty=result.parties;
        this.listOfParty.sort((a,b) => {return (a.partyName.toLowerCase() > b.partyName.toLowerCase()) ? 1 : ((b.partyName.toLowerCase() > a.partyName.toLowerCase()) ? -1 : 0);} );
        console.log(this.listOfParty);
        this.filterListOfParties();
      })
      .catch(error => {
        console.log(error);
      }
      )
      
  }
 

  publishAgreement(){
    if(sessionStorage.getItem("session_party_name")){
      let jsonBody = {
        initiatorParty: sessionStorage.getItem("session_party_name"),
        agreementName: JSON.parse(this.jsonOutput)[0].agreementName,
        elements: JSON.parse(this.jsonOutput)[0].elements,
        parties: JSON.parse(this.jsonOutput)[0].parties
      };
      this.publishResult="";
      console.log(sessionStorage.getItem("session_party_name"));
      console.log(JSON.stringify(jsonBody));
      this.isLoading = true;
      let url = `${sessionStorage.getItem("session_api_endpoint")}/share`;
      console.log(url);
      this.option.method = RequestMethod.Post;
      this.option.headers = new Headers();
      this.option.headers.set("Content-Type", "application/json");
      this.option.headers.set("x-ibm-client-id", sessionStorage.getItem("session_client_id"));
      this.option.headers.set("x-ibm-client-secret", sessionStorage.getItem("session_client_secret"));
      console.log(this.option);
      this.http.post(url, JSON.stringify(jsonBody), this.option)
        .toPromise()
        .then(res => res.json())
        .then(result => {
          this.publishResult = JSON.stringify(result);
          console.log(this.publishResult);
          this.isLoading=false;
        })
        .catch(error => {
          console.log(JSON.parse(error._body).body);
          if(error._body){
            if(JSON.parse(error._body).body){
              this.publishResult = JSON.parse(error._body).body.error;
            }
          }
          else{
            console.log(error);
          }
          this.isLoading = false;
        });
    }
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
                this.publishResult="";
                this.currentAgreementName="";
                this.currentElements="";
                this.currentParties=[];
                this.createEditor();
                this.filterListOfParties();
            }
        });

  }

  confirmPublish(){
    let disposable = this.dialogService.addDialog(ConfirmComponent, {
      title:'Publish agreement to all parties selected.', 
      message:`Would you like to publish current agreement "${this.currentAgreementName}"?`})
      .subscribe((isConfirmed)=>{
          if(isConfirmed) {
              this.publishAgreement();
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
    console.log(this.listOfPartiesFiltered);
  }
  
  fileChangeEvent(fileInput: any) {
    this.currentAgreementName = fileInput.agreementName || "";
    this.currentElements = fileInput.elements || [];
    this.currentParties = fileInput.parties || [];
    this.createEditor();
    this.filterListOfParties();
    //console.log(fileInput);
  } 
  

  togglePublishButton(){
    if((this.currentElements && this.currentElements.length>0) && (this.currentParties && this.currentParties.length>1)){
      document.getElementById("btnPublish").removeAttribute("disabled");
      //console.log("false");
    }
    else{
      document.getElementById("btnPublish").setAttribute("disabled", "true");
    }
      
  }

  getTreeViewPos(){
    this.treeviewTop=$("div.jsoneditor-tree").scrollTop();
    console.log(this.treeviewTop);
    this.treeviewLeft=$("div.jsoneditor-tree").scrollLeft();
  }

  checkElementExist(){
    if(this.currentElements){
      if(this.dataservice.checkElementExists(this.eleName, this.currentElements)){
        this.checkElementMsg="This element is already exist in Contract!!!";
        this.elementExist = true;
      }
      else{
        this.checkElementMsg="";
        this.elementExist = false;
      }
    }
  }
}
