import {hethers} from "@hashgraph/hethers";
import {extendConfig, extendEnvironment} from "hardhat/config";
import {lazyObject} from "hardhat/plugins";
import {
    getInitialHederaProvider,
    getSigners,
    getSigner,
    getContractAt,
    getContractAtFromArtifact,
    getContractFactory,
    getContractFactoryFromArtifact,
} from "./helpers";
import {HederaHardhatConfig, HederaHardhatRuntimeEnvironment} from "./type-extensions";

extendConfig(
    (config: HederaHardhatConfig) => {
        config.networks = {...config.networks, ...config.hedera!.networks};
    }
);

extendEnvironment((hre: HederaHardhatRuntimeEnvironment) => {
    hre.network.provider = getInitialHederaProvider(hre);

    // @ts-ignore
    hre.hethers = lazyObject(() => {
        const {createProviderProxy} = require("./provider-proxy");

        const providerProxy = createProviderProxy(hre.network.provider);
        hre.network.provider = providerProxy;

        return {
            ...hethers,

            provider: providerProxy,
            getSigners: () => getSigners(hre),
            getSigner: (identifier: any) => getSigner(hre, identifier),
            getContractFactory: getContractFactory.bind(null, hre) as any,
            getContractFactoryFromArtifact: getContractFactoryFromArtifact.bind(null, hre),
            getContractAt: getContractAt.bind(null, hre),
            getContractAtFromArtifact: getContractAtFromArtifact.bind(null, hre),
        };
    });
});
