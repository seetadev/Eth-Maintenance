import { BytesLike, Contract, providers, Signer, utils, Wallet } from 'ethers';
import { readFileSync } from 'fs-extra';
import {
  ERC777__factory,
  PcrHost,
  PcrHost__factory,
  PcrOptimisticOracle__factory,
  PcrToken__factory,
} from '../typechain-types';
import { join } from 'path';
import * as hre from 'hardhat';
import { ethers } from 'hardhat';
import { Framework, SFError } from '@superfluid-finance/sdk-core';
import { abi_ERC20 } from '../reference/ERC20_ABI';
import {
  deployContract,
  getChainAddresses,
  getContractAddress,
  initEnv,
  waitForTx,
} from '../helpers/utils';
import {
  IDAINPUTStruct,
  OPTIMISTICORACLEINPUTStruct,
  PCRHOSTCONFIGINPUTStruct
} from '../typechain-types/PcrHost';

const defaultNetwork = 'kovan';

const clone = async () => {
  // ADDRESS TO MINT TO:
  const chain_addresses = getChainAddresses(defaultNetwork);

  const [deployer, user1, user2, user3] = await initEnv(hre);
  let deployerNonce = await hre.ethers.provider.getTransactionCount(
    deployer.address
  );
  let tx;
  let tx1;
  let tx2;

  let user3Nonce = await hre.ethers.provider.getTransactionCount(user3.address);

  const provider = hre.ethers.provider;

  const { PcrHost, PcrToken, PcrOptimisticOracle } = await getContractAddress();

  const pcrHost = await PcrHost__factory.connect(PcrHost, deployer);

  const pcrHostConfig:PCRHOSTCONFIGINPUTStruct = {
    pcrTokenImpl:PcrToken,
    pcrOptimisticOracleImpl:PcrOptimisticOracle,
    title:'Mu reard',
    url:'http://aloha.com'

  }


  const Ida: IDAINPUTStruct = {
    host: chain_addresses.host,
    ida: chain_addresses.ida,
    rewardToken: chain_addresses.fDaix,
  };

  const priceIdentifier =
    hre.ethers.utils.formatBytes32String('YES_OR_NO_QUERY');

  const customAncillaryData = hre.ethers.utils.hexlify(
    hre.ethers.utils.toUtf8Bytes(
      'q: title: NBA: Who will win Heat vs. Hawks, scheduled for April 19, 7:30 PM ET?, p1: 0, p2: 1, p3: 0.5. Where p2 corresponds to Yes, p1 to a NO, p3 to unknown'
    )
  );


  const b = "0x713a207469746c653a204e42413a2057686f2077696c6c2077696e20486561742076732e204861776b732c207363686564756c656420666f7220417072696c2031392c20373a333020504d2045543f2c2070313a20302c2070323a20312c2070333a20302e352e20576865726520703220636f72726573706f6e647320746f20486561742c20703120746f2061204861776b732c20703320746f20756e6b6e6f776e"

    console.log( utils.toUtf8String(b));

return
  const OptimisticOracle: OPTIMISTICORACLEINPUTStruct = {
    finder: chain_addresses.finder,
    target: utils.parseEther("1"),
    targetCondition:0,
    rewardAmount: 50,
    interval: 600,
    optimisticOracleLivenessTime: 36000,
    customAncillaryData,
    priceIdentifier,
  };

  await waitForTx(
    pcrHost.createPcrReward(
     pcrHostConfig, Ida, OptimisticOracle, 
      { nonce: deployerNonce++ }
    )
  );
  let pcrAddress = await pcrHost.getTokensAddressByUserAndId(
    deployer.address,
    1
  );

  console.log(pcrAddress);
  let pcrDistributor = await PcrOptimisticOracle__factory.connect(
    pcrAddress.optimisticOracleContract,
    deployer
  );



  const daixContract2 = await ERC777__factory.connect(
    Ida.rewardToken,
    deployer
  );
  await waitForTx(
    daixContract2.approve(pcrAddress.optimisticOracleContract, 50)
  );
    await waitForTx(pcrDistributor.depositReward(50));



  return;

  ////// create a

  const pcrToken = await PcrToken__factory.connect(
    pcrAddress.tokenContract,
    deployer
  );

  const sf = await Framework.create({
    networkName: 'local',
    provider: provider,
    customSubgraphQueriesEndpoint:
      'https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-mumbai',
    resolverAddress: chain_addresses.resolver,
  });
  const daixContract = await sf.loadSuperToken(Ida.rewardToken);
  let realt = await daixContract.realtimeBalanceOf({
    providerOrSigner: provider,
    account: user2.address,
  });
  console.log(realt);

  const pcrTokenUser2 = await PcrToken__factory.connect(
    pcrAddress.tokenContract,
    user2
  );

  const oper = await sf.idaV1.approveSubscription({
    publisher: pcrAddress.tokenContract,
    superToken: Ida.rewardToken,
    indexId: '0',
  });

  await oper.exec(user2);

  let subsc = await sf.idaV1.getSubscription({
    superToken: Ida.rewardToken,
    indexId: '0',
    subscriber: user2.address,
    providerOrSigner: provider,
    publisher: pcrAddress.tokenContract,
  });

  console.log(subsc);

  await waitForTx(pcrTokenUser2.claim());

  let index0 = await sf.idaV1.getIndex({
    superToken: Ida.rewardToken,
    indexId: '0',
    providerOrSigner: provider,
    publisher: pcrAddress.tokenContract,
  });
  console.log(index0);
  realt = await daixContract.realtimeBalanceOf({
    providerOrSigner: provider,
    account: user2.address,
  });
  console.log(realt);
  return;

  console.log(
    (
      await daixContract2.balanceOf(pcrAddress.optimisticOracleContract)
    ).toString()
  );

  const proposedPriced = utils.parseEther("1.0")
  await waitForTx(pcrDistributor.proposeDistribution(proposedPriced))

  await waitForTx(pcrToken.issue(user2.address, 1));

  await waitForTx(pcrDistributor.executeDistribution());

  //

  return;

  let admin = await pcrToken.ADMIN();
  console.log(admin, deployer.address);
  await waitForTx(pcrToken.issue(user2.address, 1, { nonce: deployerNonce++ }));

  index0 = await sf.idaV1.getIndex({
    superToken: Ida.rewardToken,
    indexId: '0',
    providerOrSigner: provider,
    publisher: pcrAddress.tokenContract,
  });
  console.log(index0);

  console.log((await daixContract2.balanceOf(deployer.address)).toString());

  tx2 = await daixContract.approve({
    amount: '50',
    receiver: pcrAddress.tokenContract,
    overrides: { nonce: deployerNonce++ },
  });
  await tx2.exec(deployer);

  let user3Txt = await daixContract2.send(pcrAddress.tokenContract, 50, '0x', {
    from: deployer.address,
    nonce: deployerNonce++,
  });

  await user3Txt.wait();


};

clone()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
