require("../../../src/internal");
const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, '../../../.env')});

module.exports = {
  solidity: "0.8.4",
  defaultNetwork: "testnet",
  hedera: {
    gasLimit: 300000,
    networks: {
      testnet: {
        accounts: [
          {
            "account": process.env['TESTNET_ACCOUNT_ID_1'],
            "privateKey": process.env['TESTNET_PRIVATEKEY_1']
          },
          {
            "account": process.env['TESTNET_ACCOUNT_ID_2'],
            "privateKey": process.env['TESTNET_PRIVATEKEY_2']
          }
        ]
      },
      previewnet: {
        accounts: [
          {
            "account": process.env['PREVIEWNET_ACCOUNT_ID_1'],
            "privateKey": process.env['PREVIEWNET_PRIVATEKEY_1']
          },
          {
            "account": process.env['PREVIEWNET_ACCOUNT_ID_2'],
            "privateKey": process.env['PREVIEWNET_PRIVATEKEY_2']
          }
        ]
      }
    }
  },
};