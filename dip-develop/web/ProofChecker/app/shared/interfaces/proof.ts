import Party from './party';


interface Proof {
  date: string;
  time: string;
  party:Party[];
  agreementHash: string;
  proofJson: string;
}

export default Proof;
