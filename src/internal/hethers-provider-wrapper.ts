// import { hethers } from "@hashgraph/hethers";
// import { EthereumProvider } from "hardhat/types";
//
// export class HethersProviderWrapper extends hethers.providers.DefaultHederaProvider {
//   private readonly _hardhatProvider: EthereumProvider;
//
//   constructor(hardhatProvider: EthereumProvider) {
//     super();
//     this._hardhatProvider = hardhatProvider;
//   }
//
//   public async send(method: string, params: any): Promise<any> {
//     const result = await this._hardhatProvider.send(method, params);
//
//     // We replicate hethers' behavior.
//     this.emit("debug", {
//       action: "send",
//       request: {
//         id: 42,
//         jsonrpc: "2.0",
//         method,
//         params,
//       },
//       response: result,
//       provider: this,
//     });
//
//     return result;
//   }
//
//   public toJSON() {
//     return "<WrappedHardhatProvider>";
//   }
// }
