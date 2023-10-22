import {
  BytesLike,
  Contract,
  ContractTransaction,
  Signer,
  Wallet,
} from 'ethers';

import { ensureDir, readFileSync } from 'fs-extra';
import {
  HardhatNetworkAccountConfig,
  HardhatNetworkAccountsConfig,
  HardhatNetworkConfig,
  HardhatRuntimeEnvironment,
} from 'hardhat/types';
import { join } from 'path';

export function getHardhatNetwork(hre: HardhatRuntimeEnvironment) {
  let network = hre.hardhatArguments.network;
  if (network == undefined) {
    network = hre.network.name;
  }
  return network;
}

const global_address = {
  localhost: {
    host: '0xF0d7d1D47109bA426B9D8A3Cde1941327af1eea3',
    cfa: '0xECa8056809e7e8db04A8fF6e4E82cD889a46FE2F',
    ida: '0x556ba0b3296027Dd7BCEb603aE53dEc3Ac283d2b',
    fDaix: '0xe3cb950cb164a31c66e32c320a800d477019dcff',
    fDai: '0xb64845d53a373d35160b72492818f0d2f51292c0',
    resolver:"0x851d3dd9dc97c1df1DA73467449B3893fc76D85B",
    subgraph:"https://thegraph.com/hosted-service/subgraph/superfluid-finance/protocol-v1-kovan",
    sfNetwork:"local",
    finder:"0xeD0169a88d267063184b0853BaAAAe66c3c154B2"
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
  },
  mumbai: {
    host: '0xEB796bdb90fFA0f28255275e16936D25d3418603',
    cfa: '0x49e565Ed1bdc17F3d220f72DF0857C26FA83F873',
    ida: '0x804348D4960a61f2d5F9ce9103027A3E849E09b8',
    fDaix: '0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f',
    fDai: '0x15F0Ca26781C3852f8166eD2ebce5D18265cceb7',
    resolver:"0x8C54C83FbDe3C59e59dd6E324531FB93d4F504d3",
    finder:"0xb22033fF04AD01fbE8d78ef4622a20626834271B",
    sfNetwork:"mumbai",
    subgraph:"https://thegraph.com/hosted-service/subgraph/superfluid-finance/protocol-v1-mumbai"
  },
};


export const getChainAddresses = (chain:'kovan' | 'mumbai'):{
  host: string,
  cfa: string,
  ida: string,
  fDaix: string,
  fDai: string,
  resolver:string,
  finder:string
} =>{
  return global_address[chain]
}


export const getContractAddress = async (): Promise<{
  PcrHost: string;
  PcrToken: string;
  PcrOptimisticOracle: string;
}> => {
  const contract_path_relative = '../src/assets/contracts/';
  const processDir = process.cwd();
  const contract_path = join(processDir, contract_path_relative);
  const contract_config = JSON.parse(
    readFileSync(join(processDir, 'contract.config.json'), 'utf-8')
  ) as { [key: string]: any };


  let pcrHostConfig = contract_config['pcrHost'];

  const pcrHostMetadata = JSON.parse(
    readFileSync(
      `${contract_path}/${pcrHostConfig.jsonName}_metadata.json`,
      'utf-8'
    )
  );

  let pcrTokenConfig = contract_config['pcrToken'];

  const pcrTokenMetadata = JSON.parse(
    readFileSync(
      `${contract_path}/${pcrTokenConfig.jsonName}_metadata.json`,
      'utf-8'
    )
  );

  let optimisticOracleConfig = contract_config['pcrOptimisticOracle'];

  const optimisticOracleMetadata = JSON.parse(
    readFileSync(
      `${contract_path}/${optimisticOracleConfig.jsonName}_metadata.json`,
      'utf-8'
    )
  );

  return { PcrHost: pcrHostMetadata.address, PcrToken: pcrTokenMetadata.address, PcrOptimisticOracle: optimisticOracleMetadata.address };
};

export async function initEnv(hre: HardhatRuntimeEnvironment): Promise<any[]> {
  let network = getHardhatNetwork(hre);
  if (network == 'localhost') {
    const ethers = hre.ethers; // This allows us to access the hre (Hardhat runtime environment)'s injected ethers instance easily
    const accounts = await ethers.getSigners(); // This returns an array of the default signers connected to the hre's ethers instance
    const deployer = accounts[0];
    const user1 = accounts[1];
    const user2 = accounts[2];
    const user3 = accounts[3];
    const user4 = accounts[4];

    return [deployer, user1, user2, user3, user4];
  } else {
    const deployer_provider = hre.ethers.provider;
    const privKeyDEPLOYER = process.env['DEPLOYER_KEY'] as BytesLike;
    const deployer_wallet = new Wallet(privKeyDEPLOYER);
    const deployer = await deployer_wallet.connect(deployer_provider);

    const privKeyUSER = process.env['USER1_KEY'] as BytesLike;
    const user_wallet = new Wallet(privKeyUSER);
    const user1 = await user_wallet.connect(deployer_provider);

    const privKeyUSER2 = process.env['USER2_KEY'] as BytesLike;
    const user2_wallet = new Wallet(privKeyUSER2);
    const user2 = await user2_wallet.connect(deployer_provider);

    const privKeyUSER3 = process.env['USER3_KEY'] as BytesLike;
    const user3_wallet = new Wallet(privKeyUSER3);
    const user3 = await user3_wallet.connect(deployer_provider);

    const privKeyUSER4 = process.env['USER4_KEY'] as BytesLike;
    const user4_wallet = new Wallet(privKeyUSER4);
    const user4 = await user4_wallet.connect(deployer_provider);

    return [deployer, user1, user2, user3, user4];
  }
}

export async function waitForTx(tx: Promise<ContractTransaction>) {
  return await (await tx).wait();
}

export async function deployContract(tx: any): Promise<Contract> {
  const result = await tx;
  await result.deployTransaction.wait();
  return result;
}

export function getAssetsPath(contract_path_relative: string) {
  const processDir = process.cwd();
  const contract_path = join(processDir, contract_path_relative);
  ensureDir(contract_path);
  return contract_path;
}

export async function impersonateAccount(
  hre: HardhatRuntimeEnvironment,
  account: string
): Promise<Signer> {
  await hre.network.provider.request({
    method: 'hardhat_impersonateAccount',
    params: [account],
  });

  const signer = await hre.ethers.getSigner(account);
  return signer;
}

export async function resertHardhat(
  hre: HardhatRuntimeEnvironment
): Promise<void> {
  await hre.network.provider.request({
    method: 'hardhat_reset',
    params: [],
  });
}

export async function forwardChainTime(
  hre: HardhatRuntimeEnvironment,
  INCREASE_PERIOD: number
): Promise<void> {
  await hre.network.provider.send('evm_increaseTime', [INCREASE_PERIOD + 1]);
}

export async function mineBlocks(
  hre: HardhatRuntimeEnvironment,
  nrOfBlocks: number
) {
  for (let i = 1; i <= nrOfBlocks; i++) {
    await hre.network.provider.request({
      method: 'evm_mine',
      params: [],
    });
  }
}


export async function setNextBlockTimestamp(hre: HardhatRuntimeEnvironment,timestamp: number): Promise<void> {
  await hre.ethers.provider.send('evm_setNextBlockTimestamp', [timestamp]);
}