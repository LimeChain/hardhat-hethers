import {hethers} from "@hashgraph/hethers";
import * as hre from "hardhat";
import {HederaAccount} from "./type-extensions";

export class HethersProviderWrapper extends hethers.providers.BaseProvider {
    private readonly _hardhatProvider: hethers.providers.BaseProvider;

    constructor(hardhatProvider: hethers.providers.BaseProvider) {
        super(hardhatProvider.getNetwork());
        this._hardhatProvider = hardhatProvider;
    }

    public getSigner(identifier: HederaAccount): hethers.Wallet {
        // @ts-ignore
        return new hethers.Wallet(identifier, this._hardhatProvider);
    }

    public listAccounts(): any {
        return hre.config.networks[this._hardhatProvider._network.name]?.accounts || [];
    }
}
