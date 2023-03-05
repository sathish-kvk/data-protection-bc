import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Router } from '@angular/router';
import { AppComponent } from './app.component';
//import for GoLive
import { GoliveComponent } from './golive/golive.component';
//import { HighlightDirective } from './highlight.directive';

//import for ContractBuilder
import { LoginComponent } from './login/login.component';
import { ContractBuilderComponent } from './contract-builder/contract-builder.component';
import { BootstrapModalModule } from 'ng2-bootstrap-modal';
import { ConfirmComponent } from './confirm/confirm.component';
import { AlertComponent } from './alert/alert.component';
import {UploadFileComponent} from './upload-file/upload-file.component';
import { UploadFileChildComponent} from './upload-file/upload-file-child.component';
//import for Negotiate
import { NegotiateComponent } from './negotiate/negotiate.component';
//import for propose
import { ProposeComponent } from './propose/propose.component';
import { PagenameComponent } from './pagename/pagename.component';
import { ExportAgreementComponent} from './export-agreement/export-agreement.component';
import { UploadBase64Component } from './upload-base64/upload-base64.component';
import { ElementDownloadDocComponent } from './element-download-doc/element-download-doc.component';
import { AlldocuploadedComponent } from './alldocuploaded/alldocuploaded.component';
import { JsonContentComponent } from './json-content/json-content.component';
import { AppRoutingModule } from './app-module.component';
import { AuthGuard} from './auth-guard.service';
import {AuthService} from './auth.component';


@NgModule({
  declarations: [
    AppComponent,
    GoliveComponent,
    LoginComponent,
    ContractBuilderComponent,
    ConfirmComponent,
    AlertComponent,
    UploadFileComponent,
    NegotiateComponent,
    ProposeComponent,
    PagenameComponent,
    ExportAgreementComponent,
    UploadBase64Component,
    ElementDownloadDocComponent,
    AlldocuploadedComponent,
    JsonContentComponent,
    UploadFileChildComponent
    ],
  imports: [
    BrowserModule,
    FormsModule,
    BootstrapModalModule.forRoot({container:document.body}),
    HttpModule,
    AppRoutingModule
  ],
  entryComponents: [
    ConfirmComponent,
    AlertComponent
  ],
  providers: [AuthService, AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
