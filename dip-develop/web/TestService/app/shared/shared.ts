//import Proof from './interfaces/proof';
import DataStruct from './interfaces/dataStruct';

//import ProofService from './services/proof.service';
import MessageService from './services/message.service';
import DataService from './services/data.service';
import ConfirmService from './services/confirm.service';




const SHARED_PROVIDERS: any[] = [
  //ProofService,
  MessageService,
  DataService,
  ConfirmService
];

export {
  //Proof,
  DataStruct,
  DataService,
  ConfirmService,
  MessageService,
  SHARED_PROVIDERS
};
