import { biconomyAPIKey } from '../constants';
import { RPC } from 'constants/networks';

const Biconomy = require("@biconomy/mexa")
const Web3 = require("web3");
let getWeb3: any = null;
const getBiconomyInstance = (gaslessMode = false) => {

    if (gaslessMode) {

        if (getWeb3 === null) {
            const maticProvider = RPC[137];
            const biconomy = new Biconomy(
                new Web3.providers.HttpProvider(maticProvider),
                {
                    apiKey: biconomyAPIKey,
                    debug: false
                }
            );
            getWeb3 = new Web3(biconomy);
            biconomy
                .onEvent(biconomy.READY, () => {
                    console.debug("Mexa is Ready");
                })
        }
    }
    else {
        getWeb3 = null;
    }
    return getWeb3;
}

export default getBiconomyInstance
