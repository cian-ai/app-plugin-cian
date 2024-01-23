import { waitForAppScreen, zemu, genericTx, nano_models, RANDOM_ADDRESS, SPECULOS_ADDRESS, pluginName, jestTimeOut, ethereum_network, ledgerPath } from '../test.fixture';
import { ethers } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";

const contractAddr = "0x22cdae94f135b310d2ffb01e8af05f10092a3d0b";
const testNetwork = ethereum_network;
const abi_path = `../../networks/${testNetwork.name}/${pluginName}/abis/` + contractAddr + '.json';
const abi = require(abi_path);

nano_models.forEach(function (model) {
  jest.setTimeout(jestTimeOut)
  test('[Nano ' + model.letter + " " + testNetwork.name + '] Vault Steth Wrapper Withdraw', zemu(model, testNetwork.name, async (sim, eth) => {
    const contract = new ethers.Contract(contractAddr, abi);
    const stethAmount = parseUnits("1003355099598953935", 'wei');
    const swapCalldata = "0x12aa3caf00000000000000000000000092f3f71cef740ed5784874b8c70ff87ecdf33588000000000000000000000000ae7ab96520de3a18e5e111b5eaab095312d7fe84000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee00000000000000000000000092f3f71cef740ed5784874b8c70ff87ecdf335880000000000000000000000004e8e60ccdf79ebaa4189d91b5dc9b0f85df9a4270000000000000000000000000000000000000000000000000dead9dfbf06559a0000000000000000000000000000000000000000000000000de0e3ef93c1f2b4000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ea0000000000000000000000000000000000000000000000cc0000b60000b05120dc24316b9ae028f1497c275eb9192a3ea0f67022ae7ab96520de3a18e5e111b5eaab095312d7fe8400443df021240000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000dc46908d8db957000206b4be0b9c0611111111254eeb25477b68fb85ed929f73a96058200000000000000000000000000000000000000000000ea4184f4"
    const minEthOut = parseUnits("1002053843078056453", 'wei');
    const to = SPECULOS_ADDRESS;
    // const to = RANDOM_ADDRESS;
    const isWeth = true;
    const { data } = await contract.populateTransaction.withdraw(stethAmount, swapCalldata, minEthOut, to, isWeth);
    let unsignedTx = genericTx;
    unsignedTx.chainId = testNetwork.chainId
    unsignedTx.to = contractAddr;
    unsignedTx.data = data;
    const serializedTx = ethers.utils.serializeTransaction(unsignedTx).slice(2);
    const tx = eth.signTransaction(ledgerPath, serializedTx);
    const right_clicks = model.letter === 'S' ? 9 : 5;
    await waitForAppScreen(sim);
    await sim.navigateAndCompareSnapshots('.', testNetwork.name + '/' + model.name + '_vault_steth_wrapper_withdraw', [right_clicks, 0]);
    await tx;
  }));
});

