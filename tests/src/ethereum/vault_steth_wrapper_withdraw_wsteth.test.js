import { waitForAppScreen, zemu, genericTx, nano_models, RANDOM_ADDRESS, SPECULOS_ADDRESS, pluginName, jestTimeOut, ethereum_network, ledgerPath } from '../test.fixture';
import { ethers } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";

const contractAddr = "0x22cdae94f135b310d2ffb01e8af05f10092a3d0b";
const testNetwork = ethereum_network;
const abi_path = `../../networks/${testNetwork.name}/${pluginName}/abis/` + contractAddr + '.json';
const abi = require(abi_path);

nano_models.forEach(function (model) {
  jest.setTimeout(jestTimeOut)
  test('[Nano ' + model.letter + " " + testNetwork.name + '] Vault Steth Wrapper Withdraw Wsteth', zemu(model, testNetwork.name, async (sim, eth) => {
    const contract = new ethers.Contract(contractAddr, abi);
    const stEthIn = parseUnits("20000000000000000000", 'wei');
    const to = SPECULOS_ADDRESS;
    // const to = RANDOM_ADDRESS;
    const { data } = await contract.populateTransaction.withdrawWstETH(stEthIn, to);
    let unsignedTx = genericTx;
    unsignedTx.chainId = testNetwork.chainId
    unsignedTx.to = contractAddr;
    unsignedTx.data = data;
    const serializedTx = ethers.utils.serializeTransaction(unsignedTx).slice(2);
    const tx = eth.signTransaction(ledgerPath, serializedTx);
    const right_clicks = model.letter === 'S' ? 5 : 5;
    await waitForAppScreen(sim);
    await sim.navigateAndCompareSnapshots('.', testNetwork.name + '/' + model.name + '_vault_steth_wrapper_withdraw_wsteth', [right_clicks, 0]);
    await tx;
  }));
});

