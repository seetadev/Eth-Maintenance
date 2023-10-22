// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.

// "PCR",
// "PCR",
// "0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f",
// "0xEB796bdb90fFA0f28255275e16936D25d3418603",
// "0x804348D4960a61f2d5F9ce9103027A3E849E09b8"

import { writeFileSync, readFileSync } from 'fs';
import { copySync, ensureDir, existsSync } from 'fs-extra';
import { ethers, hardhatArguments } from 'hardhat';
import config from '../hardhat.config';
import { join } from 'path';
import { createHardhatAndFundPrivKeysFiles } from '../helpers/localAccounts';
import * as hre from 'hardhat';
import { getTimestamp } from '../test/helpers/utils';
import { mineBlocks, setNextBlockTimestamp } from '../helpers/utils';

interface ICONTRACT_DEPLOY {
  artifactsPath: string;
  name: string;
  ctor?: any;
  jsonName: string;
}

const contract_path_relative = '../src/assets/contracts/';
const processDir = process.cwd();
const contract_path = join(processDir, contract_path_relative);
ensureDir(contract_path);

const artifactEvents = join(processDir, `./artifacts/contracts/libraries/Events.sol/Events.json`);
const MetadataEvents = JSON.parse(readFileSync(artifactEvents, 'utf-8'));
const eventAbi = MetadataEvents.abi;

async function main() {
  let network = hardhatArguments.network;
  if (network == undefined) {
    network = config.defaultNetwork;
  }

  if (network == 'localhost') {
    let todayTimeSamp = +(new Date().getTime() / 1000).toFixed(0);

    console.log('oldTimeStamp: ', new Date(+(todayTimeSamp)*1000).toLocaleString());
    await setNextBlockTimestamp(hre, todayTimeSamp);

    await mineBlocks(hre, 1);

    console.log('newTimeStamp: ', new Date(+(await getTimestamp()) * 1000).toLocaleString());
  }

  const contract_config = JSON.parse(readFileSync(join(processDir, 'contract.config.json'), 'utf-8')) as { [key: string]: ICONTRACT_DEPLOY };

  const deployContracts = ['pcrToken', 'pcrHost', 'pcrOptimisticOracle'];



  for (const toDeployName of deployContracts) {
    const toDeployContract = contract_config[toDeployName];
    if (toDeployContract == undefined) {
      console.error('Your contract is not yet configured');
      console.error('Please add the configuration to /hardhat/contract.config.json');
      return;
    }
    const artifactsPath = join(processDir, `./artifacts/contracts/${toDeployContract.artifactsPath}`);
    const Metadata = JSON.parse(readFileSync(artifactsPath, 'utf-8'));
    const Contract = await ethers.getContractFactory(toDeployContract.name);
    const contract = await Contract.deploy.apply(Contract, toDeployContract.ctor);

    //const signer:Signer = await hre.ethers.getSigners()

    writeFileSync(
      `${contract_path}/${toDeployContract.jsonName}_metadata.json`,
      JSON.stringify({
        abi: Metadata.abi.concat(eventAbi),
        name: toDeployContract.name,
        address: contract.address,
        network: network,
      })
    );

    console.log(toDeployContract.name + ' Contract Deployed to:', contract.address);

    ///// copy Interfaces and create Metadata address/abi to assets folder
    copySync(`./typechain-types/${toDeployContract.name}.ts`, join(contract_path, 'interfaces', `${toDeployContract.name}.ts`));
  }

  ///// create the local accounts file
  if (!existsSync(`${contract_path}/local_accouts.json`) && (network == 'localhost' || network == 'hardhat')) {
    const accounts_keys = await createHardhatAndFundPrivKeysFiles(hre, contract_path);
    writeFileSync(`${contract_path}/local_accouts.json`, JSON.stringify(accounts_keys));
  }

  ///// copy addressess files
  if (!existsSync(`${contract_path}/interfaces/common.ts`)) {
    copySync('./typechain-types/common.ts', join(contract_path, 'interfaces', 'common.ts'));
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
