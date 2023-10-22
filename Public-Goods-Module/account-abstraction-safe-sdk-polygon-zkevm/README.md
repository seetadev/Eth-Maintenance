# ZK Incident Witness Generation tool for Eth-Maintenance using Safe Account Abstraction SDK and Polygon zkEVM

We are developing ZK Incident Witness Generation tool for machinery maintenance using Safe Account Abstraction SDK and Polygon zkEVM. Account Abstraction SDK enables customization of verification logic via plugins with a rule/logic setting, tabulation, organization, visualization tool namely SocialCalc spreadsheet dapp on Polygon zkEVM. This allows users to set up rules which their account has to abide by when executing transactions while being able to reconfigure them in the future. The process improves account security by restricting permissions certain keys have while remaining adaptable to the user's changing needs.
Implementation areas of Account Abstraction plugins:

Enforcing a spending limit for vital machine assets based on the key used for the transaction.

Restricting interaction with a certain citizen wallet or DAO dApp to a specific key.

Defining session keys, which are allowed to initiate service or repair transactions for only a limited period of time.

[The Safe{Core} SDK](https://github.com/safe-global/safe-core-sdk) allows builders to add account abstraction functionality into their apps. 

See the [Safe{Core} Account Abstraction SDK Docs](https://docs.safe.global/learn/safe-core-account-abstraction-sdk) for more details.

## Installation

To run this project locally:

Install deps:

```bash
yarn install
```

Create a `.env` file (see `example.env`)

```
# see https://web3auth.io/docs/developer-dashboard/get-client-id
REACT_APP_WEB3AUTH_CLIENT_ID=

REACT_APP_STRIPE_BACKEND_BASE_URL=https://aa-stripe.safe.global

REACT_APP_STRIPE_PUBLIC_KEY=pk_test_51MZbmZKSn9ArdBimSyl5i8DqfcnlhyhJHD8bF2wKrGkpvNWyPvBAYtE211oHda0X3Ea1n4e9J9nh2JkpC7Sxm5a200Ug9ijfoO

```

Run the demo App:

```bash
yarn start
```
