# Liquidity Pool Simulator for Uniswap v2 and v3 module of for Eth Maintenance

We wish to develop a Uniswap hook to simulate uniswap lp trades between ETH and an arbitrary token, to enable optimal inventory asset price management, control.

To install:
```
pnpm i
```

To run:
```
pnpm start
```

To run w/ seed:
```
pnpm start --seed 1
```

You can pass a `config` in to `LiquidityPoolSimulator()` - see the constructor for props.

## Arb

The real magic happens when you extend LiquidityPoolSimulator with Arb in arb.js:
```
import LiquidityPoolSimulator from '../index.js';

class Arb extends LiquidityPoolSimulator {
  tryArb() {
    ...
  }
}
```

Then run:
```
pnpm arb
```

