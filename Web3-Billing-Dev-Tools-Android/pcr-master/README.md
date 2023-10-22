# Perpetual Conditional Reward for Maintenance Services

We are using UMA's KPI options + Superfluid as a token streaming protocol that lets factory users and consumers create streams of tokens fluidly between addresses. This will enable effective incentivization, management and communication setup for service/repair organizations utilized in Operations and Maintenance. We are extending UMA’s KPI Options with Superfluid’s streaming tokens: Perpetual Conditional Rewards (PCR) tokens that combine Superfluid’s programmable cashflows with UMA’s KPI option concepts. Service Users and administrators would receive immediate benefits and feedback based on how that KPI was doing. Immediate feedback like this would be highly motivating.

## Major problems it solves

One of the most common problems of DAO's is achieving to have steady involvement of members.
PCR helps to solve this problem proposing a reward to be ditributed upon certain conditions (KPI's) periodically.

# Architecure
### Contracts
The three solidity contracts the PCR uses:
- PcrHost.sol. Contrat to create the Perpetual Conditional Reward. When creating a new reward, PcrHost will clone the implementations of the PcrOptimisticOracle.sol and the PcrToken.Sol. 

- PcrOptimisticOracle.sol. Implementation of the the UMA Optimistic Oracle.  


- PcrToken.Sol. Implementation of the Superfluid Intant Distribuition agreement, implements de ERC777 receiver (PcrOptimisticOracle.sol send tokens) to launch the distribution. 


### Subgraph
One subgraph is created with data source the "createRewardEvent" in the PCRHost.sol contract.
This subgrap uses the templates for listening to events of the cloned contracts PcrOptimisticOracle.sol and PcrToken.Sol.


### Fronted

The major building blocks in the PCR Angualr Dapp are: Pages/Services and Shared Components

#### Pages:
The frontend has been built with Angular and has 5 main pages.

- Landing Page.

- Home Page. Once the wallet is connected, here we will see the list of PCR Created and PCR Memberships (if any)


- Upcoming page.the next upcoming actions in rewards 
  
- Create PRC Page. Settings for the PCR creation

- Details PCR(only visible for the PCR creator): Details of the PCR (major properties/charts/balances) and available actions (fund/propose/execute, etc.) 

- Details PCR Membership(only visible for members). Details of the awarded membership (major properties/charts/balances) and available actions (claim/approve/propose/execute, etc.) 

#### Services

- Dapp Injector Service. Service providing the blockchain wiring, spinning rpc provider, conencting with wallet (metamask or local), instantiate the pcrhost contract and keep track of the clone implementations of PCrToken and PcrOptiisticOracle 

- GraphqlService: Provides "The Graph" data through the subgraph deployed on Kovan. 

- SuperFluid Service: Providing an instante of the Framework Object through the sdk-core for querying/approve or claim subscriptions

#### Shared Component (main ones) 

- Proposal Detail Component: Proposal flow component, 

- Charts 
  
- Upcoming Rewards 

- User Balance 

## Tech Stack
- Smartcontracts in Solidity
- Development environent and fork with Hardhat
- The graph for queryng data (subgraph created)
- Frontend in Angular Framework



# TestNet Development (KOVAN)




# 🏄‍♂️ Local Development

## Kovan Fork

Create a copy of /hardhat/.sample.env and input the deployer key and the kovan_url, the deployer key will only required for deployments on kovan, not to the fork.
Please add in app-module:
- defaulNetwork: 'kovan', 
- DappInjectorModule.forRoot({wallet:'wallet', defaultNetwork:network})


Open the first terminal
```javascript
npm run fork
// spin blockchain fork of kovan
```
Open the Second Terminal
```javascript
npm run deploy
// launch, compile, and deploy in watch mode. To deploy on Polygon Testnet, run

```

```javascript
npm run run-graph-node
// spin with docker compose a graph local node
```
Once the graph node is running.
Open the Third Terminal

```javascript
npm run create-graph-local
// create the subgraph locally
```

```javascript
npm run build-graph
// buld the subgraph 
```
```javascript
npm run deploy-graph-local
// ensure in the subgraph.yml file the address of the contract os the one you just deployed and the network in datasource contract and templates is "localhost" not kovan
```

```javascript
ng serve -o
// build the angular dapp and serve on localhost:4200., 

```

