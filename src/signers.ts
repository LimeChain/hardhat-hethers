import {hethers} from "@hashgraph/hethers";
import {HederaAccount} from "./internal/type-extensions";

export class SignerWithAddress extends hethers.Wallet {
    // @ts-ignore
    address: string;

    public static async create(signer: hethers.Wallet) {
        let signerWithAddress = await new SignerWithAddress(signer._signingKey(), signer);
        // @ts-ignore
        signerWithAddress.address = signer.address;
        return signerWithAddress;
    }

    constructor(
        public readonly identity: HederaAccount,
        private readonly _signer: hethers.Signer
    ) {
        // @ts-ignore
        super(identity, _signer.provider);
    }

    public async getAddress(): Promise<string> {
        return this._signer.getAddress();
    }

    public signMessage(message: string | hethers.utils.Bytes): Promise<string> {
        return this._signer.signMessage(message);
    }

    public signTransaction(transaction: hethers.providers.TransactionRequest): Promise<string> {
        return this._signer.signTransaction(transaction);
    }

    public sendTransaction(transaction: hethers.providers.TransactionRequest): Promise<hethers.providers.TransactionResponse> {
        return this._signer.sendTransaction(transaction);
    }

    public connect(provider: hethers.providers.BaseProvider): SignerWithAddress {
        return new SignerWithAddress(this.identity, this._signer.connect(provider));
    }

    public createAccount(pubKey: hethers.utils.BytesLike, initialBalance?: BigInt): Promise<hethers.providers.TransactionResponse> {
        return this._signer.createAccount(pubKey, initialBalance);
    }

    public toJSON() {
        return `<SignerWithAddress ${this._signer.getAddress()}>`;
    }
}
