import {Component, Input} from '@angular/core';

/**
 * @title Basic progress-spinner
 */
@Component({
    selector: 'spinner',
    templateUrl:'app/spinner/spinner.component.html' 
  })
  export default class SpinnerComponent {  
    @Input() show = false;
  }