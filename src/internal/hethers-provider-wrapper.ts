import {hethers} from "@hashgraph/hethers";
import {HederaAccount} from "./type-extensions";

export class HethersProviderWrapper extends hethers.providers.BaseProvider {
    private readonly _hardhatProvider: hethers.providers.BaseProvider;

    constructor(hardhatProvider: hethers.providers.BaseProvider) {
        let networkConfig: { [url: string]: string } = {};
        hardhatProvider.getHederaClient()._network._network.forEach((obj: any) => {
            const address = obj[0]._address;
            let addrString = address._address;
            if (address._port) addrString = `${addrString}:${address._port}`;
            networkConfig[addrString] = obj[0]._accountId.toString();
        });

        super({
            network: networkConfig,
            mirrorNodeUrl: hardhatProvider.getHederaClient().mirrorNetwork[0]
        });
        this._network.chainId = hardhatProvider._network.chainId;

        this._hardhatProvider = hardhatProvider;
    }

    public getSigner(identifier: HederaAccount): hethers.Wallet {
        // @ts-ignore
        return new hethers.Wallet(identifier, this._hardhatProvider);
    }

    public listAccounts(): any {
        const hre = require('hardhat');
        return hre.config.networks[this._hardhatProvider._network.name]?.accounts || [];
    }
}
