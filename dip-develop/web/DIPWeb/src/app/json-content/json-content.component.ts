import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-json-content',
  templateUrl: './json-content.component.html',
  styleUrls: ['./json-content.component.css']
})
export class JsonContentComponent implements OnInit {
  @Input() data;
  listContents=[];

  constructor() { 
    
  }

  ngOnInit() {
    //console.log(this.data);
    let currentItem=[];
    if(this.data && this.data.length>0){
      for(let i = 0; i < Object.keys(this.data[0]).length; i++){
        currentItem.push(Object.keys(this.data[0])[i]);
      }
      this.listContents.push(currentItem);
      currentItem=[];
      this.data.forEach(ele => {
        for(let i = 0; i < Object.keys(ele).length; i++){
          currentItem.push(ele[Object.keys(ele)[i]]);
        }
        this.listContents.push(currentItem);
        currentItem=[];
      })

      //console.log(this.listContents)
    }
  }

}
