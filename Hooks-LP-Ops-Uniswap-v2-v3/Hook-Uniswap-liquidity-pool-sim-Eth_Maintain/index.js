// Liquidity Pool Simulator

// packages
import { program } from 'commander';
import seedrandom from 'seedrandom';
// eslint-disable-next-line import/extensions
import LiquidityPoolSimulatorConstants from './src/liquidityPoolSimulatorConstants.js';

// vars
let seed;

// class
class LiquidityPoolSimulator {
  /**
   * Constructor.
   *
   * @param {Object} _config - The config.
   */
  constructor(_config = {}) {
    // props
    this.priceOracleEth = 2000;
    this.reserveEth = 250;

    // _config overrides
    Object.keys(_config).forEach((key) => {
      if (key === 'consts') return; // handled below
      if (!Object.prototype.hasOwnProperty.call(this, key)) {
        this.exit(`Unknown _config property: ${key}`);
      }
      this[key] = _config[key];
    });

    // calculated props, don't override
    this.initialTokenStaked = 0;
    this.tokenTotalSupply = 0;
    this.lpEth = 0;
    this.lpToken = 0;
    this.priceLp = 0;
    this.lpFeesEth = 0;
    this.lpFeesToken = 0;
    this.lifetimeProfitEth = 0;
    this.lifetimeProfitUSD = 0;
    this.rangeBoundLower = null;
    this.rangeBoundUpper = null;
    this.rangeMaxEth = null;
    this.rangeMaxToken = null;
    this.priceLpSqrt = null;
    this.rangeBoundLowerSqrt = null;
    this.rangeBoundUpperSqrt = null;
    this.liquidityValue = null;
    this.recordMinLpEth = this.reserveEth;
    this.recordMaxLpEth = 0;
    this.isLastTradeEth = true;
    this.isPrinting = true;
    // /props

    // consts
    this.consts = new LiquidityPoolSimulatorConstants((_config.consts || {}), this);
    // /consts

    // init
    this.setPriceOracleEth(this.priceOracleEth);
    this.lpEth = this.reserveEth;
    this.reserveEth = 0;
    this.lpToken = this.mint(this.decimals(this.consts.initialToken));
    this.initialTokenStaked = this.lpToken;
    this.recalcPriceLp(true);
    this.recalcRangeBounds();
    this.recalcLiquidityValue();
    this.rebal();
  }

  /**
   * Generates a random integer between 0 and the specified maximum value (exclusive).
   *
   * @param {number} _max - The maximum value for the random integer. Default is Number.MAX_SAFE_INTEGER.
   * @return {number} - The generated random integer.
   */
  static getRandomInt(_max = Number.MAX_SAFE_INTEGER) {
    return Math.floor(Math.random() * _max);
  }

  /**
   * Applies a fee to a given value.
   *
   * @param {number} _feeBps - The fee in basis points.
   * @return {number} The fee as a decimal value.
   */
  static applyFeeAny(_feeBps) {
    return _feeBps / 10000;
  }

  /**
   * Applies the LP fee to a given value.
   *
   * @param {number} _x - The value to apply the fee to.
   * @return {number} The value after applying the fee.
   */
  applyFeeLp(_x) {
    return _x * LiquidityPoolSimulator.applyFeeAny(this.consts.feeLpBps);
  }

  /**
   * Logs a message to the console if the isPrinting flag is true.
   *
   * @param {_msg} type - The message to be logged. Default is empty string.
   * @return {void}
   */
  log(_msg = '') {
    if (!this.isPrinting) return;
    // eslint-disable-next-line no-console
    console.log(_msg);
  }

  /**
   * Exits.
   *
   * @param {string} _msg - The message to display.
   * @param {boolean} _isError - Indicates if the exit is due to an error. Default is true.
   * @throws {Error}
   * @return {void|number} The exit code.
   */
  exit(_msg, _isError = true) {
    this.printRecords();
    this.log(`seed: ${seed}`);
    if (_isError) {
      this.log(`Error: ${_msg}`);
      throw new Error(_msg);
    } else {
      this.log(_msg);
      // process.exit();
      return 0;
    }
  }

  /**
   * Sets lpEth.
   *
   * @param {type} _lpEth
   * @return {void}
   */
  setLpEth(_lpEth) {
    this.lpEth = _lpEth;
  }

  /**
   * Sets lpToken.
   *
   * @param {type} _lpToken
   * @return {void}
   */
  setLpToken(_lpToken) {
    this.lpToken = _lpToken;
  }

  /**
   * Sets reserveEth.
   *
   * @param {type} _reserveEth
   * @return {void}
   */
  setReserveEth(_reserveEth) {
    this.reserveEth = _reserveEth;
  }

  /**
   * Calculates the decimal representation of a number.
   *
   * @param {number} _x - The number to be converted.
   * @param {number} _decimals - The number of decimal places to round to. Default is `this.consts.decimalsToken`.
   * @return {number} The decimal representation of the input number.
   */
  decimals(_x, _decimals = this.consts.decimalsToken) {
    const tens = 10 ** _decimals;
    return Number((Math.round(_x * tens) / tens).toFixed(_decimals));
  }

  /**
   * Calculates the decimal representation of a number in ETH decimals.
   *
   * @param {number} _x - The number to be converted.
   * @return {number} The decimal representation of the input number in ETH decimals.
   */
  decimalsEth(_x) {
    return this.decimals(_x, this.consts.decimalsEth);
  }

  /**
   * Calculates the decimal representation of a number for display/output.
   *
   * @param {number} _x - The number to be converted.
   * @return {number} The decimal representation of the input number for display/output.
   */
  dd(_x) {
    return this.decimals(_x, this.consts.decimalsTokenDisplay);
  }

  /**
   * Sets the price oracle for ETH.
   *
   * @param {type} _priceOracleEth
   * @return {void}
   */
  setPriceOracleEth(_priceOracleEth) {
    this.priceOracleEth = _priceOracleEth;
    this.log(`priceOracleEth: ${this.dd(this.priceOracleEth)}`);
  }

  /**
   * Mints a specified amount of tokens.
   *
   * @param {number} _amount - The amount of tokens to mint.
   * @return {number} The amount of tokens minted.
   */
  mint(_amount) {
    if (_amount <= 0) {
      this.exit('mint: invalid _amount');
    }
    this.tokenTotalSupply = this.decimals(this.tokenTotalSupply + _amount);
    this.log(`Minted ${this.consts.nameToken}: ${this.dd(_amount)}`);
    return _amount;
  }

  /**
   * Burn a specified amount of tokens.
   *
   * @param {number} _amount - The amount of tokens to burn.
   * @return {number} The amount of tokens burned.
   */
  burn(_amount) {
    if (_amount <= 0) {
      this.exit('burn: invalid _amount');
    }
    if (_amount > this.tokenTotalSupply) {
      this.exit('burn: _amount > tokenTotalSupply');
    }
    this.tokenTotalSupply = this.decimals(this.tokenTotalSupply - _amount);
    this.log(`Burned ${this.consts.nameToken}: ${this.dd(_amount)}`);
    return _amount;
  }

  /**
   * Recalculates the liquidity pool ETH value based on a price.
   *
   * @param {number} _priceLpNew - The new price.
   * @return {number} The recalculated liquidity pool ETH value.
   */
  recalcLpEth(_priceLpNew = this.priceLp) {
    const priceLpNewSrt = Math.sqrt(_priceLpNew);
    let ans = 0;
    if (_priceLpNew < this.rangeBoundLower) {
      ans = (this.liquidityValue / this.rangeBoundLowerSqrt) - (this.liquidityValue / this.rangeBoundUpperSqrt);
    } else if (_priceLpNew < this.rangeBoundUpper) {
      ans = (this.liquidityValue / priceLpNewSrt) - (this.liquidityValue / this.rangeBoundUpperSqrt);
    }
    ans = this.decimalsEth(ans);
    return ans;
  }

  /**
   * Recalculates the liquidity pool token value based on a price.
   *
   * @param {number} _priceLpNew - The new price.
   * @return {number} The recalculated liquidity pool token value.
   */
  recalcLpToken(_priceLpNew = this.priceLp) {
    const priceLpNewSrt = Math.sqrt(_priceLpNew);
    let ans = 0;
    if (_priceLpNew > this.rangeBoundLower) {
      if (_priceLpNew < this.rangeBoundUpper) {
        ans = (this.liquidityValue * priceLpNewSrt) - (this.liquidityValue * this.rangeBoundLowerSqrt);
      } else {
        ans = (this.liquidityValue * this.rangeBoundUpperSqrt) - (this.liquidityValue * this.rangeBoundLowerSqrt);
      }
    }
    ans = this.decimals(ans);
    return ans;
  }

  /**
   * Recalculates the range bounds.
   *
   * @return {void}
   */
  recalcRangeBounds() {
    this.rangeBoundLower = this.priceLp * this.consts.rangeMultiplier;
    this.rangeBoundLowerSqrt = Math.sqrt(this.rangeBoundLower);
    this.rangeBoundLower = this.decimals(this.rangeBoundLower);

    this.rangeBoundUpper = this.priceLp / this.consts.rangeMultiplier;
    this.rangeBoundUpperSqrt = Math.sqrt(this.rangeBoundUpper);
    this.rangeBoundUpper = this.decimals(this.rangeBoundUpper);

    this.log(`rangeBoundLower: ${this.dd(this.rangeBoundLower)}`);
    this.log(`rangeBoundUpper: ${this.dd(this.rangeBoundUpper)}`);

    if (!this.liquidityValue) return;
    this.rangeMaxEth = this.recalcLpEth(this.rangeBoundLower);
    this.rangeMaxToken = this.recalcLpToken(this.rangeBoundUpper);

    this.log(`rangeMaxEth: ${this.rangeMaxEth}`);
    this.log(`rangeMaxToken: ${this.dd(this.rangeMaxToken)}`);
  }

  /**
   * Recalculates the liquidity value based on the current price and range bounds.
   * Calculations from https://science.flipsidecrypto.xyz/uniswapv3/
   * https://docs.google.com/spreadsheets/d/1goPI19krWui3ryZDa6rG7p1P_UONKyhPekOVfIfM_-8/edit#gid=0
   *
   * @return {void}
   */
  recalcLiquidityValue() {
    if (this.priceLp <= this.rangeBoundLower) {
      this.liquidityValue = (this.lpEth * this.rangeBoundLowerSqrt * this.rangeBoundUpperSqrt) / (this.rangeBoundUpperSqrt - this.rangeBoundLowerSqrt);
    } else if (this.priceLp <= this.rangeBoundUpper) {
      this.liquidityValue = Math.min(
        (this.lpEth * (this.rangeBoundUpperSqrt * this.priceLpSqrt)) / (this.rangeBoundUpperSqrt - this.priceLpSqrt),
        this.lpToken / (this.priceLpSqrt - this.rangeBoundLowerSqrt),
      );
    } else {
      this.liquidityValue = this.lpEth / (this.rangeBoundUpperSqrt - this.rangeBoundLowerSqrt);
    }

    if (this.liquidityValue <= 0) {
      this.exit('recalcLiquidityValue: invalid value');
    }
    this.liquidityValue = this.decimals(this.liquidityValue);

    this.log(`liquidityValue: ${this.dd(this.liquidityValue)}`);
  }

  /**
   * Recalculates the liquidity pool price from the LP ETH amount.
   * Preconditions: initialized: this.recalcRangeBounds(), liquidityValue, lpEth
   *
   * @param {number} _lpEthNew - The new ETH amount. Default is the current ETH amount.
   * @return {number} The recalculated liquidity pool price.
   */
  recalcLpPriceFromLpEth(_lpEthNew = this.lpEth) {
    if (_lpEthNew < 0 || _lpEthNew > this.rangeMaxEth) {
      this.exit('recalcLpPriceFromLpEth: invalid _lpEthNew');
    }
    const ans = this.decimals(((this.liquidityValue * this.rangeBoundUpperSqrt) / ((this.rangeBoundUpperSqrt * _lpEthNew) + this.liquidityValue)) ** 2);
    return ans;
  }

  /**
   * Recalculates the liquidity pool price from the LP token amount.
   * Preconditions: initialized: this.recalcRangeBounds(), liquidityValue, lpToken
   *
   * @param {number} _lpTokenNew - The new token amount. Default is the current token amount.
   * @return {number} The recalculated liquidity pool price.
   */
  recalcLpPriceFromLpToken(_lpTokenNew = this.lpToken) {
    if (_lpTokenNew < 0 || _lpTokenNew > this.rangeMaxToken) {
      this.exit('recalcLpPriceFromLpToken: invalid _lpTokenNew');
    }
    const ans = this.decimals((((this.liquidityValue * this.rangeBoundLowerSqrt) + _lpTokenNew) / this.liquidityValue) ** 2);
    return ans;
  }

  /**
   * Recalculates the price of the LP.
   *
   * @param {boolean} _isBalanced - Indicates if the pool is balanced.
   * @return {void}
   */
  recalcPriceLp(_isBalanced = false) {
    if (_isBalanced) {
      this.priceLp = (this.lpToken / this.lpEth);
    } else {
      this.priceLp = this.isLastTradeEth ? this.recalcLpPriceFromLpEth() : this.recalcLpPriceFromLpToken();
    }
    this.priceLpSqrt = Math.sqrt(this.priceLp);
    this.priceLp = this.decimals(this.priceLp);

    this.log(`priceLp: ${this.dd(this.priceLp)}`);
  }

  /**
   * Calculates the circulating supply of token (aka "float").
   *
   * @return {number} The circulating supply.
   */
  getTokenCirculatingSupply() {
    const ans = this.decimals(this.tokenTotalSupply - this.lpToken - this.lpFeesToken);
    if (ans < 0) {
      this.exit(`getTokenCirculatingSupply: invalid ans: ${ans}`);
    }
    return ans;
  }

  /**
   * Calculates the lifetime profit multiplier.
   *
   * @return {number} The lifetime profit multiplier.
   */
  getLifetimeProfitMult() {
    return (this.lifetimeProfitEth + this.lpFeesEth + (this.lpFeesToken / this.priceLp)) / this.consts.initialEth;
  }

  /**
   * Updates record properties.
   *
   * @return {void}
   */
  updateRecords() {
    if (this.lpEth < this.recordMinLpEth) {
      this.recordMinLpEth = this.lpEth;
    }
    if (this.lpEth > this.recordMaxLpEth) {
      this.recordMaxLpEth = this.lpEth;
    }
  }

  /**
   * Prints record properties.
   *
   * @return {void}
   */
  printRecords() {
    this.log(`recordMinLpEth: ${this.recordMinLpEth}`);
    this.log(`recordMaxLpEth: ${this.recordMaxLpEth}`);
  }

  /**
   * Asserts the safety of the system.
   *
   * @return {void}
   */
  assertSafety() {
    if (this.lpEth < this.consts.safetyMinEth) {
      this.exit('assertSafety: NOTICE: lpEth too low');
    }
    if (/* Math.abs */((this.priceOracleEth / this.priceLp) - 1) > LiquidityPoolSimulator.applyFeeAny(this.consts.safetyPriceToleranceBps)) {
      this.exit('assertSafety: NOTICE: price divergence');
    }
    // if (this.getLifetimeProfitMult() > this.consts.tradeDays) {
    //     this.exit(`assertSafety: NOTICE: lifetimeProfitMult too high`);
    // }
  }

  /**
   * Trades a specified amount of ETH for tokens.
   *
   * @param {_amount} _amount - The amount of ETH to be traded for tokens.
   * @return {number} The amount of tokens received from the trade.
   */
  tradeEthForToken(_amount) {
    if (_amount <= 0) {
      this.exit(`tradeEthForToken: invalid _amount: ${_amount}`);
    }
    const fee = this.decimalsEth(this.applyFeeLp(_amount));
    const amountIn = (_amount - fee);
    this.log(`tradeEthForToken: amountIn: ${amountIn} ETH`);
    this.log(`tradeEthForToken: fee: ${fee} ETH`);
    if (amountIn + this.lpEth > this.rangeMaxEth) {
      this.exit(`tradeEthForToken: _amount too large: ${_amount}`);
    }
    this.lpFeesEth += fee;
    this.lpEth += amountIn;
    const priceLpPre = this.priceLp;
    const lpTokenPre = this.lpToken;
    this.isLastTradeEth = true;
    this.recalcPriceLp();
    this.lpToken = this.recalcLpToken();
    const amountOut = this.decimals(lpTokenPre - this.lpToken);
    const avgPrice = this.decimals(amountOut / _amount);
    this.log(`Traded ${_amount} ETH for ${this.dd(amountOut)} ${this.consts.nameToken}. Avg price: ${this.dd(avgPrice)}`);

    const skew = (this.priceLp / this.rangeBoundLower) * 10;
    if (avgPrice < (this.priceLp - this.applyFeeLp(this.priceLp * skew))) {
      this.exit(`tradeEthForToken: avgPrice (${this.dd(avgPrice)}) too LOW`);
    }
    if (avgPrice > priceLpPre / 0.9) {
      this.exit(`tradeEthForToken: avgPrice (${this.dd(avgPrice)}) too HIGH`);
    }
    return amountOut;
  }

  /**
   * Trades a specified amount of tokens for ETH.
   *
   * @param {number} _amount - The amount of tokens to be traded for ETH.
   * @return {number} - The amount of ETH received from the trade.
   */
  tradeTokenForEth(_amount) {
    if (_amount <= 0) {
      this.exit(`tradeTokenForEth: invalid _amount: ${_amount}`);
    }
    const fee = this.decimals(this.applyFeeLp(_amount));
    const amountIn = (_amount - fee);
    this.log(`tradeTokenForEth: amountIn: ${amountIn} ${this.consts.nameToken}`);
    this.log(`tradeTokenForEth: fee: ${fee} ${this.consts.nameToken}`);
    if (amountIn + this.lpToken > this.rangeMaxToken) {
      this.exit(`tradeTokenForEth: _amount too large: ${_amount}`);
    }
    this.lpFeesToken += fee;
    this.lpToken += amountIn;
    const priceLpPre = this.priceLp;
    const lpEthPre = this.lpEth;
    this.isLastTradeEth = false;
    this.recalcPriceLp();
    this.lpEth = this.recalcLpEth();
    const amountOut = this.decimalsEth(lpEthPre - this.lpEth);
    const avgPrice = this.decimals(_amount / amountOut);
    this.log(`Traded ${this.dd(_amount)} ${this.consts.nameToken} for ${amountOut} ETH. Avg price: ${this.dd(avgPrice)}`);

    const skew = (this.priceLp / this.rangeBoundLower) * 10;
    if (avgPrice > (this.priceLp + this.applyFeeLp(this.priceLp * skew))) {
      this.exit(`tradeTokenForEth: avgPrice (${this.dd(avgPrice)}) too HIGH`);
    }
    if (avgPrice < priceLpPre * 0.9) {
      this.exit(`tradeTokenForEth: avgPrice (${this.dd(avgPrice)}) too LOW`);
    }
    return amountOut;
  }

  /**
   * Calculates the percentage of fees reserved by the protocol based on the safety ratio.
   *
   * @return {number} The percentage of fees reserved.
   */
  getFeesReservedPct() {
    if (this.initialTokenStaked <= 0) {
      return 1.00;
    }

    const safetyRatio = (this.lpEth / this.consts.safetyMinEth);

    if (safetyRatio > 50) return 0.85;
    if (safetyRatio > 20) return 0.90;
    if (safetyRatio > 10) return 0.95;
    if (safetyRatio > 5) return 0.99;

    return 1.00;
  }

  /**
   * Attempts to redeem LP token fees into LP ETH fees.
   *
   * @return {boolean} Whether redemption occurred.
   */
  tryRedeemLpFeesToken() {
    if (this.priceLp >= this.priceOracleEth) return false;

    const lpFeesRedeem = this.decimals(Math.min(
      // this.initialTokenStaked,
      this.lpFeesToken,
      (this.rangeMaxToken - this.lpToken),
      (100 * Math.min(this.priceLp, this.priceOracleEth)),
    ));
    if (lpFeesRedeem < (1 * this.priceOracleEth)) return false;

    this.log(`lpFeesTokenRedeem: tradeTokenForEth(${lpFeesRedeem});`);
    const lpFeesRedeemEth = this.tradeTokenForEth(lpFeesRedeem);
    this.lpFeesEth += lpFeesRedeemEth;
    this.lpFeesToken -= lpFeesRedeem;

    return true;
  }

  /**
   * Attempts to redeem LP ETH fees.
   *
   * @return {boolean} Whether redemption occurred.
   */
  tryRedeemLpFeesEth() {
    if (this.lpFeesEth < 1) return false;

    const lpFeesRedeemEthReserved = this.decimalsEth(this.lpFeesEth * this.getFeesReservedPct());
    this.reserveEth += lpFeesRedeemEthReserved;
    const profitEth = this.decimalsEth(this.lpFeesEth - lpFeesRedeemEthReserved);
    this.lifetimeProfitEth = this.decimalsEth(this.lifetimeProfitEth + profitEth);
    this.lifetimeProfitUSD = this.decimals(this.lifetimeProfitUSD + (profitEth * this.priceOracleEth));
    // this.initialTokenStaked -= (profitEth * this.priceOracleEth); // simulates initial investors unstaking/"taking profit"
    this.lpFeesEth = 0;

    return true;
  }

  /**
   * Rebalances the liquidity pool.
   *
   * @param {boolean} _isArb - Whether the rebalance is during arbitrage.
   * @return {void}
   */
  rebal(_isArb = false) {
    this.log('Rebal started.');

    if (!_isArb) {
      this.tryRedeemLpFeesToken();
      this.tryRedeemLpFeesEth();
    }

    this.lpEth += this.reserveEth;
    this.reserveEth = 0;

    let diffToken = this.decimals((this.priceLp * this.lpEth) - this.lpToken);
    if (diffToken > 0) {
      this.mint(diffToken);
      this.lpToken += diffToken;
    } else if (diffToken < 0) {
      diffToken = Math.min(this.lpToken, Math.abs(diffToken));
      this.burn(diffToken);
      this.lpToken -= diffToken;
    } else {
      // diffToken === 0
    }

    this.isPrinting = false;
    this.recalcPriceLp(true);
    this.recalcRangeBounds();
    this.recalcLiquidityValue();
    this.recalcRangeBounds();
    this.isPrinting = true;

    this.lpEth = this.decimalsEth(this.lpEth);
    this.lpToken = this.decimals(this.lpToken);

    this.printStats();
    this.log('Rebal complete.');
    this.log();
  }

  /**
   * Prints statistics.
   *
   * @return {void}
   */
  printStats() {
    this.log(`priceLp: ${this.dd(this.priceLp)}`);
    this.log(`rangeBoundLower: ${this.dd(this.rangeBoundLower)}`);
    this.log(`rangeBoundUpper: ${this.dd(this.rangeBoundUpper)}`);
    this.log(`rangeMaxEth: ${this.rangeMaxEth}`);
    this.log(`rangeMaxToken: ${this.dd(this.rangeMaxToken)}`);
    this.log(`liquidityValue: ${this.dd(this.liquidityValue)}`);
    this.log(`lpEth: ${this.lpEth}`);
    this.log(`lpToken: ${this.dd(this.lpToken)}`);
    this.log(`lpFeesEth: ${this.lpFeesEth}`);
    this.log(`lpFeesToken: ${this.dd(this.lpFeesToken)}`);
    this.log(`tokenTotalSupply: ${this.dd(this.tokenTotalSupply)}`);
    this.log(`tokenCirculatingSupply: ${this.dd(this.getTokenCirculatingSupply())}`);
    this.log(`lifetimeProfitEth: ${this.lifetimeProfitEth}`);
    this.log(`lifetimeProfitUSD: ${this.dd(this.lifetimeProfitUSD)}`);
    this.log(`lifetimeProfitMult: ${this.dd(this.getLifetimeProfitMult())} x`);
  }

  /**
   * Executes the main simulation.
   *
   * @return {void}
   */
  main() {
    for (let i = 0; i < this.consts.tradesTotal; i++) {
      this.log(`ACTION #${i}`);
      let deltaNew = this.priceOracleEth
        * LiquidityPoolSimulator.applyFeeAny(LiquidityPoolSimulator.getRandomInt(this.consts.deltaPriceOracleEthBps));
      const posNeg = (LiquidityPoolSimulator.getRandomInt(2) ? 1 : -1);
      deltaNew *= posNeg;
      // if (deltaNew < 0) deltaNew *= 0.999; // introduce tiny positive bias since price wants to trend down
      const priceNew = Math.max(this.consts.minPriceOracleEth, this.decimals(this.priceOracleEth + deltaNew));
      this.setPriceOracleEth(priceNew);

      // do a trade
      switch (LiquidityPoolSimulator.getRandomInt(2)) {
        case 0: {
          const maxEth = Math.min(this.consts.tradeMaxEth, this.decimalsEth(this.rangeMaxEth - this.lpEth));
          const amountEth = LiquidityPoolSimulator.getRandomInt(maxEth);
          if (amountEth < this.consts.tradeMinEth) break;
          this.log(`tradeEthForToken(${amountEth});`);
          this.tradeEthForToken(amountEth);
          break;
        }
        case 1: {
          const maxToken = Math.min(this.consts.tradeMaxToken, this.decimals(this.rangeMaxToken - this.lpToken), this.getTokenCirculatingSupply());
          const amountToken = LiquidityPoolSimulator.getRandomInt(maxToken);
          if (amountToken < this.consts.tradeMinToken) break;
          this.log(`tradeTokenForEth(${amountToken});`);
          this.tradeTokenForEth(amountToken);
          break;
        }
        default: {
          this.exit('switch: FAIL');
          break;
        }
      }

      const isArb = this.tryArb();
      if (!isArb) {
        if (i % 5 === 4) {
          this.rebal();
        } else {
          this.log();
        }
      }
      this.updateRecords();
      this.assertSafety();
      if ((this.priceOracleEth * this.lifetimeProfitEth) > this.initialTokenStaked) {
        // this.initialTokenStaked = 0; // "sell" it all // TODO: improve this
      }
    }

    return this.exit('PASS', false);
  }

  /**
   * Attempts to perform an arbitrage operation.
   * NOTE: OVERRIDE THIS
   *
   * @return {boolean} Whether arbitrage was performed.
   */
  tryArb() {
    this.log('tryArb: not overridden');
    return false;
  }
}
// /class

function setup() {
  program
    .option('-s, --seed <int>', 'seed number');
  program.parse();
  const args = program.opts();
  seed = Number(args.seed);
  seed = seed || LiquidityPoolSimulator.getRandomInt();
  seedrandom(seed, { global: true });
}

setup();

export default LiquidityPoolSimulator;
