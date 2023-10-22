document.addEventListener('DOMContentLoaded', () => {
  let selectedAccount;
  if (typeof window.ethereum === 'undefined') {
    alert('Install MetaMask at https://metamask.io/ to proceed.');
    return;
  } else {
    ethereum.request({ method: 'eth_accounts' }).then((accounts) => {
      if (accounts.length > 0) {
        onEthereumConnect(accounts);
      }
    });
  }

  ethereumEnableButton.addEventListener('click', async () => {
    onEthereumConnect(await ethereum.request({ method: 'eth_requestAccounts' }));
  });

  async function onEthereumConnect(accounts) {
    const chainId = +(await ethereum.request({ method: 'eth_chainId' }));
    let firstInstanceWithChainIdIndex;

    cometInstances.forEach((instance, i) => {
      if (instance.chainId === chainId) {
        const newOption = document.createElement('option');
        newOption.value = instance.value;
        newOption.innerText = instance.name;
        instanceSelectBox.append(newOption);

        if (isNaN(firstInstanceWithChainIdIndex)) {
          firstInstanceWithChainIdIndex = i;
        }
      }
    });

    selectedAccount = ethers.utils.getAddress(accounts[0]);
    instanceSelectBox.classList.remove(hidden);
    ethereumEnableButton.classList.add(hidden);

    instanceSelectBox.onchange = (event) => {
      const i = cometInstances.findIndex(_ => _.value === event.target.value);
      renderUi(i);
    };

    renderUi(firstInstanceWithChainIdIndex); // renders options for the first Compound III instance in constants.js
  }

  async function renderUi(instanceIndex) {
    const instance = cometInstances[instanceIndex];
    const base = instance.contracts.assets[0];
    const collaterals = instance.contracts.assets.map(o => o['symbol']).slice(1, Infinity);

    collateralSelectBox.innerHTML = '';
    collaterals.forEach((collateral, i) => {
      const opt = document.createElement('option');
      opt.innerHTML = collateral;
      collateralSelectBox.appendChild(opt);
    });

    const aprs = await getAprs(instance);
    supplyAprElement.innerHTML = (aprs[0]).toFixed(2);
    borrowAprElement.innerHTML = (aprs[1]).toFixed(2);

    baseSupplyButton.onclick = () => {
      supply(instance, 0, +baseSupplyTextBox.value);
    };

    baseWithdrawButton.onclick = async () => {
      withdraw(instance, 0, +baseWithdrawTextBox.value);
    };

    collateralSupplyButton.onclick = async () => {
      const index = collateralSelectBox.selectedIndex;
      supply(instance, index + 1, +collateralSupplyTextBox.value);
    };

    collateralWithdrawButton.onclick = async () => {
      const index = collateralSelectBox.selectedIndex;
      withdraw(instance, index + 1, +collateralWithdrawTextBox.value);
    };

    drawBalances(instance);
  }

  async function getAprs(instance) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const comet = new ethers.Contract(instance.contracts.v3, cometAbi, provider);

    const secondsPerYear = 60 * 60 * 24 * 365;
    const utilization = await comet.callStatic.getUtilization();

    const supplyRate = await comet.callStatic.getSupplyRate(utilization);
    const supplyApr = +(supplyRate).toString() / 1e18 * secondsPerYear * 100;

    const borrowRate = await comet.callStatic.getBorrowRate(utilization);
    const borrowApr = +(borrowRate).toString() / 1e18 * secondsPerYear * 100;
    
    return [supplyApr, borrowApr];
  }

  async function supply(instance, assetIndex, amount) {
    try {
      const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
      const comet = new ethers.Contract(instance.contracts.v3, cometAbi, signer);
      const assetData = instance.contracts.assets[assetIndex];
      const scaledUpAmount = (amount * Math.pow(10, assetData.decimals)).toString();

      const asset = new ethers.Contract(assetData.address, erc20Abi, signer);

      // Approve
      let tx = await asset.approve(instance.contracts.v3, scaledUpAmount);
      let receipt = await tx.wait(1);

      // Supply to Compound III
      tx = await comet.supply(assetData.address, scaledUpAmount);
      receipt = await tx.wait(1);

      drawBalances(instance);

      console.log('supply trx receipt', receipt);
    } catch(e) {
      console.error('[supply]', assetIndex, e);
    }
  }

    async function withdraw(instance, assetIndex, amount) {
    try {
      const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
      const comet = new ethers.Contract(instance.contracts.v3, cometAbi, signer);
      const assetData = instance.contracts.assets[assetIndex];
      const scaledUpAmount = (amount * Math.pow(10, assetData.decimals)).toString();

      // Withdraw to Compound III
      tx = await comet.withdraw(assetData.address, scaledUpAmount);
      receipt = await tx.wait(1);

      drawBalances(instance);

      console.log('withdraw trx receipt', receipt);
    } catch(e) {
      console.error('[withdraw]', assetIndex, e);
    }
  }

  async function drawBalances(instance) {
    const balances = await getBalances(instance);

    balancesContainer.innerHTML = '';

    balances.forEach((balance, i) => {
      balancesContainer.innerHTML += `
        <label>
          ${instance.contracts.assets[i].symbol}: ${balance}
        </label>
        <br />
      `;
    });
  }

  async function getBalances(instance) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const comet = new ethers.Contract(instance.contracts.v3, cometAbi, provider);
    const balanceFetches = [];
    instance.contracts.assets.forEach((asset, i) => {
      let promise;

      if (i === 0) {
        promise = comet.callStatic.userBasic(selectedAccount);
      } else {
        promise = comet.callStatic.collateralBalanceOf(selectedAccount, asset.address);
      }

      balanceFetches.push(promise);
    });

    const result = await Promise.all(balanceFetches);

    // Find the account's base asset borrow or supply balance
    if (+result[0][0].toString() > 0) {
      result[0] = await comet.callStatic.balanceOf(selectedAccount);
    } else {
      result[0] = (await comet.callStatic.borrowBalanceOf(selectedAccount)) * -1;
    }

    // Convert results from BigNumber to decimal
    result.forEach((bal, i) => {
      result[i] = +bal / Math.pow(10, instance.contracts.assets[i].decimals);
    });

    return result;
  }
});
