// packages
// eslint-disable-next-line object-curly-newline
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
// eslint-disable-next-line import/extensions
import LiquidityPoolSimulator from '../index.js';

describe('LiquidityPoolSimulator', () => {
  let instance;
  let spyConsoleLog;
  // let spyProcessExit;

  beforeEach(() => {
    spyConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    // spyProcessExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

    instance = new LiquidityPoolSimulator();
    spyConsoleLog.mockClear(); // because it's called in constructor
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be an instanceof LiquidityPoolSimulator', () => {
    expect(instance instanceof LiquidityPoolSimulator).toBeTruthy();
  });

  it('should correctly parse config', () => {
    const priceOracleEthCustom = 1630;
    const tradeDaysCustom = 1;
    const config = {
      priceOracleEth: priceOracleEthCustom,
      consts: {
        tradeDays: tradeDaysCustom,
      },
    };
    instance = new LiquidityPoolSimulator(config);

    expect(instance.priceOracleEth).toBe(priceOracleEthCustom);
    expect(instance.consts.tradeDays).toBe(tradeDaysCustom);
  });

  it('should throw when attempting to write to consts', () => {
    expect(() => { instance.consts.tradeDays = 1; }).toThrow();
  });

  it('should correctly implement method getRandomInt', () => {
    const max = 100;
    const num = LiquidityPoolSimulator.getRandomInt(max);
    expect(num).toBeLessThan(max);
    expect(num).toBeGreaterThanOrEqual(0);
  });

  it('should correctly implement method log', () => {
    const msg = 'hello';

    instance.isPrinting = false;
    instance.log(msg);
    expect(spyConsoleLog).not.toHaveBeenCalled();

    instance.isPrinting = true;
    instance.log(msg);
    expect(spyConsoleLog).toHaveBeenCalledWith(msg);
  });

  it('should correctly implement method exit and throw only when isError', () => {
    const msg = 'goodbye';
    let code = null;

    expect(() => { code = instance.exit(msg); }).toThrow();
    expect(code).toBeNull();

    expect(() => { code = instance.exit(msg, false); }).not.toThrow();
    expect(code).toBe(0);
  });

  it('should correctly implement method setLpEth', () => {
    const lpEth = 100;
    instance.setLpEth(lpEth);
    expect(instance.lpEth).toBe(lpEth);
  });

  it('should correctly implement method setLpToken', () => {
    const lpToken = 100;
    instance.setLpToken(lpToken);
    expect(instance.lpToken).toBe(lpToken);
  });

  it('should correctly implement method setReserveEth', () => {
    const reserveEth = 100;
    instance.setReserveEth(reserveEth);
    expect(instance.reserveEth).toBe(reserveEth);
  });

  it('should correctly implement method setPriceOracleEth', () => {
    const priceOracleEth = 100;
    instance.setPriceOracleEth(priceOracleEth);
    expect(instance.priceOracleEth).toBe(priceOracleEth);
  });

  it('should correctly implement method mint', () => {
    expect(() => { instance.mint(0); }).toThrow();
    expect(() => { instance.mint(-1); }).toThrow();
    const { tokenTotalSupply } = instance;
    const amount = 100;
    instance.mint(amount);
    expect(instance.tokenTotalSupply).toBe(tokenTotalSupply + amount);
  });

  it('should correctly implement method burn', () => {
    expect(() => { instance.burn(0); }).toThrow();
    expect(() => { instance.burn(-1); }).toThrow();
    const { tokenTotalSupply } = instance;
    const amount = 100;
    instance.burn(amount);
    expect(instance.tokenTotalSupply).toBe(tokenTotalSupply - amount);
  });

  it('should correctly implement method recalcLpEth', () => {
    let priceLpNew;
    let expected;
    let retval;

    priceLpNew = 2000;
    expected = 250;
    retval = instance.recalcLpEth(priceLpNew);
    expect(Math.round(retval)).toBe(expected);

    priceLpNew = 1500;
    expected = 382;
    retval = instance.recalcLpEth(priceLpNew);
    expect(Math.round(retval)).toBe(expected);

    priceLpNew = 1900;
    expected = 272;
    retval = instance.recalcLpEth(priceLpNew);
    expect(Math.round(retval)).toBe(expected);
  });

  it('should correctly implement method recalcLpToken', () => {
    let priceLpNew;
    let expected;
    let retval;

    priceLpNew = 2000;
    expected = 500000;
    retval = instance.recalcLpToken(priceLpNew);
    expect(Math.round(retval)).toBe(expected);

    priceLpNew = 1500;
    expected = 271291;
    retval = instance.recalcLpToken(priceLpNew);
    expect(Math.round(retval)).toBe(expected);

    priceLpNew = 1900;
    expected = 456775;
    retval = instance.recalcLpToken(priceLpNew);
    expect(Math.round(retval)).toBe(expected);
  });

  it('should correctly implement method recalcRangeBounds (called in constructor)', () => {
    expect(instance.priceLp).toBe(2000);

    // expect(instance.consts.rangeMultiplier).toBe(0.8);
    // const rangeBoundLower = 1600;
    // const rangeBoundUpper = 2500;
    // expect(instance.consts.rangeMultiplier).toBe(0.01);
    // const rangeBoundLower = 20;
    // const rangeBoundUpper = 200000;
    expect(instance.consts.rangeMultiplier).toBe(0.5);
    const rangeBoundLower = 1000;
    const rangeBoundUpper = 4000;

    expect(instance.rangeBoundLower).toBe(rangeBoundLower);
    expect(instance.rangeBoundUpper).toBe(rangeBoundUpper);
  });

  it('should correctly implement method recalcLiquidityValue (called in constructor)', () => {
    expect(instance.priceLp).toBe(2000);

    // expect(instance.consts.rangeMultiplier).toBe(0.8);
    // const liquidityValue = 105901.699437;
    // expect(instance.consts.rangeMultiplier).toBe(0.01);
    // const liquidityValue = 12422.599875;
    expect(instance.consts.rangeMultiplier).toBe(0.5);
    const liquidityValue = 38172.068076;

    expect(instance.liquidityValue).toBe(liquidityValue);
  });

  it('should correctly implement method recalcLpPriceFromLpEth', () => {
    let lpEthNew;
    let expected;
    let retval;

    lpEthNew = 300;
    expected = 1784.776091;
    retval = instance.recalcLpPriceFromLpEth(lpEthNew);
    expect(retval).toBe(expected);

    lpEthNew = 150;
    expected = 2566.039414;
    retval = instance.recalcLpPriceFromLpEth(lpEthNew);
    expect(retval).toBe(expected);

    lpEthNew = 190;
    expected = 2313.870644;
    retval = instance.recalcLpPriceFromLpEth(lpEthNew);
    expect(retval).toBe(expected);
  });

  it('should correctly implement method recalcLpPriceFromLpToken', () => {
    let lpTokenNew;
    let expected;
    let retval;

    lpTokenNew = 600000;
    expected = 2241.17749;
    retval = instance.recalcLpPriceFromLpToken(lpTokenNew);
    expect(retval).toBe(expected);

    lpTokenNew = 400000;
    expected = 1772.54834;
    retval = instance.recalcLpPriceFromLpToken(lpTokenNew);
    expect(retval).toBe(expected);

    lpTokenNew = 550000;
    expected = 2118.873016;
    retval = instance.recalcLpPriceFromLpToken(lpTokenNew);
    expect(retval).toBe(expected);
  });

  it('should correctly implement method getTokenCirculatingSupply', () => {
    let expected;
    let retval;

    expected = 0;
    retval = instance.getTokenCirculatingSupply();
    expect(retval).toBe(expected);

    instance.tradeEthForToken(100);
    expected = 178544.915644;
    retval = instance.getTokenCirculatingSupply();
    expect(retval).toBe(expected);
  });

  it('should correctly implement method getLifetimeProfitMult', () => {
    let expected;
    let retval;

    expected = 0;
    retval = instance.getLifetimeProfitMult();
    expect(retval).toBe(expected);

    instance.tradeEthForToken(100);
    expected = 0.0012;
    retval = instance.getLifetimeProfitMult();
    expect(retval).toBe(expected);
  });

  it('should correctly implement methods: tradeEthForToken, recalcPriceLp (called in trades)', () => {
    expect(instance.priceLp).toBe(2000);

    let expected;

    instance.tradeEthForToken(100);
    expected = 1603.521037;
    expect(instance.priceLp).toBe(expected);

    instance.tradeEthForToken(100);
    expected = 1314.235168;
    expect(instance.priceLp).toBe(expected);

    instance.tradeEthForToken(50);
    expected = 1198.105865;
    expect(instance.priceLp).toBe(expected);
  });

  it('should correctly implement methods: tradeTokenForEth, recalcPriceLp (called in trades)', () => {
    expect(instance.priceLp).toBe(2000);

    let expected;

    instance.tradeTokenForEth(1000);
    expected = 2002.336798;
    expect(instance.priceLp).toBe(expected);

    instance.tradeTokenForEth(1000);
    expected = 2004.674961;
    expect(instance.priceLp).toBe(expected);

    instance.tradeTokenForEth(500);
    expected = 2005.844554;
    expect(instance.priceLp).toBe(expected);
  });

  it('should correctly implement method getFeesReservedPct', () => {
    const feesReservedPct = instance.getFeesReservedPct();
    const expected = 1.00;

    expect(feesReservedPct).toBe(expected);
  });

  it('should correctly implement method tryRedeemLpFeesToken', () => {
    let retval;

    retval = instance.tryRedeemLpFeesToken();
    expect(retval).toBe(false);

    for (let i = 0; i < 100; i++) {
      instance.tradeEthForToken(100);
      instance.tradeTokenForEth(100 * instance.priceLp);
      instance.rebal(true); // pass 'true' so tryRedeemLpFees* isn't called
    }

    retval = instance.tryRedeemLpFeesToken();
    expect(retval).toBe(true);

    instance.tradeTokenForEth(1000);
    retval = instance.tryRedeemLpFeesToken();
    expect(retval).toBe(false);
  });

  it('should correctly implement method tryRedeemLpFeesEth', () => {
    let retval;

    retval = instance.tryRedeemLpFeesEth();
    expect(retval).toBe(false);

    for (let i = 0; i < 100; i++) {
      instance.tradeEthForToken(100);
      instance.rebal(true); // pass 'true' so tryRedeemLpFees* isn't called
    }

    retval = instance.tryRedeemLpFeesEth();
    expect(retval).toBe(true);

    instance.tradeTokenForEth(1000);
    retval = instance.tryRedeemLpFeesEth();
    expect(retval).toBe(false);
  });

  it('should correctly implement method rebal', () => {
    let retval;
    let expected;

    expected = Math.round(instance.lpToken);
    retval = Math.round(instance.lpEth * instance.priceLp);
    expect(retval).toBe(expected);

    instance.tradeEthForToken(100);
    expected = Math.round(instance.lpToken);
    retval = Math.round(instance.lpEth * instance.priceLp);
    expect(retval).not.toBe(expected);

    instance.rebal();
    expected = Math.round(instance.lpToken);
    retval = Math.round(instance.lpEth * instance.priceLp);
    expect(retval).toBe(expected);
  });

  it('should correctly implement method printStats', () => {
    expect(spyConsoleLog).not.toHaveBeenCalled();

    instance.printStats();
    expect(spyConsoleLog).toHaveBeenCalled();
  });

  // it('should correctly implement method main', () => {
  //   // instance.main();
  //   expect(false).toBeTruthy();
  // });

  it('should correctly implement method (SKELETON) tryArb', () => {
    expect(instance.tryArb()).toBe(false);
  });
});
