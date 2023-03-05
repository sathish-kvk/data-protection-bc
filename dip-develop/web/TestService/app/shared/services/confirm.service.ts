import {Injectable} from '@angular/core';

@Injectable()
export default class ConfirmService {
    activate: (message?: string, title?: string) => Promise<boolean>;
}