interface address {
    street: string,
    suite: string,
    city: string,
    zipcode: string,
    geo : {
        lat: number,
        lng: number
    }
}

interface company {
    name: string,
    catchPhrase: string,
    bs: string
}



interface DataStruct {
    id: number,
    name: string,
    username: string,
    email: string,
    address: address,
    phone: string,
    website: string,
    company: company
  }

export default DataStruct;