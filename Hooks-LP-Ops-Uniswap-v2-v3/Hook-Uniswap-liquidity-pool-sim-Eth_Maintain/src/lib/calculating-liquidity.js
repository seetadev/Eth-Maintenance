// https://uniswapv3book.com/docs/milestone_1/calculating-liquidity/

// consts
const q96 = 2**96;

class CL {
}

CL.prototype.price_to_sqrtp = function(_p) {
    return Math.floor(Math.sqrt(_p) * q96);
}

CL.prototype.liquidity0 = function(_amount, _pa, _pb) {
    if (_pa > _pb) {
        const temp = _pa;
        _pa = _pb;
        _pb = temp;
    }
    return (_amount * (_pa * _pb) / q96) / (_pb - _pa);
}

CL.prototype.liquidity1 = function(_amount, _pa, _pb) {
    if (_pa > _pb) {
        const temp = _pa;
        _pa = _pb;
        _pb = temp;
    }
    return (_amount * q96) / (_pb - _pa);
}

// sqrtp_low = price_to_sqrtp(4545);
// sqrtp_cur = price_to_sqrtp(5000);
// sqrtp_upp = price_to_sqrtp(5500);
// liq0 = liquidity0(amount_eth, sqrtp_cur, sqrtp_upp);
// liq1 = liquidity1(amount_usdc, sqrtp_cur, sqrtp_low);
// liq = Math.floor(Math.min(liq0, liq1));

CL.prototype.calc_amount0 = function(_liq, _pa, _pb) {
    if (_pa > _pb) {
        const temp = _pa;
        _pa = _pb;
        _pb = temp;
    }
    return Math.floor(_liq * q96 * (_pb - _pa) / _pa / _pb);
}

CL.prototype.calc_amount1 = function(_liq, _pa, _pb) {
    if (_pa > _pb) {
        const temp = _pa;
        _pa = _pb;
        _pb = temp;
    }
    return Math.floor(_liq * (_pb - _pa) / q96);
}

// amount0 = calc_amount0(liq, sqrtp_upp, sqrtp_cur);
// amount1 = calc_amount1(liq, sqrtp_low, sqrtp_cur);

module.exports = new CL();

// USAGE:
// var hcl;
// try {
//     hcl = require('./helpers/calculating-liquidity');
// } catch (e) {
//     console.log(`calculating-liquidity: FAIL`);
// }
