const ethereumEnableButton = document.getElementById('enable-button');
const instanceSelectBox = document.getElementById('instance-select');
const collateralSelectBox = document.getElementById('collateral-select');
const supplyAprElement = document.getElementById('supply-apr');
const borrowAprElement = document.getElementById('borrow-apr');
const hidden = 'hidden';
const baseSupplyButton = document.getElementById('base-supply-button');
const baseWithdrawButton = document.getElementById('base-withdraw-button');
const collateralSupplyButton = document.getElementById('collateral-supply-button');
const collateralWithdrawButton = document.getElementById('collateral-withdraw-button');
const baseSupplyTextBox = document.getElementById('base-supply');
const baseWithdrawTextBox = document.getElementById('base-withdraw');
const collateralSupplyTextBox = document.getElementById('collateral-supply');
const collateralWithdrawTextBox = document.getElementById('collateral-withdraw');
const balancesContainer = document.getElementById('balances');

const erc20Abi = [
  'function approve(address, uint256) public returns (bool)',
];

const cometAbi = [
  'function getSupplyRate(uint) public view returns (uint)',
  'function getBorrowRate(uint) public view returns (uint)',
  'function getUtilization() public view returns (uint)',
  'function baseTokenPriceFeed() public view returns (address)',
  'function getPrice(address) public view returns (uint128)',
  'function totalSupply() external view returns (uint256)',
  'function totalBorrow() external view returns (uint256)',
  'function baseIndexScale() external pure returns (uint64)',
  'function baseTrackingSupplySpeed() external view returns (uint)',
  'function baseTrackingBorrowSpeed() external view returns (uint)',
  'function supply(address asset, uint amount)',
  'function collateralBalanceOf(address, address) external view returns (uint128)',
  'function balanceOf(address) external view returns (uint256)',
  'function borrowBalanceOf(address ) external view returns (uint256)',
  'function userBasic(address) external view returns (int104, uint64, uint64, uint16, uint8)',
  'function withdraw(address asset, uint amount)',
];

const cometInstances = [
  {
    "name": "cUSDCv3 Mainnet Ethereum",
    "value": "cUSDCv3_ETH",
    "chainId": 1,
    "contracts": {
      "v3": "0xc3d688B66703497DAA19211EEdff47f25384cdc3",
      "assets": [
        {
          "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          "symbol": "USDC",
          "decimals": 6
        },
        {
          "address": "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
          "symbol": "WBTC",
          "decimals": 8
        },
        {
          "address": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          "symbol": "WETH",
          "decimals": 18
        },
        {
          "address": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
          "symbol": "COMP",
          "decimals": 18
        },
        {
          "address": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
          "symbol": "UNI",
          "decimals": 18
        },
        {
          "address": "0x514910771AF9Ca656af840dff83E8264EcF986CA",
          "symbol": "LINK",
          "decimals": 18
        },
      ]
    },
  },
  {
    "name": "cWETHv3 Mainnet Ethereum",
    "value": "cWETHv3_ETH",
    "chainId": 1,
    "contracts": {
      "v3": "0xA17581A9E3356d9A858b789D68B4d866e593aE94",
      "assets": [
        {
          "address": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          "symbol": "WETH",
          "decimals": 18
        },
        {
          "address": "0xBe9895146f7AF43049ca1c1AE358B0541Ea49704",
          "symbol": "cbETH",
          "decimals": 18
        },
        {
          "address": "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
          "symbol": "wstETH",
          "decimals": 18
        },
      ]
    },
  },
  {
    "name": "cUSDbCv3 Base",
    "value": "cUSDbCv3_BASE",
    "chainId": 8453,
    "contracts": {
      "v3": "0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf",
      "assets": [
        {
          "address": "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
          "symbol": "USDbC",
          "decimals": 6
        },
        {
          "address": "0x4200000000000000000000000000000000000006",
          "symbol": "WETH",
          "decimals": 18
        },
        {
          "address": "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22",
          "symbol": "cbETH",
          "decimals": 18
        },
      ]
    },
  },
  {
    "name": "cWETHv3 Base",
    "value": "cWETHv3_BASE",
    "chainId": 8453,
    "contracts": {
      "v3": "0x46e6b214b524310239732D51387075E0e70970bf",
      "assets": [
        {
          "address": "0x4200000000000000000000000000000000000006",
          "symbol": "WETH",
          "decimals": 18
        },
        {
          "address": "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22",
          "symbol": "cbETH",
          "decimals": 18
        },
      ]
    },
  }
];
