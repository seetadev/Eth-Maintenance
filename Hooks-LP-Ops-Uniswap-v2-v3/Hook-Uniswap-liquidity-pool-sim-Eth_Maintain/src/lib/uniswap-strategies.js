// https://github.com/DefiLab-xyz/uniswap-v3-simulator/blob/main/src/helpers/uniswap/strategies.js

class US {
}

US.prototype.strategyV3 = function(inputs) {
    const token1V2 = inputs.investment / 2;
    const token2V2 = token1V2 / inputs.currentPrice;
    const L = Math.sqrt((token1V2 * token2V2));
    const L2 = token1V2 * token2V2;
    const T = L * Math.sqrt(inputs.minPrice);
    const H = L / Math.sqrt(inputs.maxPrice);
    const maxToken2 = (L2 / H) - T;
    const maxToken1 = (L2 / T) - H;

    const LP_a = inputs.currentPrice > inputs.maxPrice ? 0 : ((L / Math.sqrt(inputs.currentPrice) - H) * inputs.currentPrice);
    const LP_b = inputs.currentPrice > inputs.maxPrice ? maxToken2 : (L * Math.sqrt(inputs.currentPrice) - T);
    const LP = LP_a + LP_b;
    const multiplier = inputs.currentPrice > inputs.minPrice ? inputs.investment / LP : inputs.investment / (inputs.currentPrice * maxToken1);

    const step = inputs.step ? inputs.step / 100 : inputs.currentPrice / 100;
    const from = 0;

    const data = [...Array(200)].map((_, i) => {
        const price = from + i * step;
        let x, y, value;

        if (price < inputs.minPrice) {
            x = maxToken1 * multiplier;
            y = 0;
            value = x * price;
        } else if ((price >= inputs.minPrice) && (price <= inputs.maxPrice)) {
            x = (L / Math.sqrt(price) - H) * multiplier;
            y = (L * Math.sqrt(price) - T) * multiplier;
            value = (x * price) + y;
        } else if (price > inputs.maxPrice) {
            x = 0;
            y = maxToken2 * multiplier;
            value = y;
        }

        return { x: price, y: value, token: x, base: y }
    });

    return data;
}

module.exports = new US();

// USAGE:
// var hus;
// try {
//     hus = require('./helpers/uniswap-strategies');
//     console.log(hus.strategyV3({
//         currentPrice: 2000,
//         minPrice: 2000 * .8,
//         maxPrice: 2000 / .8,
//         investment: 500000,
//     }));
//     return;
// } catch (e) {
//     console.log(`uniswap-strategies: FAIL`);
// }
