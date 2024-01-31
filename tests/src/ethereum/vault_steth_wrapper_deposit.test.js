import { waitForAppScreen, zemu, genericTx, nano_models, SPECULOS_ADDRESS, pluginName, jestTimeOut, ethereum_network, ledgerPath } from '../test.fixture';
import { ethers } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";

const contractAddr = "0x22cdae94f135b310d2ffb01e8af05f10092a3d0b";
const testNetwork = ethereum_network;
const abi_path = `../../networks/${testNetwork.name}/${pluginName}/abis/` + contractAddr + '.json';
const abi = require(abi_path);

nano_models.forEach(function (model) {
  jest.setTimeout(jestTimeOut)
  test('[Nano ' + model.letter + " " + testNetwork.name + '] Vault Steth Wrapper Deposit', zemu(model, testNetwork.name, async (sim, eth) => {
    const contract = new ethers.Contract(contractAddr, abi);
    const wethAmount = 0
    const swapCalldata = "0x12aa3caf00000000000000000000000092f3f71cef740ed5784874b8c70ff87ecdf33588000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee000000000000000000000000ae7ab96520de3a18e5e111b5eaab095312d7fe8400000000000000000000000092f3f71cef740ed5784874b8c70ff87ecdf335880000000000000000000000004e8e60ccdf79ebaa4189d91b5dc9b0f85df9a4270000000000000000000000000000000000000000000000000d2f13f7789f00000000000000000000000000000000000000000000000000000d2c0a5945568fff000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000008200005400003a4060ae7ab96520de3a18e5e111b5eaab095312d7fe84a1903eab00000000000000000000000042f527f50f16a103b6ccab48bccca214500c10210020d6bdbf78ae7ab96520de3a18e5e111b5eaab095312d7fe8480a06c4eca27ae7ab96520de3a18e5e111b5eaab095312d7fe841111111254eeb25477b68fb85ed929f73a960582ea4184f4"
    const minStEthIn = parseUnits("949144999999999999", 'wei');
    const to = SPECULOS_ADDRESS;
    const { data } = await contract.populateTransaction.deposit(wethAmount, swapCalldata, minStEthIn, to);
    let unsignedTx = genericTx;
    unsignedTx.chainId = testNetwork.chainId
    unsignedTx.to = contractAddr;
    unsignedTx.data = data;
    unsignedTx.value = parseEther("0.95");
    const serializedTx = ethers.utils.serializeTransaction(unsignedTx).slice(2);
    const tx = eth.signTransaction(ledgerPath, serializedTx);
    const right_clicks = model.letter === 'S' ? 8 : 6;
    await waitForAppScreen(sim);
    await sim.navigateAndCompareSnapshots('.', testNetwork.name + '/' + model.name + '_vault_steth_wrapper_deposit', [right_clicks, 0]);
    await tx;
  }));
});

