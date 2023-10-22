// eslint-disable-next-line import/extensions
import LiquidityPoolSimulator from '../index.js';

const config = {
  priceOracleEth: 1600,
  consts: {
    // tradeDays: 30,
  },
};

const LiquidityPoolSimulatorObj = new LiquidityPoolSimulator(config);
LiquidityPoolSimulatorObj.main();
