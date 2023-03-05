
import { Component, OnInit, AfterViewInit, AfterContentChecked, } from '@angular/core';
import { Router, RouteParams } from '@angular/router-deprecated';
import { UploadFileComponent} from "../upload-file/uploadfile";
import { Http, Response, RequestOptions, RequestMethod, Headers } from '@angular/http';
import 'rxjs/add/operator/toPromise';
//import * from 'semantic';
import {ConfirmService} from "../shared/shared";
import {ConfirmComponent} from "../confirm/confirm";


import  {
  //ProofService,
  MessageService, DataService, DataStruct
} from '../shared/shared';


declare var $: any;
declare var componentHandler:any;

@Component({
  selector: 'test-service',
  directives:[UploadFileComponent, ConfirmComponent],
  providers:[ConfirmService],
  templateUrl: 'app/test-service/test-service.component.html',
  styleUrls: ['app/shared/assets/css/check-hash.component.css']
})

export default class TestServiceComponent implements OnInit, AfterContentChecked {
  folder: string = '';
  data: any;
  message: string;
  innovator: string = '';
  inputSource: string;
  outputSource: String = '';
  jsFileName: string = '';
  actionConfigJson : string ='';
  actionJs: string='';
  actionName: string = '';
  publishTo: string = '';
  innovationName: string='';
  combiPartiesRoles: [string];
  dataStruct: DataStruct;

  spaceList: any;
  updated: boolean = false;
  listOfTestParties = [];
  

  respondJson: any;
  filePath: string;
  private dataService;
  options: RequestOptions = new RequestOptions({method: RequestMethod.Post});
 
  title = "Notification";
  selectedPartyTestAction;

  

  constructor(
    private router: Router,
    private routeParams: RouteParams,
    //private proofService: ProofService,
    private messageService: MessageService,
    private myhttp: Http,
    private confirmService:ConfirmService
  ) {
    
  }
  /*
  getData(): void {
    //this.proofService.getData().then(res => this.data = res);
    //this.proofService.getFakeDataApi().then(res => this.fakeApiData = res);
  }
  */


  ngOnInit(): void {
    if(this.routeParams.get("innovator")){
      this.innovator = this.routeParams.get("innovator");
      if(this.routeParams.get("folder")){
        this.folder = this.routeParams.get("folder");
        this.jsFileName = this.routeParams.get("action"); 
        this.dataService = new DataService('https://jsonplaceholder.typicode.com/posts', this.myhttp);
        this.data = this.dataService.dataStore;
        //this.dataService = new DataService(`https://openwhisk.eu-gb.bluemix.net/api/v1/namespaces/${this.inputPath}/actions/common-ow/${this.inputAction}?blocking=true&result=true`, this.myhttp);
        //this.dataService = new DataService(`https://openwhisk.eu-gb.bluemix.net/api/v1/namespaces/_/actions/common-ow/exportAgreement?blocking=true&result=true`, this.myhttp);
        //this.data = this.dataService.dataStore;
        this.dataService.getJsRespond(`./app/shared/data/innovator/${this.innovator}/services/${this.folder}/${this.jsFileName}.js`);
        this.dataService.getServiceRespond(`./app/shared/data/innovator/${this.innovator}/services/${this.folder}/actionconfig.json`);
      }
      //console.log(`https://openwhisk.eu-gb.bluemix.net/api/v1/namespaces/${this.inputPath}/common-ow/${this.inputAction}?blocking=true&result=true`);
    }
    else {
      this.innovator = "";
      this.folder ="";
      this.jsFileName="";
      this.dataService = new DataService('https://jsonplaceholder.typicode.com/posts', this.myhttp);
      this.data = this.dataService.dataStore;
      console.log("no action");
      componentHandler.upgradeDom();
      this.dataService.getJsRespond(`./app/shared/data/action.js`);
      this.dataService.getServiceRespond('./app/shared/data/actionconfig.json');
    }
    
    this.dataService.dataFeed.subscribe(newData => {
      this.data.push(newData);
    });
    
    this.dataService.getAuthorization();
    //this.getAuthorization();
  }

  

  getResponde(): any {
    console.log(this.selectedPartyTestAction);
    let currentActionName =  this.actionName;
    this.dataService.testActionInParty(this.selectedPartyTestAction, this.inputSource, currentActionName);
    this.data = this.dataService.dataStore;
    this.outputSource = JSON.stringify(this.data, null, " ");
    //console.log(JSON.stringify(`https://openwhisk.eu-gb.bluemix.net/api/v1/namespaces/_/actions/common-ow/${this.actionName}?blocking=true&result=true`));
    //console.log();
  }

  updateInput(fileInput: any){
    this.dataService.actionResponse ="";
    this.inputSource = fileInput;
    
  }

  requestJsonEdited(){
    if(this.dataService.actionResponse!=""){
      this.dataService.actionResponse="";
    }
  }

  ngAfterContentChecked(){
    this.actionName = this.routeParams.get("actionname") || this.dataService.configJson.name;
    this.innovationName = this.dataService.configJson.innovator;
    this.publishTo = this.dataService.publishTo;
    //console.log(this.actionName);
    this.actionConfigJson = JSON.stringify(this.dataService.configJson, null, "   ");
    this.actionJs = this.dataService.actionJs;
    //this.selectedPartyTestAction = $('.partyInTest').selected;
    $('#role-selector').multiselect({buttonWidth: '250px'});
    $('#party-selector').multiselect({buttonWidth: '250px'});
    //console.log("option ready: " + $('#party-selector').length);
    this.parseParties();
    this.toggleSelectors();
    this.togglePublishButton();
    //this.spaceList = this.dataService.spacesStore;
    
    if(this.dataService.spacesStore.length>0 && !this.updated){
      this.listOfTestParties = [];
      for(let i =0; i<this.dataService.spacesStore.length; i++){
        if(this.dataService.spacesStore[i].partyName.search(/test/i)==0){
          this.listOfTestParties.push({label: this.dataService.spacesStore[i].partyName, title: this.dataService.spacesStore[i].partyRole, value: this.dataService.spacesStore[i].partyName.toString().toLowerCase()});
        }
      }
      $('#role-selector').multiselect({
        enableCaseInsensitiveFiltering: true
    });
      //convert to lower case for comparision
      let tempPublishTo = this.dataService.configJson.publishTo.map(element => {return element.toLowerCase()});
      
      $('#party-selector').multiselect('dataprovider', this.listOfTestParties);
      $('#role-selector').multiselect('select', tempPublishTo);
      $('#party-selector').multiselect('select', tempPublishTo);
      this.updated=true;
      this.togglePublishButton();
      
    }
    
    
  }

  ngAfterViewInit(){
    
    //this.spaceList = this.dataService.spacesFeed;
    
    
  }

  toggleSelectors(): void{
    if($('#allParties').is(":checked")){
      $('#role-selector').multiselect('deselectAll', false);
      $('#party-selector').multiselect('deselectAll', false);
      $('#role-selector').multiselect('updateButtonText');
      $('#party-selector').multiselect('updateButtonText');
      $('#role-selector').multiselect('disable');
      $('#party-selector').multiselect('disable');
    }
    else{
      $('#role-selector').multiselect('enable');
      $('#party-selector').multiselect('enable');
    }
  }

  parseParties(): void{
    this.combiPartiesRoles=this.dataService.configJson.publishTo;
    //console.log(this.combiPartiesRoles);
  }

  togglePublishButton(){
    if(!$('#allParties').is(":checked") && $('.multiselect.dropdown-toggle.btn.btn-dark.btn-sm').text()=='None selected None selected '){
      $('#btnPublish').prop('disabled', true);
    }
    else{
      $('#btnPublish').prop('disabled', false);
    }
    //console.log($('.multiselect.dropdown-toggle.btn.btn-dark.btn-sm').text());
    //console.log($('#party-selector').text());
  }

  publishToSpace(){
    //console.log($('#party-selector').val());
    this.clearResultPublish();
    let spaces = [];
    let spaceTemp: string[];
    if(!$('#allParties').is(":checked")){
      /*
      spaceTemp = $('.multiselect.dropdown-toggle.btn.btn-dark.btn-sm').text().replace("None selected", "").split(",");
      spaceTemp.forEach(tmp => {
        spaces.push(tmp.trim());
      });
      */
      let tempListOfRoles = [];
      $('#role-selector option:selected').map(function(a, item){return tempListOfRoles.push(item.value);});
      
      spaces = this.listOfTestParties.filter((element, index, array) => {
        return tempListOfRoles.toString().toLowerCase().indexOf(element.title.toLowerCase()) !== -1;
      });
      spaces = spaces.map(party => {return party.value});
      console.log(spaces);
      $('#party-selector option:selected').map(function(a, item){
        if(spaces.indexOf(item.value) == -1){
          spaces.push(item.value);
        }
      })
    }
    else{
      
      spaces = this.listOfTestParties.map(party => {
        return party.value;
      });
      
    }
    //console.log(spaces);
    
    //console.log(spaces);
    //console.log($('#party-selector option:selected').map(function(a, item){return item.value;}));
    //console.log($('#party-selector option:selected').map(function(a, item){return item.value;}).length);
    //spaces.push("DXCV");
    //if(confirm(`Action "${this.actionName}" will be published to "${spaces}"\nAre you sure?`)){
    this.confirmService.activate(`Action "${this.actionName}" will be published to "${spaces.toString().replace(/,/g, ', ')}"`)
      .then(res => {
        if(res){
          this.dataService.publishAction(spaces, this.actionName);
        }
      });
    
    
  }

  clearResultPublish(): void {
    /*
    let tempArr: string[]=[];
    this.dataService.resCreateAct.forEach((result, i) => {
      if (i != index){
        tempArr.push(result);
      }
    });
    console.log("index" + index);
    this.dataService.resCreateAct = tempArr;
    console.log(this.dataService.resCreateAct.length);
    console.log(tempArr.toString())
    */
    //e.preventDefault();
    this.dataService.resCreateAct = [];

  }

  showConfirmDialog() {
   
  }



}
