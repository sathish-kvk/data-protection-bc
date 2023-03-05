import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateChild } from "@angular/router";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { AuthService } from "./auth.component";

@Injectable()
export class AuthGuard implements CanActivate{
    constructor(private authService: AuthService, private router: Router){

    }
    canActivate(route: ActivatedRouteSnapshot, 
        state: RouterStateSnapshot):  Observable<boolean> | Promise<boolean> | boolean{
        
        if (this.authService.isAuthenticated()){
            return true;
        }else{
            this.router.navigate(['/login']);
        }        
    }

}