import Proof from './interfaces/proof';
import Party from './interfaces/party';
import ProofService from './services/proof.service';
import MessageService from './services/message.service';




const SHARED_PROVIDERS: any[] = [
  ProofService,
  MessageService
];

export {
  Proof,
  Party,
  ProofService,
  MessageService,
  SHARED_PROVIDERS
};
