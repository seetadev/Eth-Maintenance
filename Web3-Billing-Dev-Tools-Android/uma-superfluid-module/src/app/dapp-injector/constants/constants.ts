// MY INFURA_ID, SWAP IN YOURS FROM https://infura.io/dashboard/ethereum
export const INFURA_ID = "460f40a260564ac4a4f4b3fffb032dad";

// MY ETHERSCAN_ID, SWAP IN YOURS FROM https://etherscan.io/myapikey
export const ETHERSCAN_KEY = "DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW";

export const GRAPH_APIURL = "https://api.thegraph.com/subgraphs/name/donoso-eth/perpetual-conditional-reward"

export const ALCHEMY_KEY = "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF";

export type NETWORK_TYPE = 'hardhat' |'localhost' | 'mainnet'| 'mumbai' | 'kovan' | 'rinkeby' | 'ropsten' | 'goerli' |'polygon' | 'xdai' |'noop';


export const address_0 = '0x0000000000000000000000000000000000000000';

export interface INETWORK {
name: NETWORK_TYPE;
color?: string;
price?:number;
gasPrice?:number;
chainId: number;
rpcUrl: string;
blockExplorer?: string;
faucet?:string
}

export const noNetwork:INETWORK =   {
  name:'noop',
  chainId:0,
  rpcUrl:'noop'
}

export const NETWORKS:{[key:string]: INETWORK} = {
  localhost: {
    name: "localhost",
    color: "#666666",
    chainId: 1337,
    blockExplorer: "",
    rpcUrl: "http://" + (window ? window.location.hostname : "localhost") + ":8545",
  },
  kovan: {
    name: "kovan",
    color: "#7003DD",
    chainId: 42,
    rpcUrl: `https://kovan.infura.io/v3/${INFURA_ID}`,
    blockExplorer: "https://kovan.etherscan.io/",
    faucet: "https://gitter.im/kovan-testnet/faucet", // https://faucet.kovan.network/
  },
  mumbai: {
    name: "mumbai",
    color: "#92D9FA",
    chainId: 80001,
    price: 1,
    gasPrice: 1000000000,
    rpcUrl: "https://rpc-mumbai.maticvigil.com",
    faucet: "https://faucet.polygon.technology/",
    blockExplorer: "https://mumbai.polygonscan.com/",
  },

};

export const netWorkByName = (chainName:NETWORK_TYPE) => {
  return NETWORKS[chainName]
};


export const netWorkById = (chainId:number) => {
  for (const n in NETWORKS) {
    if (NETWORKS[n].chainId === chainId) {
      return NETWORKS[n];
    }
  }
  return noNetwork
};

export const global_address = {
  localhost: {
    host: '0xF0d7d1D47109bA426B9D8A3Cde1941327af1eea3',
    cfa: '0xECa8056809e7e8db04A8fF6e4E82cD889a46FE2F',
    ida: '0x556ba0b3296027Dd7BCEb603aE53dEc3Ac283d2b',
    fDaix: '0xe3cb950cb164a31c66e32c320a800d477019dcff',
    fDai: '0xb64845d53a373d35160b72492818f0d2f51292c0',
    resolver:"0x851d3dd9dc97c1df1DA73467449B3893fc76D85B",
    subgraph:"https://thegraph.com/hosted-service/subgraph/superfluid-finance/protocol-v1-kovan",
    sfNetwork:"local",
    graphUrl:"http://localhost:8020/",
    finder:"0xeD0169a88d267063184b0853BaAAAe66c3c154B2",
    graphUri:"http://localhost:8000/subgraphs/name/donoso-eth/perpetual-conditional-reward"
  },
  kovan: {
    host: '0xF0d7d1D47109bA426B9D8A3Cde1941327af1eea3',
    cfa: '0xECa8056809e7e8db04A8fF6e4E82cD889a46FE2F',
    ida: '0x556ba0b3296027Dd7BCEb603aE53dEc3Ac283d2b',
    fDaix: '0xe3cb950cb164a31c66e32c320a800d477019dcff',
    fDai: '0xb64845d53a373d35160b72492818f0d2f51292c0',
    resolver:"0x851d3dd9dc97c1df1DA73467449B3893fc76D85B",
    finder:"0xeD0169a88d267063184b0853BaAAAe66c3c154B2",
    subgraph:"https://thegraph.com/hosted-service/subgraph/superfluid-finance/protocol-v1-kovan",
    sfNetwork:"kovan",
    graphUri:"https://api.thegraph.com/subgraphs/name/donoso-eth/perpetual-conditional-reward"
  },
  // mumbai: {
  //   host: '0xEB796bdb90fFA0f28255275e16936D25d3418603',
  //   cfa: '0x49e565Ed1bdc17F3d220f72DF0857C26FA83F873',
  //   ida: '0x804348D4960a61f2d5F9ce9103027A3E849E09b8',
  //   fDaix: '0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f',
  //   fDai: '0x15F0Ca26781C3852f8166eD2ebce5D18265cceb7',
  //   resolver:"0x8C54C83FbDe3C59e59dd6E324531FB93d4F504d3",
  //   finder:"0xb22033fF04AD01fbE8d78ef4622a20626834271B",
  //   sfNetwork:"mumbai",
  //   subgraph:"https://thegraph.com/hosted-service/subgraph/superfluid-finance/protocol-v1-mumbai"
  // },
};


export const target_conditions  = [
  { name: 'Greater Than', code: 'GT', id: 0 },
  { name: 'Greater Than Equal', code: 'GTE', id: 1 },
  { name: 'Equal', code: 'E', id: 2 },
  { name: 'Less Than Equal', code: 'LTE', id: 3 },
  { name: 'Less Than', code: 'LT', id: 4 },
];

export const global_tokens = [
  { name: 'DAI', id: 0, image: 'dai', rewardToken:global_address.kovan.fDai, superToken:global_address.kovan.fDaix },
 // { name: 'DAIx', id: 1, image: 'dai', rewardToken:global_address.kovan.fDaix,superToken:global_address.kovan.fDaix  },
  // { name: 'USDCx', id: 2, image: 'usdc' },
  // { name: 'USDC', id: 3, image: 'usdc' },
];
