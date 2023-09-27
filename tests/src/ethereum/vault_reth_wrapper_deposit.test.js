import { waitForAppScreen, zemu, genericTx, nano_models, SPECULOS_ADDRESS, pluginName, jestTimeOut, ethereum_network, ledgerPath } from '../test.fixture';
import { ethers } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";

const contractAddr = "0xcad31182fd45298eeac76ada71969cd0c722a949";
const testNetwork = ethereum_network;
const abi_path = `../../networks/${testNetwork.name}/${pluginName}/abis/` + contractAddr + '.json';
const abi = require(abi_path);

nano_models.forEach(function (model) {
  jest.setTimeout(jestTimeOut)
  test('[Nano ' + model.letter + " " + testNetwork.name + '] Vault Reth Wrapper Deposit', zemu(model, testNetwork.name, async (sim, eth) => {
    const contract = new ethers.Contract(contractAddr, abi);
    const wethAmount = 0
    const swapCalldata = "0x12aa3caf00000000000000000000000092f3f71cef740ed5784874b8c70ff87ecdf33588000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee000000000000000000000000ae78736cd615f374d3085123a210448e74fc639300000000000000000000000092f3f71cef740ed5784874b8c70ff87ecdf33588000000000000000000000000cad31182fd45298eeac76ada71969cd0c722a949000000000000000000000000000000000000000000000000016345785d8a0000000000000000000000000000000000000000000000000000014a37a8ed5e61170000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009b00000000000000000000000000000000000000000000000000007d00001a4041c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2d0e30db002a000000000000000000000000000000000000000000000000001473e13cd3f8c09ee63c1e5802201d2400d30bfd8172104b4ad046d019ca4e7bdc02aaa39b223fe8d0a0e5c4f27ead9083c756cc21111111254eeb25477b68fb85ed929f73a9605820000000000ea4184f4"
    const minREthIn = parseUnits("93040981972908228", 'wei');
    const to = SPECULOS_ADDRESS;
    const { data } = await contract.populateTransaction.deposit(wethAmount, swapCalldata, minREthIn, to);
    let unsignedTx = genericTx;
    unsignedTx.to = contractAddr;
    unsignedTx.data = data;
    unsignedTx.value = parseEther("0.1");
    const serializedTx = ethers.utils.serializeTransaction(unsignedTx).slice(2);
    const tx = eth.signTransaction(ledgerPath, serializedTx);
    const right_clicks = model.letter === 'S' ? 8 : 6;
    await waitForAppScreen(sim);
    await sim.navigateAndCompareSnapshots('.', testNetwork.name + '/' + model.name + '_vault_reth_wrapper_deposit', [right_clicks, 0]);
    await tx;
  }));
});

