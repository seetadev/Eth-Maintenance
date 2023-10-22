# Cross chain borrowing and lending platform using Compound III protocol 

We can supply collateral and borrow tokens for preventive, reactive and pro-active maintenance from a satellite chain to a fork of Ethereum's mainnet using Compound Protocol. Web3 DeFi dashboard to enable third party service and repair organizations to keep track of all the details of their assets, DeFi investments, transactions across all multiple chains and also displays DAO data using a data visualization chart. We are building our solution on top of an existing web3 dashboard system and are planning to integrate an analytics, tabulation and collaboration tool namely EtherCalc.  We are extending the Compound III protocol workshop example and integrating a DefI analytics engine.

## Install

Install Node.js at https://nodejs.org/

```
git clone repo
cd repo
npm install
```

## Run

Set your Metamask to Localhost network. Select your first developer mnemonic account. Navigate to http://127.0.0.1:3008/ in a web browser. The dApp files are in the `public/` folder.

```bash
## Get your own JSON RPC URLs for free at alchemy.com

MAINNET_PROVIDER_URL="_your_rpc_url_here_" npm start mainnet

## or

BASE_PROVIDER_URL="_your_rpc_url_here_" npm start base
```
