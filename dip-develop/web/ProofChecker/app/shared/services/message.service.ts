import { Injectable } from '@angular/core';

@Injectable()
export default class MessageService {
  message: string;

  add(message: string) {
    this.message = message;
    //alert(this.message);
  }

  clear() {
    this.message = '';
  }

}
