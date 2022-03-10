require("../../../src/internal");

module.exports = {
  solidity: "0.8.4",
  defaultNetwork: "testnet",
  hedera: {
    gasLimit: 50000,
    networks: {
      testnet: {
        accounts: [
          {
            "account": "0.0.29631749",
            "privateKey": "0x18a2ac384f3fa3670f71fc37e2efbf4879a90051bb0d437dd8cbd77077b24d9b"
          },
          {
            "account": "0.0.29631750",
            "privateKey": "0x6357b34b94fe53ded45ebe4c22b9c1175634d3f7a8a568079c2cb93bba0e3aee"
          }
        ]
      }
    }
  },
};
