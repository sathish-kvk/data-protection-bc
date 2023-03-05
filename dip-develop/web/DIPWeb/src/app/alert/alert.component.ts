import { Component } from '@angular/core';
import { DialogComponent, DialogService } from "ng2-bootstrap-modal";
export interface AlertModel {
  title:string;
  message:string;
}
@Component({  
    selector: 'alertcomponent',
    template: `<div class="modal-dialog">
                <div class="modal-content">
                   <div class="modal-header">
                    <h4 class="modal-title">{{title || 'Alert'}}</h4>
                     <button type="button" class="close" (click)="close()" >&times;</button>
                     
                   </div>
                   <div class="modal-body">
                     <div>{{message}}</div>
                   </div>
                   <div class="modal-footer">
                     <button type="button" class="btn btn-dark btn-sm" (click)="close()" >OK</button>
                   </div>
                 </div>
              </div>`
})
export class AlertComponent extends DialogComponent<AlertModel, boolean> implements AlertModel {
  title: string;
  message: string;
  constructor(dialogService: DialogService) {
    super(dialogService);
  }
  confirm() {
    // we set dialog result as true on click on confirm button, 
    // then we can get dialog result from caller code 
    this.result = true;
    this.close();
  }
}