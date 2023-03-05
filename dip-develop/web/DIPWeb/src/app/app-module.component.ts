import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { GoliveComponent } from './golive/golive.component';
import { LoginComponent } from './login/login.component';
import { ContractBuilderComponent } from './contract-builder/contract-builder.component';
import { NegotiateComponent } from './negotiate/negotiate.component';
//import for propose
import { ProposeComponent } from './propose/propose.component';
import { ExportAgreementComponent} from './export-agreement/export-agreement.component';
import { AlldocuploadedComponent } from './alldocuploaded/alldocuploaded.component';
import { AuthGuard } from "./auth-guard.service";

const appRoutes: Routes = [
    {
        path: 'login',      
        component: LoginComponent
    },
    {
        canActivate: [AuthGuard],
        path: '',
        component: ContractBuilderComponent
    },   
    {
        canActivate: [AuthGuard],
        path: 'golive',   
        component: GoliveComponent
    },
    {
        canActivate: [AuthGuard],
        path: 'negotiate',
        component: NegotiateComponent
    },
    {
        canActivate: [AuthGuard],
        path: 'propose',
        component: ProposeComponent
    },
    {
        canActivate: [AuthGuard],
        path: 'export',
        component: ExportAgreementComponent
    },
    {
        canActivate: [AuthGuard],
        path: 'contractbuilder',
        component: ContractBuilderComponent
    },
    {
        canActivate: [AuthGuard],
        path: 'alldocuments',
        component: AlldocuploadedComponent
    },
    {
        canActivate: [AuthGuard],
        path: '**',      
        component: ContractBuilderComponent
    }
  ];


@NgModule({
    imports: [
        RouterModule.forRoot(appRoutes)
    ],
    exports: [RouterModule]
})

export class AppRoutingModule{}