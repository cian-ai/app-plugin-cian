import { waitForAppScreen, zemu, genericTx, nano_models, SPECULOS_ADDRESS, pluginName, jestTimeOut, arbitrum_network, ledgerPath } from '../test.fixture';
import { ethers } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";

const contractAddr = "0xe946dd7d03f6f5c440f68c84808ca88d26475fc5";
const testNetwork = arbitrum_network;
const abi_path = `../../networks/${testNetwork.name}/${pluginName}/abis/` + contractAddr + '.json';
const abi = require(abi_path);

nano_models.forEach(function (model) {
  jest.setTimeout(jestTimeOut)
  test(
    '[Nano ' + model.letter + " " + testNetwork.name + '] Vault Wsteth Deleverage Withdraw',
    zemu(model, testNetwork.name, async (sim, eth) => {
      const contract = new ethers.Contract(contractAddr, abi);
      const protocolId = 0
      const withdrawToken = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'
      const amount = parseEther('1.0');
      const swapCalldata = "0x12aa3caf00000000000000000000000092f3f71cef740ed5784874b8c70ff87ecdf33588000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee000000000000000000000000ae7ab96520de3a18e5e111b5eaab095312d7fe8400000000000000000000000092f3f71cef740ed5784874b8c70ff87ecdf335880000000000000000000000004e8e60ccdf79ebaa4189d91b5dc9b0f85df9a4270000000000000000000000000000000000000000000000000d2f13f7789f00000000000000000000000000000000000000000000000000000d2c0a5945568fff000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000008200005400003a4060ae7ab96520de3a18e5e111b5eaab095312d7fe84a1903eab00000000000000000000000042f527f50f16a103b6ccab48bccca214500c10210020d6bdbf78ae7ab96520de3a18e5e111b5eaab095312d7fe8480a06c4eca27ae7ab96520de3a18e5e111b5eaab095312d7fe841111111254eeb25477b68fb85ed929f73a960582ea4184f4"
      const swapGetMin = parseUnits("2002164779935359189", 'wei');
      const flashloanSelector = 0;
      const beneficiary = SPECULOS_ADDRESS
      const receiver = beneficiary;
      const owner = beneficiary;
      const { data } = await contract.populateTransaction.deleverageWithdraw(
        protocolId, withdrawToken, amount, swapCalldata, swapGetMin, flashloanSelector, receiver, owner);

      let unsignedTx = genericTx;
      unsignedTx.to = contractAddr;
      unsignedTx.chainId = testNetwork.chainId;
      unsignedTx.data = data;
      unsignedTx.value = parseEther('0');
      const serializedTx =
        ethers.utils.serializeTransaction(unsignedTx).slice(2);
      const tx = eth.signTransaction(ledgerPath, serializedTx);
      const right_clicks = model.letter === 'S' ? 11 : 8;
      await waitForAppScreen(sim);
      await sim.navigateAndCompareSnapshots(
        '.',
        testNetwork.name + '/' + model.name + '_vault_wsteth_deleverage_withdraw',
        [right_clicks, 0]);
      await tx;
    }));
});
