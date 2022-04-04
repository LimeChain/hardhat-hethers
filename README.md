[![npm](https://img.shields.io/npm/v/hardhat-hethers.svg)](https://www.npmjs.com/package/hardhat-hethers) [![hardhat](https://hardhat.org/buidler-plugin-badge.svg?1)](https://hardhat.org)

# hardhat-hethers

[Hardhat](https://hardhat.org) plugin for integration with [hethers.js](https://github.com/hashgraph/hethers.js).

## What

This plugin brings to Hardhat the Hedera library `hethers.js`, which allows you to interact with the Hedera hashgraph in a simple way.

## Installation

```bash
npm install --save-dev 'hardhat-hethers'
```

And add the following statement to your `hardhat.config.js`:

```js
require("hardhat-hethers");
```

Add network configuration in `hardhat.config.js`:

```js
module.exports = {
  defaultNetwork: 'testnet',  // The selected default network. It has to match the name of one of the configured networks.
  hedera: {
    gasLimit: 300000, // Default gas limit. It is added to every contract transaction, but can be overwritten if required.
    networks: {
      testnet: {      // The name of the network, e.g. mainnet, testnet, previewnet, customNetwork
        accounts: [   // An array of predefined Externally Owned Accounts
          {
            "account": '0.0.123',
            "privateKey": '0x...'
          },
          ...
        ]
      },
      previewnet: {
        accounts: [
          {
            "account": '0.0.123',
            "privateKey": '0x...'
          },
          ...
        ]
      },
      ...
    }
  }
};
```

Read more about Externally Owned Accounts [here](https://docs.hedera.com/hethers/application-programming-interface/signers#externallyownedaccount).


## Tasks

This plugin creates no additional tasks.

## Environment extensions

This plugins adds an `hethers` object to the Hardhat Runtime Environment.

This object has the [same API](https://docs.hedera.com/hethers/) as `hethers.js`, with some extra Hardhat-specific functionality.

### Provider object

A `provider` field is added to `hethers`, which is an [`hethers.providers.BaseProvider`](https://docs.hedera.com/hethers/application-programming-interface/providers/provider/base-provider) automatically connected to the selected network.

### Helpers

These helpers are added to the `hethers` object:

#### Interfaces
```typescript
interface Libraries {
  [libraryName: string]: string;
}

interface FactoryOptions {
  signer?: hethers.Signer;
  libraries?: Libraries;
}
```

#### Functions
- `function getSigners() => Promise<hethers.Signer[]>;`
```typescript
const signers = await hre.hethers.getSingers();
```

- `function getSigner(identifier: any) => Promise<hethers.Signer>;`
```typescript
const signer = await hre.hethers.getSigner({
    "account": "0.0.123",
    "privateKey": "0x..."
});
```

- `function getContractFactory(name: string, signer?: hethers.Signer): Promise<hethers.ContractFactory>;`
```typescript
const contractFactoryWithDefaultSigner = await hre.hethers.getContractFactory('Greeter');
const signer = (await hre.getSigners())[1];

const contractFactoryWithCustomSigner = await hre.hethers.getContractFactory('Greeter', signer);
```

- `function getContractFactory(name: string, factoryOptions: FactoryOptions): Promise<hethers.ContractFactory>;`
```typescript
const libraryFactory = await hre.hethers.getContractFactory("contracts/TestContractLib.sol:TestLibrary");
const library = await libraryFactory.deploy();

const contract = await hre.hethers.getContractFactory("Greeter", {
    libraries: {
        "contracts/Greeter.sol:TestLibrary": library.address
    }
});
```

- `function getContractFactory(abi: any[], bytecode: hethers.utils.BytesLike, signer?: hethers.Signer): Promise<hethers.ContractFactory>;`
```typescript
const greeterArtifact = await hre.artifacts.readArtifact("Greeter");

const contract = await hre.hethers.getContractFactory(greeterArtifact.abi, greeterArtifact.bytecode);
```

- `function getContractAt(name: string, address: string, signer?: hethers.Signer): Promise<hethers.Contract>;`
```typescript
const Greeter = await hre.hethers.getContractFactory("Greeter");
const deployedGreeter = await Greeter.deploy();

const contract = await hre.hethers.getContractAt("Greeter", deployedGreeter.address);
```

- `function getContractAt(abi: any[], address: string, signer?: hethers.Signer): Promise<hethers.Contract>;`
```typescript
const greeterArtifact = await hre.artifacts.readArtifact("Greeter");

const contract = await hre.hethers.getContractAt(greeterArtifact.abi, deployedGreeter.address);
```

- `function getContractFactoryFromArtifact(artifact: Artifact, signer?: hethers.Signer): Promise<ethers.ContractFactory>;`
```typescript
const greeterArtifact = await hre.artifacts.readArtifact("Greeter");

const contractFactoryFromArtifact = await hre.hethers.getContractFactoryFromArtifact(greeterArtifact);
```

- `function getContractFactoryFromArtifact(artifact: Artifact, factoryOptions: FactoryOptions): Promise<hethers.ContractFactory>;`
```typescript
const greeterArtifact = await hre.artifacts.readArtifact("Greeter");
const libraryFactory = await hre.hethers.getContractFactory(
    "contracts/TestContractLib.sol:TestLibrary"
);
const library = await libraryFactory.deploy();

const contract = await hre.hethers.getContractFactory(greeterArtifact, {
    libraries: {
        "contracts/TestContractLib.sol:TestLibrary": library.address
    }
});
```

- `function getContractAtFromArtifact(artifact: Artifact, address: string, signer?: hethers.Signer): Promise<hethers.Contract>;`
```typescript
const Greeter = await hre.hethers.getContractFactory("Greeter");
const deployedGreeter = await Greeter.deploy();
const greeterArtifact = await hre.artifacts.readArtifact("Greeter");

const contract = await hre.getContractAtFromArtifact(greeterArtifact, deployedGreeter.address);
```

The [`Contract's`](https://docs.hedera.com/hethers/application-programming-interface/contract-interaction/contract) and [`ContractFactory's`](https://docs.hedera.com/hethers/application-programming-interface/contract-interaction/contractfactory) returned by these helpers are connected to the first [signer](https://docs.hedera.com/hethers/application-programming-interface/signers#wallet) returned by `getSigners` by default.

## Usage

There are no additional steps you need to take for this plugin to work.

Install it and access hethers through the Hardhat Runtime Environment anywhere you need it (tasks, scripts, tests, etc). For example, in your `hardhat.config.js`:

```typescript
require("hardhat-hethers");

// task action function receives the Hardhat Runtime Environment as second argument
task('getBalance', 'Prints the the balance of "0.0.29631749"', async (_, {hethers}) => {
    const balance = (await hethers.provider.getBalance('0.0.29631749')).toString();
  c onsole.log(`Balance of "0.0.29631749": ${balance} tinybars`);
});

module.exports = {};
```

And then run `npx hardhat getBalance` to try it.

Read the documentation on the [Hardhat Runtime Environment](https://hardhat.org/advanced/hardhat-runtime-environment.html) to learn how to access the HRE in different ways to use hethers.js from anywhere the HRE is accessible.

### Library linking

Some contracts need to be linked with libraries before they are deployed. You can pass the addresses of their libraries to the `getContractFactory` function with an object like this:

```typescript
const contractFactory = await this.env.hethers.getContractFactory("Example", {
    libraries: {
        ExampleLib: "0x...",
    },
});
```

This allows you to create a contract factory for the `Example` contract and link its `ExampleLib` library references to the address `"0x..."`.

To create a contract factory, all libraries must be linked. An error will be thrown informing you of any missing library.

## Troubleshooting

### Events are not being emitted

Hethers.js polls the network to check if some event was emitted (except when a `WebSocketProvider` is used; see below). This polling is done every 4 seconds. If you have a script or test that is not emitting an event, it's likely that the execution is finishing before the event is detected by the polling mechanism.

If you are connecting to a Hardhat node using a `WebSocketProvider`, events should be emitted immediately. But keep in mind that you'll have to create this provider manually, since Hardhat only supports configuring networks via http. That is, you can't add a `localhost` network with a URL like `ws://localhost:8545`.