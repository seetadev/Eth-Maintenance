const addresses = require('./addresses.js');
const ethers = require('ethers');
const hre = require('hardhat');
const { TASK_NODE_CREATE_SERVER } = require('hardhat/builtin-tasks/task-names');

const network = process.argv[2];
if (!network || (network !== 'mainnet' && network !== 'base')) {
  console.log('Network param missing. Ex:');
  console.log('npm start mainnet');
  process.exit(1);
}

const express = require('express');
const dApp = express();

dApp.use(express.static('./public'));

dApp.listen(3008, async () => {
  console.log('\nInterest rate dApp served at http://127.0.0.1:3008/');

  const jsonRpcServer = await hre.run(TASK_NODE_CREATE_SERVER, {
    provider: hre.network.provider,
    hostname: '127.0.0.1',
    port: 8545
  });

  await jsonRpcServer.listen();

  console.log('\nEthereum fork node running at http://127.0.0.1:8545/\n');

  console.log('Seeding my development account...\n');

  const assets = Object.keys(addresses[network]);

  for (let i = 0; i < assets.length; i++) {
    console.log(`Seeding with ${assets[i]}...`);
    await seedLocalDevAccount.apply(null, addresses[network][assets[i]]);
  }

  console.log('\nReady!\n');
});

async function seedLocalDevAccount(asset, src, dst, amt) {
  await hre.network.provider.request({
    method: 'hardhat_impersonateAccount',
    params: [ src ],
  });

  const erc20Abi = [ 'function transfer(address, uint)' ];
  const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
  const signer = provider.getSigner(src);
  const token = new ethers.Contract(asset.toString(), erc20Abi, signer);

  const tx = await token.transfer(dst, amt);
  const receipt = await tx.wait(1);
}
