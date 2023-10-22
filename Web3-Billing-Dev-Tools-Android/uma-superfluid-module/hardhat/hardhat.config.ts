import * as dotenv from 'dotenv';

import { HardhatUserConfig, task } from 'hardhat/config';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import * as glob from 'glob';
import { resolve } from 'path';

const INFURA_ID = 'YOUR KEY'; //process.env["INFURA_ID"]
const MORALIS_ID = 'YOUR KEY'; //process.env["MORALIS_ID"]
const ALCHEMY_ID_MUMBAI = 'YOUR KEY'; //process.env["ALCHEMY_ID_MUMBAI"]

dotenv.config();

//// import task files when types have already been created
if (existsSync('./typechain-types')) {
  glob.sync('./tasks/**/*.ts').forEach(function (file: any) {
    require(resolve(file));
  });
}


// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const mainnetGwei = 21;


const defaultNetwork = 'localhost'

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.12',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  defaultNetwork,

  networks: {
    hardhat: {
      forking: {
        //your rpc url here, in this case for Mumbai 31301672
        url: process.env.KOVAN_URL || "",
        blockNumber: 31600633,
      },
    },
    localhost: {
      url: 'http://localhost:8545',
      chainId: 31337,
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${INFURA_ID}`, // <---- YOUR INFURA ID! (or it won't work)
      // `https://speedy-nodes-nyc.moralis.io/${MORALIS_ID}/eth/rinkeby`
      accounts:
        process.env['DEPLOYER_KEY'] !== undefined
          ? [process.env['DEPLOYER_KEY']]
          : [],
      // accounts: {
      //   mnemonic: mnemonic(),
      // },
    },
    kovan: {
      url: process.env.KOVAN_URL || "", // <---- YOUR INFURA ID! (or it won't work)
      // `https://speedy-nodes-nyc.moralis.io/${MORALIS_ID}/eth/kovan`
      gasPrice: 9* 1000000000,
      accounts:
        process.env['DEPLOYER_KEY'] !== undefined
          ? [process.env['DEPLOYER_KEY']]
          : [],
      // accounts: {
      //   mnemonic: mnemonic(),
      // },
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${INFURA_ID}`, // <---- YOUR INFURA ID! (or it won't work)
      //`https://speedy-nodes-nyc.moralis.io/${MORALIS_ID}/eth/mainnet`

      gasPrice: mainnetGwei * 1000000000,
          accounts:
        process.env['DEPLOYER_KEY'] !== undefined
          ? [process.env['DEPLOYER_KEY']]
          : [],
    },
    ropsten: {
      url: process.env.KOVAN_URL || "",// <---- YOUR INFURA ID! (or it won't work)
      // `https://speedy-nodes-nyc.moralis.io/${MORALIS_ID}/eth/ropsten`
          accounts:
        process.env['DEPLOYER_KEY'] !== undefined
          ? [process.env['DEPLOYER_KEY']]
          : [],
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${INFURA_ID}`, // <---- YOUR INFURA ID! (or it won't work)
      // `https://speedy-nodes-nyc.moralis.io/${MORALIS_ID}/eth/goerli`
          accounts:
        process.env['DEPLOYER_KEY'] !== undefined
          ? [process.env['DEPLOYER_KEY']]
          : [],
    },
    xdai: {
      url: 'https://rpc.xdaichain.com/',
      gasPrice: 1000000000,
          accounts:
        process.env['DEPLOYER_KEY'] !== undefined
          ? [process.env['DEPLOYER_KEY']]
          : [],
    },
    polygon: {
      url: 'https://speedy-nodes-nyc.moralis.io/XXXXXXXXXXXXXXXXXXXx/polygon/mainnet', // <---- YOUR MORALIS ID! (not limited to infura)
      //https://polygon-rpc.com
      gasPrice: 1000000000,
          accounts:
        process.env['DEPLOYER_KEY'] !== undefined
          ? [process.env['DEPLOYER_KEY']]
          : [],
    },
    mumbai: {
      url: `https://speedy-nodes-nyc.moralis.io/${MORALIS_ID}/polygon/mumbai`, // <---- YOUR MORALIS ID! (not limited to infura)
      // `https://polygon-mumbai.g.alchemy.com/v2/${ALCHEMY_ID_MUMBAI}`
      gasPrice: 1000000000,
          accounts:
        process.env['DEPLOYER_KEY'] !== undefined
          ? [process.env['DEPLOYER_KEY']]
          : [],
    },

    matic: {
      url: 'https://rpc-mainnet.maticvigil.com/',
      gasPrice: 1000000000,
          accounts:
        process.env['DEPLOYER_KEY'] !== undefined
          ? [process.env['DEPLOYER_KEY']]
          : [],
    },
    // ropsten: {
    //   url: process.env["ROPSTEN_URL"] || "",
    //   accounts: process.env["DEPLOYER_KEY"] !== undefined ? [process.env["DEPLOYER_KEY"]] : [],
    // },
  },
  gasReporter: {
    enabled: process.env['REPORT_GAS'] !== undefined,
    currency: 'USD',
  },
  etherscan: {
    apiKey: process.env['ETHERSCAN_API_KEY'],
  },
};

export default config;
