import { waitForAppScreen, zemu, genericTx, nano_models, SPECULOS_ADDRESS, pluginName, ethereum_network, jestTimeOut, txFromEtherscan, ledgerPath } from '../test.fixture';
import { ethers } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";

const contractAddr = "0xcdd374f491fbf3f4fcf6e9023c99043774005137";
const testNetwork = ethereum_network;
const abi_path = `../../networks/${testNetwork.name}/${pluginName}/abis/` + contractAddr + '.json';
const abi = require(abi_path);

nano_models.forEach(function (model) {
  jest.setTimeout(jestTimeOut)
  test('[Nano ' + model.letter + " " + testNetwork.name + '] Vault Steth Withdraw with beneficiary', zemu(model, testNetwork.name, async (sim, eth) => {
    // The rawTx of the tx up above is accessible through: https://etherscan.io/getRawTx?tx=0x8e3b15c2ba676272ddcfdf17e8682da4c1c7dfa45dfe2bcea3d0d1e1476f1bd1
    const serializedTx = txFromEtherscan("0x02f8d1013e8405f5e100850a2feef81f8303a45894cdd374f491fbf3f4fcf6e9023c9904377400513780b864b460af9400000000000000000000000000000000000000000000000000005af3107a3fff000000000000000000000000d6cfdea600e260ab9a3d1ca72ed35f13c87ecc59000000000000000000000000d6cfdea600e260ab9a3d1ca72ed35f13c87ecc59c080a0c2474c81edf0cd1c01cea31770a43e9bff1b005f54e69e26fb578d85614041e2a00db81a3438a5366937e597ece8394b986a09b8ce4aaabae618624a5748cb59ad");
    const tx = eth.signTransaction(ledgerPath, serializedTx);
    const right_clicks = model.letter === 'S' ? 11 : 5;
    await waitForAppScreen(sim);
    await sim.navigateAndCompareSnapshots('.', testNetwork.name + '/' + model.name + '_vault_steth_withdraw_with_beneficiary', [right_clicks, 0]);
    await tx;
  }));
});

nano_models.forEach(function (model) {
  jest.setTimeout(jestTimeOut)
  test('[Nano ' + model.letter + " " + testNetwork.name + '] Vault Steth Withdraw', zemu(model, testNetwork.name, async (sim, eth) => {
    const contract = new ethers.Contract(contractAddr, abi);
    const amount = parseUnits("100000322493818019081", 'wei');
    const receiver = SPECULOS_ADDRESS;
    const owner = SPECULOS_ADDRESS;
    const { data } = await contract.populateTransaction.withdraw(amount, receiver, owner);
    let unsignedTx = genericTx;
    unsignedTx.to = contractAddr;
    unsignedTx.data = data;
    unsignedTx.value = parseEther("0");
    const serializedTx = ethers.utils.serializeTransaction(unsignedTx).slice(2);
    const tx = eth.signTransaction(ledgerPath, serializedTx);
    const right_clicks = model.letter === 'S' ? 6 : 4;
    await waitForAppScreen(sim);
    await sim.navigateAndCompareSnapshots('.', testNetwork.name + '/' + model.name + '_vault_steth_withdraw', [right_clicks, 0]);
    await tx;
  }));
});

