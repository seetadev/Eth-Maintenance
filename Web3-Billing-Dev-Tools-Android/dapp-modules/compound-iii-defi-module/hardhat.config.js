let providerUrl;
if (process.argv[2] === 'mainnet') {
  providerUrl = process.env.MAINNET_PROVIDER_URL;
  chainId = 1;
} else if (process.argv[2] === 'base') {
  providerUrl = process.env.BASE_PROVIDER_URL;
  chainId = 8453;
}

if (!providerUrl) {
  console.error('Missing JSON RPC provider URL as environment variable `APP_PROVIDER_URL`');
  process.exit(1);
}

const devMnemonic = 'clutch captain shoe salt awake harvest setup primary inmate ugly among become';

module.exports = {
  networks: {
    hardhat: {
      chainId,
      forking: { url: providerUrl },
      gasPrice: 0,
      initialBaseFeePerGas: 0,
      loggingEnabled: false,
      accounts: { mnemonic: devMnemonic }
    },
  }
};
