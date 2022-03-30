import {NomicLabsHardhatPluginError} from "hardhat/plugins";
import {Artifact, HardhatRuntimeEnvironment,} from "hardhat/types";
import type {SignerWithAddress} from "./signers";
import {HederaHardhatRuntimeEnvironment, HederaNodeConfig} from "./type-extensions";
import type {FactoryOptions, Libraries} from "./type-extensions";
import {hethers} from "@hashgraph/hethers";

interface Link {
    sourceName: string;
    libraryName: string;
    address: string;
}

const pluginName = "hardhat-hethers";

function isArtifact(artifact: any): artifact is Artifact {
    const {
        contractName,
        sourceName,
        abi,
        bytecode,
        deployedBytecode,
        linkReferences,
        deployedLinkReferences,
    } = artifact;

    return (
        typeof contractName === "string" &&
        typeof sourceName === "string" &&
        Array.isArray(abi) &&
        typeof bytecode === "string" &&
        typeof deployedBytecode === "string" &&
        linkReferences !== undefined &&
        deployedLinkReferences !== undefined
    );
}

export function getInitialHederaProvider(hre: HederaHardhatRuntimeEnvironment): hethers.providers.BaseProvider {
    const networkName = hre.hardhatArguments.network || hre.config.defaultNetwork;
    if (['mainnet', 'testnet', 'previewnet'].indexOf(networkName.toLocaleLowerCase()) > -1) {
        return hethers.getDefaultProvider(networkName);
    }

    const {consensusNodes, mirrorNodeUrl, chainId} = hre.config.networks[networkName];
    if (consensusNodes?.length && mirrorNodeUrl && chainId != undefined && consensusNodes.length) {
        let cnNetworkConfig: { [url: string]: string } = {};
        consensusNodes.forEach(function (obj: HederaNodeConfig) {
            cnNetworkConfig[obj.url] = obj.nodeId;
        });

        let provider = new hethers.providers.BaseProvider({
            network: cnNetworkConfig,
            mirrorNodeUrl: mirrorNodeUrl,
        });
        provider._network.name = networkName;
        provider._network.chainId = chainId;

        return provider;
    }

    // TODO: implement hardhat network
    // currently we don't support `hardhat` network, so just get the testnet as fallback
    return hethers.getDefaultProvider('testnet');
}

export async function getSigners(
    hre: HardhatRuntimeEnvironment
): Promise<SignerWithAddress[]> {
    // @ts-ignore
    const accounts = hre.network.provider.listAccounts();

    return await Promise.all(
        accounts.map((identifier: any) => getSigner(hre, identifier))
    );
}

export async function getSigner(
    hre: HardhatRuntimeEnvironment,
    identifier: any
): Promise<SignerWithAddress> {
    const {SignerWithAddress: SignerWithAddressImpl} = await import("./signers");

    // @ts-ignore
    const signer = hre.network.provider.getSigner(identifier);

    return await SignerWithAddressImpl.create(signer);
}


export function getContractFactory(
    hre: HederaHardhatRuntimeEnvironment,
    name: string,
    signerOrOptions?: hethers.Signer | FactoryOptions
): Promise<hethers.ContractFactory>;

export function getContractFactory(
    hre: HederaHardhatRuntimeEnvironment,
    abi: any[],
    bytecode: hethers.utils.BytesLike,
    signer?: hethers.Signer
): Promise<hethers.ContractFactory>;

export async function getContractFactory(
    hre: HederaHardhatRuntimeEnvironment,
    nameOrAbi: string | any[],
    bytecodeOrFactoryOptions?:
        | (hethers.Signer | FactoryOptions)
        | hethers.utils.BytesLike,
    signer?: hethers.Signer
) {
    if (typeof nameOrAbi === "string") {
        const artifact = await hre.artifacts.readArtifact(nameOrAbi);
        return getContractFactoryFromArtifact(
            hre,
            artifact,
            bytecodeOrFactoryOptions as hethers.Signer | FactoryOptions | undefined
        );
    }

    return getContractFactoryByAbiAndBytecode(
        hre,
        nameOrAbi,
        bytecodeOrFactoryOptions as hethers.utils.BytesLike,
        signer
    );
}

function isFactoryOptions(
    signerOrOptions?: hethers.Signer | FactoryOptions
): signerOrOptions is FactoryOptions {
    const {Signer} = require("@hashgraph/hethers") as typeof hethers;
    const SignerWithAddressObj = require("./signers").SignerWithAddress;
    // @ts-ignore
    if (signerOrOptions === undefined || signerOrOptions instanceof Signer || signerOrOptions instanceof SignerWithAddressObj) {
        return false;
    }

    return true;
}

export async function getContractFactoryFromArtifact(
    hre: HederaHardhatRuntimeEnvironment,
    artifact: Artifact,
    signerOrOptions?: hethers.Signer | FactoryOptions
) {
    let libraries: Libraries = {};
    let signer: hethers.Signer | undefined;

    if (!isArtifact(artifact)) {
        throw new NomicLabsHardhatPluginError(
            pluginName,
            `You are trying to create a contract factory from an artifact, but you have not passed a valid artifact parameter.`
        );
    }

    if (isFactoryOptions(signerOrOptions)) {
        signer = signerOrOptions.signer;
        libraries = signerOrOptions.libraries ?? {};
    } else {
        signer = signerOrOptions;
    }

    if (artifact.bytecode === "0x") {
        throw new NomicLabsHardhatPluginError(
            pluginName,
            `You are trying to create a contract factory for the contract ${artifact.contractName}, which is abstract and can't be deployed.
If you want to call a contract using ${artifact.contractName} as its interface use the "getContractAt" function instead.`
        );
    }

    const linkedBytecode = await collectLibrariesAndLink(artifact, libraries);

    return getContractFactoryByAbiAndBytecode(
        hre,
        artifact.abi,
        linkedBytecode,
        signer
    );
}

async function collectLibrariesAndLink(
    artifact: Artifact,
    libraries: Libraries
) {
    const {utils} = require("@hashgraph/hethers") as typeof hethers;

    const neededLibraries: Array<{
        sourceName: string;
        libName: string;
    }> = [];
    for (const [sourceName, sourceLibraries] of Object.entries(
        artifact.linkReferences
    )) {
        for (const libName of Object.keys(sourceLibraries)) {
            neededLibraries.push({sourceName, libName});
        }
    }

    const linksToApply: Map<string, Link> = new Map();
    for (const [linkedLibraryName, linkedLibraryAddress] of Object.entries(
        libraries
    )) {
        if (!utils.isAddress(linkedLibraryAddress)) {
            throw new NomicLabsHardhatPluginError(
                pluginName,
                `You tried to link the contract ${artifact.contractName} with the library ${linkedLibraryName}, but provided this invalid address: ${linkedLibraryAddress}`
            );
        }

        const matchingNeededLibraries = neededLibraries.filter((lib) => {
            return (
                lib.libName === linkedLibraryName ||
                `${lib.sourceName}:${lib.libName}` === linkedLibraryName
            );
        });

        if (matchingNeededLibraries.length === 0) {
            let detailedMessage: string;
            if (neededLibraries.length > 0) {
                const libraryFQNames = neededLibraries
                    .map((lib) => `${lib.sourceName}:${lib.libName}`)
                    .map((x) => `* ${x}`)
                    .join("\n");
                detailedMessage = `The libraries needed are:
${libraryFQNames}`;
            } else {
                detailedMessage = "This contract doesn't need linking any libraries.";
            }
            throw new NomicLabsHardhatPluginError(
                pluginName,
                `You tried to link the contract ${artifact.contractName} with ${linkedLibraryName}, which is not one of its libraries.
${detailedMessage}`
            );
        }

        if (matchingNeededLibraries.length > 1) {
            const matchingNeededLibrariesFQNs = matchingNeededLibraries
                .map(({sourceName, libName}) => `${sourceName}:${libName}`)
                .map((x) => `* ${x}`)
                .join("\n");
            throw new NomicLabsHardhatPluginError(
                pluginName,
                `The library name ${linkedLibraryName} is ambiguous for the contract ${artifact.contractName}.
It may resolve to one of the following libraries:
${matchingNeededLibrariesFQNs}

To fix this, choose one of these fully qualified library names and replace where appropriate.`
            );
        }

        const [neededLibrary] = matchingNeededLibraries;

        const neededLibraryFQN = `${neededLibrary.sourceName}:${neededLibrary.libName}`;

        // The only way for this library to be already mapped is
        // for it to be given twice in the libraries user input:
        // once as a library name and another as a fully qualified library name.
        if (linksToApply.has(neededLibraryFQN)) {
            throw new NomicLabsHardhatPluginError(
                pluginName,
                `The library names ${neededLibrary.libName} and ${neededLibraryFQN} refer to the same library and were given as two separate library links.
Remove one of them and review your library links before proceeding.`
            );
        }

        linksToApply.set(neededLibraryFQN, {
            sourceName: neededLibrary.sourceName,
            libraryName: neededLibrary.libName,
            address: linkedLibraryAddress,
        });
    }

    if (linksToApply.size < neededLibraries.length) {
        const missingLibraries = neededLibraries
            .map((lib) => `${lib.sourceName}:${lib.libName}`)
            .filter((libFQName) => !linksToApply.has(libFQName))
            .map((x) => `* ${x}`)
            .join("\n");

        throw new NomicLabsHardhatPluginError(
            pluginName,
            `The contract ${artifact.contractName} is missing links for the following libraries:
${missingLibraries}

Learn more about linking contracts at https://hardhat.org/plugins/nomiclabs-hardhat-hethers.html#library-linking
`
        );
    }

    return linkBytecode(artifact, [...linksToApply.values()]);
}

// @ts-ignore
function defaultNthArgument(fn, n, thisObj, defaultObj) {
    return function (...args: any) {
        let receivedArgs = args.length;

        // Check if the last argument is an options object
        if (typeof args[receivedArgs - 1] === 'object') {
            // don't count it
            receivedArgs--;
        }

        if (receivedArgs !== n) {
            // call the function without the default gas limit appended to
            // force it to throw a MISSING_ARGUMENT or an UNEXPECTED_ARGUMENT error
            return fn.call(thisObj, ...args.slice(0, receivedArgs));
        }

        let overwritten = args[n] || {};
        overwritten = Object.assign({}, defaultObj, overwritten);
        return fn.call(thisObj, ...args.slice(0, n), overwritten);
    };
}

async function getContractFactoryByAbiAndBytecode(
    hre: HederaHardhatRuntimeEnvironment,
    abi: any[],
    bytecode: hethers.utils.BytesLike,
    signer?: hethers.Signer
) {
    const {ContractFactory} = require("@hashgraph/hethers") as typeof hethers;

    if (signer === undefined) {
        const signers = await hre.hethers?.getSigners(hre);
        if (signers && signers.length) {
            // @ts-ignore
            signer = signers[0];
        }
    }

    const abiWithAddedGas = addGasToAbiMethodsIfNecessary(hre, abi);

    const contractFactory = new ContractFactory(abiWithAddedGas, bytecode, signer);

    // @ts-ignore
    const defaultGasLimit = hre.config.hedera.gasLimit;

    // Apply the default gasLimit
    contractFactory.deploy = defaultNthArgument(
        contractFactory.deploy,
        contractFactory.interface.deploy.inputs.length,
        contractFactory,
        {gasLimit: defaultGasLimit});

    contractFactory.getDeployTransaction = defaultNthArgument(
        contractFactory.getDeployTransaction,
        contractFactory.interface.deploy.inputs.length,
        contractFactory,
        {gasLimit: defaultGasLimit}
    );

    return contractFactory;
}

export async function getContractAt(
    hre: HederaHardhatRuntimeEnvironment,
    nameOrAbi: string | any[],
    address: string,
    signer?: hethers.Signer
) {
    if (typeof nameOrAbi === "string") {
        const artifact = await hre.artifacts.readArtifact(nameOrAbi);

        return getContractAtFromArtifact(hre, artifact, address, signer);
    }

    const {Contract} = require("@hashgraph/hethers") as typeof hethers;

    if (signer === undefined) {
        const signers = await hre.hethers?.getSigners(hre);
        if (signers && signers.length) {
            // @ts-ignore
            signer = signers[0];
        }
    }

    // If there's no signer, we want to put the provider for the selected network here.
    // This allows read only operations on the contract interface.
    const signerOrProvider: hethers.Signer | hethers.providers.Provider =
        signer !== undefined ? signer : hre.hethers?.provider;

    const abiWithAddedGas = addGasToAbiMethodsIfNecessary(hre, nameOrAbi);

    return new Contract(address, abiWithAddedGas, signerOrProvider);
}

export async function getContractAtFromArtifact(
    hre: HederaHardhatRuntimeEnvironment,
    artifact: Artifact,
    address: string,
    signer?: hethers.Signer
) {
    if (!isArtifact(artifact)) {
        throw new NomicLabsHardhatPluginError(
            pluginName,
            `You are trying to create a contract by artifact, but you have not passed a valid artifact parameter.`
        );
    }

    const factory = await getContractFactoryByAbiAndBytecode(
        hre,
        artifact.abi,
        "0x",
        signer
    );

    let contract = factory.attach(address);
    // If there's no signer, we connect the contract instance to the provider for the selected network.
    if (contract.provider === null) {
        contract = contract.connect(hre.hethers?.provider);
    }

    return contract;
}


// This helper adds a `gas` field to the ABI function elements if the network
// is set up to use a fixed amount of gas.
function addGasToAbiMethodsIfNecessary(
    hre: HederaHardhatRuntimeEnvironment,
    abi: any[]
): any[] {
    const networkConfig = hre.network.config
    const {BigNumber} = require("@hashgraph/hethers") as typeof hethers;

    if (networkConfig.gas === undefined) {
        return abi;
    }

    if (networkConfig.gas === "auto") {
        throw new NomicLabsHardhatPluginError(
            pluginName,
            `Automatic gas estimation is not supported.`
        );
    }

    const modifiedAbi: any[] = [];

    for (const abiElement of abi) {
        if (abiElement.type !== "function") {
            modifiedAbi.push(abiElement);
            continue;
        }

        // @ts-ignore
        const defaultGasLimit = hre.config.hedera.gasLimit;

        modifiedAbi.push({
            ...abiElement,
            gasLimit: defaultGasLimit,
        });
    }

    return modifiedAbi;
}


function linkBytecode(artifact: Artifact, libraries: Link[]): string {
    let bytecode = artifact.bytecode;

    // TODO: measure performance impact
    for (const {sourceName, libraryName, address} of libraries) {
        const linkReferences = artifact.linkReferences[sourceName][libraryName];
        for (const {start, length} of linkReferences) {
            bytecode =
                bytecode.substr(0, 2 + start * 2) +
                address.substr(2) +
                bytecode.substr(2 + (start + length) * 2);
        }
    }

    return bytecode;
}
