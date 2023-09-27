import { waitForAppScreen, zemu, genericTx, nano_models, SPECULOS_ADDRESS, pluginName, jestTimeOut, ethereum_network, txFromEtherscan, ledgerPath } from '../test.fixture';
import { ethers } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";

const contractAddr = "0xcdd374f491fbf3f4fcf6e9023c99043774005137";
const testNetwork = ethereum_network;
const abi_path = `../../networks/${testNetwork.name}/${pluginName}/abis/` + contractAddr + '.json';
const abi = require(abi_path);

nano_models.forEach(function (model) {
  jest.setTimeout(jestTimeOut)
  test('[Nano ' + model.letter + " " + testNetwork.name + '] Vault Steth Deposit with beneficiary', zemu(model, testNetwork.name, async (sim, eth) => {
    // The rawTx of the tx up above is accessible through: https://etherscan.io/getRawTx?tx=0xa475adc06bd9c1e43fe23807570ff448b8275dc2b662086b6d86eb8a4b5925d1
    const serializedTx = txFromEtherscan("0x02f8b1014884773594008506c088e2008303aad894cdd374f491fbf3f4fcf6e9023c9904377400513780b8446e553f6500000000000000000000000000000000000000000000000029a3496967a31d0900000000000000000000000066a3f657468c7568da01884afb96b7dac631d87ec080a0efa7a2745693ac6a93cd88aee644980a19c8e8c245fb44f7f4524a7a51bbad09a0624d22438b0c8e39d784880fdbecbcab5999faa76eebf07cfa0fdebf4b67b6a4");
    const tx = eth.signTransaction(ledgerPath, serializedTx);
    const right_clicks = model.letter === 'S' ? 9 : 5;
    await waitForAppScreen(sim);
    await sim.navigateAndCompareSnapshots('.', testNetwork.name + '/' + model.name + '_vault_steth_deposit_with_beneficiary', [right_clicks, 0]);
    await tx;
  }));
});

nano_models.forEach(function (model) {
  jest.setTimeout(jestTimeOut)
  test('[Nano ' + model.letter + " " + testNetwork.name + '] Vault Steth Deposit', zemu(model, testNetwork.name, async (sim, eth) => {
    const contract = new ethers.Contract(contractAddr, abi);
    const amount = parseUnits("3000322493818019081", 'wei');
    const to = SPECULOS_ADDRESS;
    const { data } = await contract.populateTransaction.deposit(amount, to);
    let unsignedTx = genericTx;
    unsignedTx.to = contractAddr;
    unsignedTx.data = data;
    unsignedTx.value = parseEther("0");
    const serializedTx = ethers.utils.serializeTransaction(unsignedTx).slice(2);
    const tx = eth.signTransaction(ledgerPath, serializedTx);
    const right_clicks = model.letter === 'S' ? 6 : 4;
    await waitForAppScreen(sim);
    await sim.navigateAndCompareSnapshots('.', testNetwork.name + '/' + model.name + '_vault_steth_deposit', [right_clicks, 0]);
    await tx;
  }));
});

