module.exports = {
  mainnet: {
    WETH: [
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // asset
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // src
      '0xa0df350d2637096571F7A701CBc1C5fdE30dF76A', // dst
      (5 * 1e18).toString(), // amt
    ],
    WBTC: [
      '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // asset
      '0xccF4429DB6322D5C611ee964527D42E5d685DD6a', // src
      '0xa0df350d2637096571F7A701CBc1C5fdE30dF76A', // dst
      (5 * 1e8).toString(), // amt
    ],
    USDC: [
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // asset
      '0x39AA39c021dfbaE8faC545936693aC917d5E7563', // src
      '0xa0df350d2637096571F7A701CBc1C5fdE30dF76A', // dst
      (5000 * 1e6).toString(), // amt
    ]
  },
  
  base: {
    USDbC: [
      '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', // asset
      '0xB4885Bc63399BF5518b994c1d0C153334Ee579D0', // src
      '0xa0df350d2637096571F7A701CBc1C5fdE30dF76A', // dst
      (5000 * 1e6).toString(), // amt
    ],
    cbETH: [
      '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22', // asset
      '0x44Ecc644449fC3a9858d2007CaA8CFAa4C561f91', // src
      '0xa0df350d2637096571F7A701CBc1C5fdE30dF76A', // dst
      (5 * 1e18).toString(), // amt
    ],
    COMP: [
      '0x9e1028F5F1D5eDE59748FFceE5532509976840E0', // asset
      '0x123964802e6ABabBE1Bc9547D72Ef1B69B00A6b1', // src
      '0xa0df350d2637096571F7A701CBc1C5fdE30dF76A', // dst
      (100 * 1e18).toString(), // amt
    ],
    WETH: [
      '0x4200000000000000000000000000000000000006', // asset
      '0xB4885Bc63399BF5518b994c1d0C153334Ee579D0', // src
      '0xa0df350d2637096571F7A701CBc1C5fdE30dF76A', // dst
      (100 * 1e18).toString(), // amt
    ],
  },
};