import type EthersT from "hethers";
import { extendEnvironment } from "hardhat/config";
import { lazyObject } from "hardhat/plugins";

import {
  getContractAt,
  getContractAtFromArtifact,
  getContractFactory,
  getContractFactoryFromArtifact,
  getSigner,
  getSigners,
} from "./helpers";
import type * as ProviderProxyT from "./provider-proxy";
import "./type-extensions";

const registerCustomInspection = (BigNumber: any) => {
  const inspectCustomSymbol = Symbol.for("nodejs.util.inspect.custom");

  BigNumber.prototype[inspectCustomSymbol] = function () {
    return `BigNumber { value: "${this.toString()}" }`;
  };
};

extendEnvironment((hre) => {
  hre.hethers = lazyObject(() => {
    const { createProviderProxy } =
      require("./provider-proxy") as typeof ProviderProxyT;

    const { hethers } = require("hethers") as typeof EthersT;

    registerCustomInspection(hethers.BigNumber);

    const providerProxy = createProviderProxy(hre.network.provider);

    return {
      ...hethers,

      provider: providerProxy,

      getSigner: (address: string) => getSigner(hre, address),
      getSigners: () => getSigners(hre),
      // We cast to any here as we hit a limitation of Function#bind and
      // overloads. See: https://github.com/microsoft/TypeScript/issues/28582
      getContractFactory: getContractFactory.bind(null, hre) as any,
      getContractFactoryFromArtifact: getContractFactoryFromArtifact.bind(
        null,
        hre
      ),
      getContractAt: getContractAt.bind(null, hre),
      getContractAtFromArtifact: getContractAtFromArtifact.bind(null, hre),
    };
  });
});
