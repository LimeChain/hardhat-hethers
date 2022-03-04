import type {hethers} from "@hashgraph/hethers";
import {HardhatConfig, Network, NetworkConfig, NetworksConfig, HardhatNetworkConfig, HttpNetworkConfig} from "hardhat/types";
import {HardhatRuntimeEnvironment} from "hardhat/types/runtime";

// import type {
//   FactoryOptions as FactoryOptionsT,
//   getContractFactory as getContractFactoryT,
//   HardhatEthersHelpers,
//   Libraries as LibrariesT,
// } from "../types";

interface HederaConfig {
    gasLimit: number;
    networks: any;
}

export interface HederaHardhatConfig extends HardhatConfig {
    hedera?: HederaConfig;
    networks: any;
}

interface HederaNetwork extends Network {
    provider: any;
}

// interface HederaCustomConfig extends HardhatNetworkConfig{
//     nodes: any
// }

// type NetworkConfigExt = HardhatNetworkConfig | HttpNetworkConfig | HederaCustomConfig

// interface NetworksConfigExtended extends NetworksConfig {
//     [networkName: string]: NetworkConfigExt
// }
//
// interface HederaHardhatConfig2 extends HardhatConfig {
//     networks: NetworksConfigExtended;
// }

export interface HederaHardhatRuntimeEnvironment extends HardhatRuntimeEnvironment {
    hethers?: typeof hethers;
    network: HederaNetwork;
    config: HederaHardhatConfig
}