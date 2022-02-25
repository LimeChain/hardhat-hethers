import type * as hethers from "@hashgraph/hethers";

// import { Artifact } from "hardhat/types";
// import type { SignerWithAddress } from "../signers";

export interface Libraries {
  [libraryName: string]: string;
}

export interface FactoryOptions {
  signer?: hethers.Signer;
  libraries?: Libraries;
}

export declare function getContractFactory(
  name: string,
  signerOrOptions?: hethers.Signer | FactoryOptions
): Promise<hethers.ContractFactory>;
export declare function getContractFactory(
  abi: any[],
  bytecode: hethers.utils.BytesLike,
  signer?: hethers.Signer
): Promise<hethers.ContractFactory>;

export interface HardhatEthersHelpers {
  provider: hethers.providers.DefaultHederaProvider;

  // getContractFactory: typeof getContractFactory;
  // getContractFactoryFromArtifact: (
  //   artifact: Artifact,
  //   signerOrOptions?: ethers.Signer | FactoryOptions
  // ) => Promise<ethers.ContractFactory>;
  // getContractAt: (
  //   nameOrAbi: string | any[],
  //   address: string,
  //   signer?: ethers.Signer
  // ) => Promise<ethers.Contract>;
  // getContractAtFromArtifact: (
  //   artifact: Artifact,
  //   address: string,
  //   signer?: ethers.Signer
  // ) => Promise<ethers.Contract>;
  // getSigner: (address: string) => Promise<SignerWithAddress>;
  // getSigners: () => Promise<SignerWithAddress[]>;
}
