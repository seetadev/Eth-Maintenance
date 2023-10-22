// eslint-disable-next-line import/extensions
import Arb from './arb.js';

const config = {
  priceOracleEth: 1600,
  consts: {
    // tradeDays: 365,
  },
};

const ArbObj = new Arb(config);
ArbObj.main();
