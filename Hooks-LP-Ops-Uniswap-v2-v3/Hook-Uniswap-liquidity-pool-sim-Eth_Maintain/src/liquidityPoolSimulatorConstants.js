// Liquidity Pool Simulator Constants

// class
class LiquidityPoolSimulatorConstants {
  /**
   * Constructor.
   *
   * @param {Object} _config - The config.
   * @param {LiquidityPoolSimulator} _lps - The parent object.
   */
  constructor(_config, _lps) {
    // props
    this.nameToken = 'DOLR';
    this.decimalsEth = 18;
    this.decimalsToken = 6;
    this.decimalsTokenDisplay = 2;
    this.rangeMultiplier = 0.5; // 0.01 would be very conservative/wide range ($20-$200,000); 0.8 would be narrow/concentrated
    this.feeLpBps = 30; // 30 = 0.3%
    this.minPriceOracleEth = 100;
    this.deltaPriceOracleEthBps = 100;
    this.tradeMaxEth = 50;
    this.tradeMaxArbEthMult = 100;
    this.tradeMinEth = 0.1;
    this.tradeMinToken = 1000;
    this.tradeVolumePerDay = 100000000;
    this.tradeAvgValue = 25000;
    this.tradeDays = 30;
    this.safetyMinEthMult = 0.5;
    this.safetyPriceToleranceBps = 2500; // 1000 === 10%

    // _config overrides
    Object.keys(_config).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(this, key)) {
        _lps.exit(`Unknown _config property: ${key}`);
      }
      this[key] = _config[key];
    });

    // calculated props, don't override
    this.tradeMaxToken = (this.tradeMaxEth * _lps.priceOracleEth);
    this.tradeMaxArbEth = (this.tradeMaxEth * this.tradeMaxArbEthMult);
    this.tradeMaxArbToken = (this.tradeMaxArbEth * _lps.priceOracleEth);
    this.tradeNumberPerDay = (this.tradeVolumePerDay / this.tradeAvgValue); // 100000000 / 25000 = 4000
    this.tradesTotal = (this.tradeNumberPerDay * this.tradeDays);
    this.initialEth = _lps.reserveEth;
    this.initialToken = (this.initialEth * _lps.priceOracleEth); // 250 * 2000 = 500000
    this.initialInvestment = (this.initialToken * 2);
    this.safetyMinEth = (this.initialEth * this.safetyMinEthMult);
    // /props

    Object.freeze(this); // now immutable
  }
}

// /class

export default LiquidityPoolSimulatorConstants;
