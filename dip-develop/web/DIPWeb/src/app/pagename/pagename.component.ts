import { Component, OnInit, Input } from '@angular/core';
import { RouterModule,Router} from '@angular/router';

@Component({
  selector: 'app-pagename',
  templateUrl: './pagename.component.html',
  styleUrls: ['./pagename.component.css']
})
export class PagenameComponent implements OnInit {
  @Input() pageName: string;
  @Input() partyName: string;
  @Input() contractbuilder = "";
  @Input() negotiate =""
  @Input() golive = "";
  @Input() propose = "";
  @Input() export = "";
  @Input() alldoc = "";

  constructor(private router: Router) { }

  ngOnInit() {
    //this.check_client_id_null();
  }

  

  exit(){ 
    var r = confirm("Are you exit?");
    if (r == true) {
       sessionStorage.clear();
       console.clear();
       this.router.navigate(['/login']);      
    }     
  }
}
