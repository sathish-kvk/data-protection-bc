import { Component } from '@angular/core';
import { SHARED_PROVIDERS } from './shared/shared';
import { HTTP_PROVIDERS } from '@angular/http';
import { ROUTER_PROVIDERS, RouteConfig, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import {TestServiceComponent} from './test-service/testservice';
//import {ConfirmationPopoverModule} from 'angular-confirmation-popover';
//import {CONFIRM_PROVIDERS}  from './confirm/confirm';




@Component({
  selector: 'proofcheck-app',
  directives: [ROUTER_DIRECTIVES],
  providers: [SHARED_PROVIDERS, HTTP_PROVIDERS, ROUTER_PROVIDERS],
  //mod
  template: '<div  style="background-color:rgb(245, 245, 245)"><router-outlet></router-outlet></div>',
  styleUrls: ['app/app.component.css']
})

@RouteConfig([
  { path: '',               name: 'Home',      component: TestServiceComponent},
  { path: '/:companyName/:pathName/:actionName',               name: 'Home',      component: TestServiceComponent}

])


export default class AppComponent {}
