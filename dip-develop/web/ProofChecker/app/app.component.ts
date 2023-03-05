import { Component } from '@angular/core';
import { SHARED_PROVIDERS } from './shared/shared';
import { HTTP_PROVIDERS } from '@angular/http';
import { ROUTER_PROVIDERS, RouteConfig, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { CheckHashComponent } from './check-hash/checkhash';
import { CheckInputComponent } from './check-input/checkinput';


@Component({
  selector: 'proofcheck-app',
  directives: [ROUTER_DIRECTIVES],
  providers: [SHARED_PROVIDERS, HTTP_PROVIDERS, ROUTER_PROVIDERS],
  
  template: '<router-outlet></router-outlet>',
  styleUrls: ['app/app.component.css']
})


@RouteConfig([
  { path: '',               name: 'Home',                 redirectTo: ['CheckHashComponent'] },
  { path: 'checkhash',      name: 'CheckHashComponent',   component: CheckHashComponent, useAsDefault: true },
  { path: 'checkinput',     name: 'CheckInputComponent',  component: CheckInputComponent }
])

export default class AppComponent {}
