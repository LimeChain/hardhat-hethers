// import { assert } from "chai";
// import type { hethers } from "@hashgraph/hethers";
//
// import { HethersProviderWrapper } from "../src/internal/hethers-provider-wrapper";
//
// import { useEnvironment } from "./helpers";
//
// describe("Hethers provider wrapper", function () {
//   let realProvider: hethers.providers.JsonRpcProvider;
//   let wrapper: HethersProviderWrapper;
//
//   useEnvironment("hardhat-project");
//
//   beforeEach(function () {
//     realProvider = new hethers.providers.JsonRpcProvider();
//     wrapper = new HethersProviderWrapper(this.env.network.provider);
//   });
//
//   it("Should return the same as the real provider", async function () {
//     const response = await realProvider.send("eth_accounts", []);
//     const response2 = await wrapper.send("eth_accounts", []);
//
//     assert.deepEqual(response, response2);
//   });
//
//   it("Should return the same error", async function () {
//     this.skip();
//     // We disable this test for RskJ
//     // See: https://github.com/rsksmart/rskj/issues/876
//     const version = await this.env.network.provider.send("web3_clientVersion");
//     if (version.includes("RskJ")) {
//       this.skip();
//     }
//
//     try {
//       await realProvider.send("error_please", []);
//       assert.fail("Ethers provider should have failed");
//     } catch (err: any) {
//       try {
//         await wrapper.send("error_please", []);
//         assert.fail("Wrapped provider should have failed");
//       } catch (err2: any) {
//         assert.deepEqual(err2.message, err.message);
//       }
//     }
//   });
// });
