import type {hethers} from "@hashgraph/hethers";
import {HardhatConfig, Network} from "hardhat/types";
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

export interface HederaHardhatRuntimeEnvironment extends HardhatRuntimeEnvironment {
    hethers?: typeof hethers;
    network: HederaNetwork;
    config: HederaHardhatConfig
}