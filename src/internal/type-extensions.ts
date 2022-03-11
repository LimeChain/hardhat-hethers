import type {hethers} from "@hashgraph/hethers";
import {HardhatConfig} from "hardhat/types/config";
import {HardhatRuntimeEnvironment, Network} from "hardhat/types/runtime";
import { SignerWithAddress } from "../signers";
import { FactoryOptions } from "../types";
import { Artifact } from "hardhat/types";

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

type HethersT = typeof hethers;
interface HethersTExtended extends HethersT {
    provider: any,
    getSigners( hre: HederaHardhatRuntimeEnvironment ): Promise<SignerWithAddress[]>;
    getSigner(hre: HederaHardhatRuntimeEnvironment, identifier: any): Promise<SignerWithAddress>;

    getContractFactory(
      hre: HederaHardhatRuntimeEnvironment,
      nameOrAbi: string | any[],
      bytecodeOrFactoryOptions?:
        | (hethers.Signer | FactoryOptions)
        | hethers.utils.BytesLike,
      signer?: hethers.Signer
    ): Promise<hethers.ContractFactory>;

    getContractFactoryFromArtifact(
      hre: HardhatRuntimeEnvironment,
      artifact: Artifact,
      signerOrOptions?: hethers.Signer | FactoryOptions
    ): Promise<hethers.ContractFactory>;

    getContractAt(
      hre: HederaHardhatRuntimeEnvironment,
      nameOrAbi: string | any[],
      address: string,
      signer?: hethers.Signer
    ): Promise<hethers.ContractFactory>;

    getContractAtFromArtifact(
      hre: HederaHardhatRuntimeEnvironment,
      artifact: Artifact,
      address: string,
      signer?: hethers.Signer
    ): Promise<hethers.ContractFactory>;
}

export interface HederaHardhatRuntimeEnvironment extends HardhatRuntimeEnvironment {
    hethers?: HethersTExtended;
    config: HederaHardhatConfig;
    network: HederaNetworkInterface;
}