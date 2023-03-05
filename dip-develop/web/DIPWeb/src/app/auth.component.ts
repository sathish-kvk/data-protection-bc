export class AuthService{
    loggedIn = false;

    isAuthenticated(): boolean{
        let authorized = false;
        if(!sessionStorage.getItem("session_party_name"))
        {         
            document.title = `DIP`;
            authorized = false;              
        }
        else{
            document.title = `DIP - ${sessionStorage.getItem('session_party_name')}`;
            authorized = true;
        } 
        return authorized;
    }

}