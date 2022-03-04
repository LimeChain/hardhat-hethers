import {
    HARDHAT_NETWORK_RESET_EVENT,
    HARDHAT_NETWORK_REVERT_SNAPSHOT_EVENT,
} from "hardhat/internal/constants";
import {hethers} from "@hashgraph/hethers";

import {HethersProviderWrapper} from "./hethers-provider-wrapper";
import {createUpdatableTargetProxy} from "./updatable-target-proxy";

/**
 * This method returns a proxy that uses an underlying provider for everything.
 *
 * This underlying provider is replaced by a new one after a successful hardhat_reset,
 * because hethers providers can have internal state that returns wrong results after
 * the network is reset.
 */
export function createProviderProxy(
    hardhatProvider: hethers.providers.BaseProvider
): any {
    const initialProvider = new HethersProviderWrapper(hardhatProvider);
    const {proxy: providerProxy, setTarget} = createUpdatableTargetProxy(initialProvider);

    hardhatProvider.on(HARDHAT_NETWORK_RESET_EVENT, () => {
        setTarget(new HethersProviderWrapper(hardhatProvider));
    });
    hardhatProvider.on(HARDHAT_NETWORK_REVERT_SNAPSHOT_EVENT, () => {
        setTarget(new HethersProviderWrapper(hardhatProvider));
    });

    return providerProxy;
}
