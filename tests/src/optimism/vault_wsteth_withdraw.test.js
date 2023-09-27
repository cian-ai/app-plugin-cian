import { waitForAppScreen, zemu, genericTx, nano_models, SPECULOS_ADDRESS, pluginName, jestTimeOut, optimism_network, ledgerPath } from '../test.fixture';
import { ethers } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";

const contractAddr = "0x907883da917ca9750ad202ff6395c4c6ab14e60e";
const testNetwork = optimism_network;
const abi_path = `../../networks/${testNetwork.name}/${pluginName}/abis/` + contractAddr + '.json';
const abi = require(abi_path);

nano_models.forEach(function (model) {
  jest.setTimeout(jestTimeOut)
  test('[Nano ' + model.letter + " " + testNetwork.name + '] Vault Withdraw Wsteth', zemu(model, testNetwork.name, async (sim, eth) => {
    const contract = new ethers.Contract(contractAddr, abi);
    const amount = parseUnits("10000000000000000000", 'wei');
    const receiver = SPECULOS_ADDRESS;
    const owner = SPECULOS_ADDRESS;
    const { data } = await contract.populateTransaction.withdraw(amount, receiver, owner);
    let unsignedTx = genericTx;
    unsignedTx.to = contractAddr;
    unsignedTx.chainId = testNetwork.chainId;
    unsignedTx.data = data;
    unsignedTx.value = parseEther("0");
    const serializedTx = ethers.utils.serializeTransaction(unsignedTx).slice(2);
    const tx = eth.signTransaction(ledgerPath, serializedTx);
    const right_clicks = model.letter === 'S' ? 5 : 5;
    await waitForAppScreen(sim);
    await sim.navigateAndCompareSnapshots('.', testNetwork.name + '/' + model.name + '_vault_withdraw_wsteth', [right_clicks, 0]);
    await tx;
  }));
});

