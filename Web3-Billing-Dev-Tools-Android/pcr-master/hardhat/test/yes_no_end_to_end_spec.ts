import { expect } from 'chai';
import { ethers, network } from 'hardhat';

import * as hre from 'hardhat';

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BaseProvider, TransactionReceipt } from '@ethersproject/providers';
import {
  Events__factory,
  PcrHost,
  PcrHost__factory,
  PcrOptimisticOracle,
  PcrOptimisticOracle__factory,
  PcrToken,
  PcrToken__factory,
  SuperToken__factory,
} from '../typechain-types';
import { getChainAddresses, initEnv, waitForTx } from '../helpers/utils';
import { IDAINPUTStruct, OPTIMISTICORACLEINPUTStruct, PCRHOSTCONFIGINPUTStruct } from '../typechain-types/PcrHost';
import { getTimestamp, increaseBlockTime, matchEvent, resetFork } from './helpers/utils';
import { Framework, SuperToken } from '@superfluid-finance/sdk-core';
import { BigNumber, utils } from 'ethers';

describe('End to End YES/NO QUESTION', function () {
  let pcrHostContract: PcrHost;
  let pcrTokenContractImpl: PcrToken;
  let pcrOptimisticOracleImpl: PcrOptimisticOracle;

  let pcrTokenContract: PcrToken;
  let pcrOptimisticOracle: PcrOptimisticOracle;

  let provider: BaseProvider;
  let timeStamp: number;
  const defaultNetwork = 'kovan';
  let zeroAddress = '0x0000000000000000000000000000000000000000';

  const chain_addresses = getChainAddresses(defaultNetwork);
  let pcrAddresses: any;
  let tokenNrbyUser: number;
  let deployer: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;
  let livenessPeriod = 600;
  let interval = 3600;
  let eventsLib:any;
  let sf: Framework;

  resetFork();

  beforeEach(async () => {
    [deployer, user1, user2, user3] = await initEnv(hre);

    provider = hre.ethers.provider;

    pcrHostContract = await new PcrHost__factory(deployer).deploy();

    pcrTokenContractImpl = await new PcrToken__factory(deployer).deploy();

    pcrOptimisticOracleImpl = await new PcrOptimisticOracle__factory(deployer).deploy();

    const pcrHost = await PcrHost__factory.connect(pcrHostContract.address, deployer);

    eventsLib = await new Events__factory(deployer).deploy();

    const pcrHostConfig: PCRHOSTCONFIGINPUTStruct = {
      pcrTokenImpl: pcrTokenContractImpl.address,
      pcrOptimisticOracleImpl: pcrOptimisticOracleImpl.address,
      title: 'Mu reard',
      url: 'http://aloha.com',
    };

    const Ida: IDAINPUTStruct = {
      host: chain_addresses.host,
      ida: chain_addresses.ida,
      rewardToken: chain_addresses.fDaix,
    };

    const priceIdentifier = hre.ethers.utils.formatBytes32String('YES_OR_NO_QUERY');
    const customAncillaryData = hre.ethers.utils.hexlify(
      hre.ethers.utils.toUtf8Bytes(
        'q: title: NBA: Who will win Heat vs. Hawks, scheduled for April 19, 7:30 PM ET?, p1: 0, p2: 1, p3: 0.5. Where p2 corresponds to Heat, p1 to a Hawks, p3 to unknown'
      )
    );

    const OptimisticOracle: OPTIMISTICORACLEINPUTStruct = {
      finder: chain_addresses.finder,
      target: utils.parseEther('1.0'),
      targetCondition: 2,
      rewardAmount: 50,
      interval: interval,
      optimisticOracleLivenessTime: livenessPeriod,
      customAncillaryData,
      priceIdentifier,
    };

    const receipt = await waitForTx(pcrHost.createPcrReward(pcrHostConfig, Ida, OptimisticOracle));

    tokenNrbyUser = +(await pcrHost.getTotalPcrTokensByUser(deployer.address));

    pcrAddresses = await pcrHost.getTokensAddressByUserAndId(deployer.address, tokenNrbyUser);

    pcrTokenContract = PcrToken__factory.connect(pcrAddresses.tokenContract, deployer);

    pcrOptimisticOracle = PcrOptimisticOracle__factory.connect(pcrAddresses.optimisticOracleContract, deployer);

    //// SUPERFLUID SDK INITIALIZATION
    sf = await Framework.create({
      networkName: 'local',
      provider: provider,
      customSubgraphQueriesEndpoint: 'https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-mumbai',
      resolverAddress: chain_addresses.resolver,
    });

    let timeStamp = parseInt(await getTimestamp());
    let appendcustomAncillaryData = customAncillaryData;
    //expect(receipt.logs.length).to.eq(2);
    matchEvent(receipt, 'RewardCreated', eventsLib, [
      [
        deployer.address,
        utils.parseEther('1.0'),
        2,
        '0xe3CB950Cb164a31C66e32c320A800D477019DCFF',
        'PCR1 Perpetual Conditional Reward Token Nr: 1',
        1,
        timeStamp + interval,
        [chain_addresses.finder, utils.parseEther('1.0'), 2, 50, interval, livenessPeriod,  priceIdentifier,appendcustomAncillaryData,],
        pcrAddresses.tokenContract,
        pcrAddresses.optimisticOracleContract,
        pcrHostConfig.title,
        pcrHostConfig.url,
      ],
    ]);
  });

  it('Contracts not initialize', async function () {
    expect(await pcrTokenContractImpl.ADMIN()).to.equal(zeroAddress);
    expect(await pcrTokenContractImpl.TOKEN_INDEX_PUBLISHER_ADDRESS()).to.equal(zeroAddress);
  });

  it('Contracts already cloned addresses correct initialized', async function () {
    expect(await pcrTokenContract.ADMIN()).to.equal(deployer.address);
    expect(await pcrTokenContract.TOKEN_INDEX_PUBLISHER_ADDRESS()).to.equal(pcrTokenContract.address);
    expect(tokenNrbyUser).equal(1);
  });

  it('Fails when propose distrubution in funding period', async function () {
    const proposedPriced = utils.parseEther('1.0');
    await expect(waitForTx(pcrOptimisticOracle.proposeDistribution(proposedPriced))).to.be.revertedWith('Cannot propose in funding period');
  });

  it('Should fails when propose distrubution outside funding period', async function () {
    await increaseBlockTime(network, interval + 1);
    await network.provider.request({
      method: 'evm_mine',
      params: [],
    });
    let afterTimestamp = parseInt(await getTimestamp());
    const proposedPriced = utils.parseEther('1.0');
    await expect(waitForTx(pcrOptimisticOracle.proposeDistribution(proposedPriced))).not.to.be.reverted;

    await expect(waitForTx(pcrOptimisticOracle.executeDistribution())).to.be.revertedWith('_settle: not settleable');

    await increaseBlockTime(network, livenessPeriod + 1);
    await network.provider.request({
      method: 'evm_mine',
      params: [],
    });
    await expect(waitForTx(pcrOptimisticOracle.executeDistribution())).to.be.revertedWith('SuperfluidToken: move amount exceeds balance');
  });

  it('Should NotFail When Reward funded', async function () {
    await increaseBlockTime(network, interval + 1);
    await network.provider.request({
      method: 'evm_mine',
      params: [],
    });
    const proposedPriced = utils.parseEther('1.0');
    let receipt = await waitForTx(pcrOptimisticOracle.proposeDistribution(proposedPriced))

    matchEvent(receipt, 'ProposalCreated', eventsLib, [deployer.address,1,1,parseInt(await getTimestamp())]);

    await increaseBlockTime(network, livenessPeriod + 1);
    await network.provider.request({
      method: 'evm_mine',
      params: [],
    });

    await expect(waitForTx(pcrOptimisticOracle.executeDistribution())).to.be.revertedWith('SuperfluidToken: move amount exceeds balance');

    ////FUNDING THE OPTIMISTIC ORACLE
    const daixContract = await SuperToken__factory.connect(chain_addresses.fDaix, deployer);
    await waitForTx(daixContract.approve(pcrAddresses.optimisticOracleContract, 50));
    receipt =  await waitForTx(pcrOptimisticOracle.depositReward(50));
    
    matchEvent(receipt, 'RewardDeposit', eventsLib, [1,50]);




    //// ERROR WHILE TRYING TO DISTRIBUTE AN INDEX WITHOUT SUBSCRIBERS
    await expect(waitForTx(pcrOptimisticOracle.executeDistribution())).to.be.revertedWith('CallUtils: target panicked: 0x12');
  });

  it('Should Not Fail When Already the index has issued a unit and user receiving reward must have proper balances', async function () {
    await increaseBlockTime(network, interval + 1);
    await network.provider.request({
      method: 'evm_mine',
      params: [],
    });
    const proposedPriced = utils.parseEther('1.0');
    await waitForTx(pcrOptimisticOracle.proposeDistribution(proposedPriced));

    await increaseBlockTime(network, livenessPeriod + 1);
    await network.provider.request({
      method: 'evm_mine',
      params: [],
    });

    ////FUNDING THE OPTIMISTIC ORACLE
    const daixContract = await SuperToken__factory.connect(chain_addresses.fDaix, deployer);
    await waitForTx(daixContract.approve(pcrAddresses.optimisticOracleContract, 50));
    await waitForTx(pcrOptimisticOracle.depositReward(50));

    //// ISSUING ONE UNIT
    let receipt = await waitForTx(pcrTokenContract.issue(user1.address, 1));
    matchEvent(receipt, 'RewardUnitsIssued', eventsLib, [1,user1.address,1]);

    receipt =  await waitForTx(pcrOptimisticOracle.executeDistribution())
    let timeStamp = parseInt(await getTimestamp());

    matchEvent(receipt, 'RewardDistributed', eventsLib, [1,50]);

    let balance = await daixContract.realtimeBalanceOf(user1.address, timeStamp);
    let iniatialbalance = balance[0].toBigInt();

    const approveOperation = await sf.idaV1.approveSubscription({
      publisher: pcrAddresses.tokenContract,
      superToken: chain_addresses.fDaix,
      indexId: '0',
    });
    timeStamp = parseInt(await getTimestamp());
    await approveOperation.exec(user1);

    let FinalBalance = await daixContract.realtimeBalanceOf(user1.address, timeStamp);
    let finalBalance = FinalBalance[0].toBigInt();

    expect(finalBalance - iniatialbalance).to.equal(BigNumber.from(50));
  });
});
