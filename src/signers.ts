// import { hethers } from "@hashgraph/hethers";
//
// export class SignerWithAddress extends hethers.Signer {
//   public static async create(signer: hethers.providers.JsonRpcSigner) {
//     return new SignerWithAddress(await signer.getAddress(), signer);
//   }
//
//   private constructor(
//     public readonly address: string,
//     private readonly _signer: hethers.providers.JsonRpcSigner
//   ) {
//     super();
//     (this as any).provider = _signer.provider;
//   }
//
//   public async getAddress(): Promise<string> {
//     return this.address;
//   }
//
//   public signMessage(message: string | hethers.utils.Bytes): Promise<string> {
//     return this._signer.signMessage(message);
//   }
//
//   public signTransaction(
//     transaction: hethers.utils.Deferrable<hethers.providers.TransactionRequest>
//   ): Promise<string> {
//     return this._signer.signTransaction(transaction);
//   }
//
//   public sendTransaction(
//     transaction: hethers.utils.Deferrable<hethers.providers.TransactionRequest>
//   ): Promise<hethers.providers.TransactionResponse> {
//     return this._signer.sendTransaction(transaction);
//   }
//
//   public connect(provider: hethers.providers.Provider): SignerWithAddress {
//     return new SignerWithAddress(this.address, this._signer.connect(provider));
//   }
//
//   public _signTypedData(
//     ...params: Parameters<hethers.providers.JsonRpcSigner["_signTypedData"]>
//   ): Promise<string> {
//     return this._signer._signTypedData(...params);
//   }
//
//   public toJSON() {
//     return `<SignerWithAddress ${this.address}>`;
//   }
// }
