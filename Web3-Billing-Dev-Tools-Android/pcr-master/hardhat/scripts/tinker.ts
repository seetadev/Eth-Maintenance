import { BytesLike, Contract, providers, Signer, utils, Wallet } from 'ethers';
import { readFileSync } from 'fs-extra';
import {
  ERC777__factory,
  PcrToken__factory,
} from '../typechain-types';
import { join } from 'path';
import * as hre from 'hardhat';
import { ethers } from 'hardhat';
import { Framework, SFError } from '@superfluid-finance/sdk-core';
import { abi_ERC20 } from '../reference/ERC20_ABI';
import { deployContract, initEnv } from '../helpers/utils';
const contract_path_relative = '../src/assets/contracts/';
const processDir = process.cwd();
const contract_path = join(processDir, contract_path_relative);
const contract_config = JSON.parse(
  readFileSync(join(processDir, 'contract.config.json'), 'utf-8')
) as { [key: string]: any };

const tinker = async () => {
  // ADDRESS TO MINT TO:

  const toDeployContract = contract_config['pcrToken'];

  if (toDeployContract == undefined) {
    console.error('Your contract is not yet configured');
    console.error(
      'Please add the configuration to /hardhat/contract.config.json'
    );
    return;
  }
  const provider = hre.ethers.provider;

  const [deployer, user1, user2, user3] = await initEnv(hre);

  let deployerNonce = await hre.ethers.provider.getTransactionCount(
    deployer.address
  );
    let tx;
    let tx1;
    let tx2;


  let user3Nonce = await hre.ethers.provider.getTransactionCount(
    user3.address
  );

  const metadata = JSON.parse(
    readFileSync(
      `${contract_path}/${toDeployContract.jsonName}_metadata.json`,
      'utf-8'
    )
  );

  let superToken = '0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f';
  const pcrContract = await PcrToken__factory.connect(
    metadata.address,
    deployer
  );

  console.log(await pcrContract.decimals());


  const sf = await Framework.create({
    networkName: 'local',
    provider: provider,
    customSubgraphQueriesEndpoint:
      'https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-mumbai',
    resolverAddress: '0x8C54C83FbDe3C59e59dd6E324531FB93d4F504d3',
  });

  // const indexOperation = sf.idaV1.createIndex({indexId:'0', superToken})
  // await indexOperation.exec(signer)

//  tx2 = await pcrContract.issue(user2.address, 1,{
//     nonce: deployerNonce++,
//   });
//   await tx2.wait();

//   tx2 = await pcrContract.issue(user3.address, 1,{
//     nonce: deployerNonce++,
//   });
//   await tx2.wait();


let index0 = await sf.idaV1.getIndex({
    superToken,
    indexId: '0',
    providerOrSigner: provider,
    publisher: metadata.address,
  });
  console.log(index0);



  console.log(await pcrContract.receiver());

  

  //await ERC777__factory.connect(superToken, deployer);

  // console.log(await (await daixContract.balanceOf(user3.address)).toString());

  // const txUser3 = await daixContract.send(user3.address, 1000, '0x', {
  //   nonce: deployerNonce++,
  // });
  // await txUser3.wait();

  //  tx2 = await daixContract.approve({amount:'200', receiver:metadata.address,overrides:{nonce:deployerNonce++}}) 
  // await tx2.exec(deployer)



 
  // console.log((await daixContract.balanceOf(user1.address)).toString());

  // console.log(await (await daixContract.balanceOf(user2.address)).toString());

  // let tx2 = await daixContract.transfer({amount:'100', receiver:metadata.address,overrides:{nonce:deployerNonce++}}) 
  // await tx2.exec(deployer)

  // const approveoperation = await sf.idaV1.approveSubscription({indexId:'0',superToken,publisher:metadata.address,overrides:{
  //    gasPrice:  utils.parseUnits('100', 'gwei'), 
  //       gasLimit: 1000000}})
  // tx = await approveoperation.exec(user2)
  // console.log(tx)

  // let pcrContractUser2 = await pcrContract.connect(user2);
  // tx = await pcrContractUser2.approveSubscription({nonce:deployerNonce++})
  // await tx.wait()




  // tx = await pcrContract.distribute(50,{nonce:deployerNonce++}) 
  // await tx.wait()



  index0 = await sf.idaV1.getIndex({
    superToken,
    indexId: '0',
    providerOrSigner: provider,
    publisher: metadata.address,
  });
  console.log(index0);


  // console.log((await daixContract.balanceOf(deployer.address)).toString());

  // console.log((await daixContract.balanceOf(user1.address)).toString());

  // console.log(await (await daixContract.balanceOf(user2.address)).toString());
  const daixContract =  await sf.loadSuperToken(superToken)
  const daixContract2 =  await ERC777__factory.connect(superToken, deployer);
  console.log((await daixContract2.balanceOf(deployer.address)).toString());

   tx2 = await daixContract.approve({amount:'50', receiver:metadata.address,overrides:{nonce:deployerNonce++}}) 
  await tx2.exec(deployer)


   let user3Txt = await daixContract2.send(metadata.address, 50, '0x', {
     from:deployer.address,
    nonce: deployerNonce++,
  });


 //await user3Txt.wait()

 console.log(167,await pcrContract.receiver());

// console.log((await daixContract.balanceOf(metadata.address)).toString());

// console.log(await (await daixContract.balanceOf(user3.address)).toString());

// console.log(await pcrContract.receiver());

// let operation = await sf.idaV1.approveSubscription({indexId:'0',superToken,userData:'0x', publisher:metadata.address})

// await operation.exec(user1)
// console.log('user1 approve sf')

// let pcrContractUser1 = await pcrContract.connect(user1);
// let tx = await pcrContractUser1.approveSubscription()
// await tx.wait()

// console.log('user1 approve')

//  tx = await pcrContractUser1.claim()
// await tx.wait()

// console.log('user1 done')


//  tx = await pcrContractUser2.approveSubscription()
//  await tx.wait()

console.log((await daixContract.realtimeBalanceOf( { account:user2.address,providerOrSigner:deployer})));


let subscription = await sf.idaV1.getSubscription({
  indexId:'0',
  superToken,publisher:metadata.address,subscriber:user2.address,providerOrSigner:provider})

  console.log(subscription)




// tx = await pcrContractUser2.claim()
// await tx.wait()

console.log((await daixContract.realtimeBalanceOf( { account:user2.address,providerOrSigner:deployer})));


subscription = await sf.idaV1.getSubscription({
  indexId:'0',
  superToken,publisher:metadata.address,subscriber:user2.address,providerOrSigner:provider})

  console.log(subscription)





};

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

tinker()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
