import type {hethers} from "@hashgraph/hethers";
import {HardhatConfig} from "hardhat/types/config";
import {HardhatRuntimeEnvironment, Network} from "hardhat/types/runtime";

// import type {
//   FactoryOptions as FactoryOptionsT,
//   getContractFactory as getContractFactoryT,
//   HardhatEthersHelpers,
//   Libraries as LibrariesT,
// } from "../types";

export interface HederaAccount {
    account?: string;
    address?: string;
    alias?: string;
    privateKey: string;
}

export interface HederaNodeConfig {
    url: string;
    nodeId: string;
}

export interface HederaNetwork {
    accounts?: Array<HederaAccount>;
    nodeId?: string;
    consensusNodes?: Array<HederaNodeConfig>;
    mirrorNodeUrl?: string;
    chainId?: number;
}

export interface HederaNetworks {
    [name: string]: HederaNetwork
}

export interface HederaConfig {
    gasLimit: number;
    networks: HederaNetworks;
}

export interface HederaHardhatConfig extends HardhatConfig {
    hedera?: HederaConfig;
    networks: any;
}

interface HederaNetworkInterface extends Network {
    provider: any;
}

export interface HederaHardhatRuntimeEnvironment extends HardhatRuntimeEnvironment {
    hethers?: typeof hethers;
    config: HederaHardhatConfig;
    network: HederaNetworkInterface;
}