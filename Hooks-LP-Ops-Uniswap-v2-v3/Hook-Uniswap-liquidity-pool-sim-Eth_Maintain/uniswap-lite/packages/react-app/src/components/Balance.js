import React from "react";
import { formatUnits, parseUnits } from "ethers/lib/utils";

import styles from "../styles";

const Balance = ({ tokenBalance }) => {
  return (
    <div className={styles.balance}>
      <p className={styles.balanceText}>
        {tokenBalance ? (
          <>
            <span className={styles.balanceBold}>Balance: </span>
            {parseFloat(formatUnits(tokenBalance ?? parseUnits("0"))).toLocaleString()}
          </>
        ) : (
          ""
        )}
      </p>
    </div>
  );
};

export default Balance;
