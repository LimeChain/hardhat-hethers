import "mocha";
import { assert } from "chai";
import type { hethers } from "@hashgraph/hethers";
import { hethers as hethersObj } from "@hashgraph/hethers";
import { NomicLabsHardhatPluginError } from "hardhat/plugins";
import { Artifact } from "hardhat/types";
import { HethersProviderWrapper } from "../src/internal/hethers-provider-wrapper";
import { useEnvironment } from "./helpers";
import { SignerWithAddress } from "../src/internal/signers";
import path from 'path';
import dotenv from "dotenv";
dotenv.config({path: path.resolve(__dirname, '../.env')});

const test_on = process.env['RUN_TEST_ON'];
// @ts-ignore
const test_on_lowercase = test_on.toLowerCase();

describe("Hethers plugin", function() {
  useEnvironment("hardhat-project", test_on_lowercase);
  let wallet1: hethers.Wallet, wallet2: hethers.Wallet;

  before(function() {
    wallet1 = new hethersObj.Wallet({
      // @ts-ignore
      "account": process.env[`${test_on}_ACCOUNT_ID_1`],
      // @ts-ignore
      "privateKey": process.env[`${test_on}_PRIVATEKEY_1`]
    });

    wallet2 = new hethersObj.Wallet({
      // @ts-ignore
      "account": process.env[`${test_on}_ACCOUNT_ID_2`],
      // @ts-ignore
      "privateKey": process.env[`${test_on}_PRIVATEKEY_2`]
    });
  });
  this.timeout(900000);
  
  describe("Provider", function() {
    it("should be able to call getBalance()", async function() {
      let balance = (await this.env.hethers.provider.getBalance(wallet1.account)).toString();
      assert.strictEqual(balance > 0, true);
    });
  });

  describe("Signers", function() {
    it("should be able to get all signers", async function() {
      const signers = await this.env.hethers.getSigners();

      assert.strictEqual(signers.length, 2);
      assert.strictEqual(signers[0].constructor.name, "SignerWithAddress");
    });
  });
  describe("Signer", function() {
    this.timeout(60000);
    let signer: SignerWithAddress;
    it("should be able to get a signer via accountId and privateKey", async function() {
      signer = await this.env.hethers.getSigner({
        "account": wallet1.account,
        "privateKey": wallet1.privateKey
      });

      assert.strictEqual(signer.constructor.name, "SignerWithAddress");
    });
    it("should be able to sign a transaction", async function() {
      const signedTx = await signer.signTransaction({
        to: wallet2.account,
        value: 1000
      });

      assert.strictEqual(signedTx != null && signedTx != "0x", true);
    });
    it("should be able to transfer tokens with the signer", async function() {
      const balanceBefore = (await this.env.hethers.provider.getBalance(wallet2.account)).toString();
      await signer.sendTransaction({
        to: wallet2.account,
        value: 142
      });
      const balanceAfter = (await this.env.hethers.provider.getBalance(wallet2.account)).toString();
      assert.strictEqual(this.env.hethers.BigNumber.from(balanceAfter) - this.env.hethers.BigNumber.from(balanceBefore), 142);
    });
  });

  describe("Signers and contracts helpers", function() {
    let signers: hethers.Signer[];
    let greeterArtifact: Artifact;
    let iGreeterArtifact: Artifact;

    beforeEach(async function() {
      signers = await this.env.hethers.getSigners();
      await this.env.run("compile", { quiet: true });
      greeterArtifact = await this.env.artifacts.readArtifact("Greeter");

      iGreeterArtifact = await this.env.artifacts.readArtifact("IGreeter");
    });

    describe("getSigners", function() {
      it("should return the signers", async function() {
        const sigs = await this.env.hethers.getSigners();
        assert.equal(
          await sigs[0].getAddress(),
          wallet1.address
        );
      });

      it("should expose the identity synchronously", async function() {
        const sigs = await this.env.hethers.getSigners();
        const identity = wallet1._signingKey();

        assert.equal(
          sigs[0].identity.curve,
          identity.curve
        );
        assert.equal(
          sigs[0].identity.publicKey,
          identity.publicKey
        );
        assert.equal(
          sigs[0].identity.compressedPublicKey,
          identity.compressedPublicKey
        );
      });

      it("should expose the address synchronously", async function () {
        const sigs = await this.env.hethers.getSigners();
        assert.equal(
          sigs[0].address,
          wallet1.address
        );
      });
    });

    describe("signer", function() {
      it("should sign a message", async function() {
        const [sig] = await this.env.hethers.getSigners();

        const result = await sig.signMessage("hello");
        const hethersResult = await wallet1.signMessage("hello");

        assert.equal(
          result,
          hethersResult
        );
      });

      it("should throw when sign a transaction", async function() {
        const [sig] = await this.env.hethers.getSigners();

        const Greeter = await this.env.hethers.getContractFactory("Greeter");
        const tx = Greeter.getDeployTransaction();

        try {
          await sig.signTransaction(tx);
        } catch (err) {
          assert.exists(err);
          return;
        }
        assert.isTrue(false);
      });

      it("should return the balance of the account", async function() {
        const [sig] = await this.env.hethers.getSigners();
        assert.notEqual(
          (await sig.getBalance().toString),
          "0"
        );
      });

      it("should not allow to use the call method", async function() {
        const [sig] = await this.env.hethers.getSigners();

        const Greeter = await this.env.hethers.getContractFactory("Greeter");
        const tx = Greeter.getDeployTransaction();
        try {
          await sig.call(tx);
        } catch (err) {
          assert.exists(err);
          return;
        }
        assert.isTrue(false);
      });

      it("should send a transaction", async function() {
        const [sig] = await this.env.hethers.getSigners();

        const Greeter = await this.env.hethers.getContractFactory("Greeter");
        const tx = Greeter.getDeployTransaction();

        const response = await sig.sendTransaction(tx);

        const receipt = await response.wait();

        assert.equal(receipt.status, 1);
      });

      xit("should get the chainId", async function() {
        const [sig] = await this.env.hethers.getSigners();

        const chainId = await sig.getChainId();

        assert.equal(chainId, 291);
      });

      it("should check and populate a transaction", async function() {
        const [sig] = await this.env.hethers.getSigners();

        const Greeter = await this.env.hethers.getContractFactory("Greeter");
        const tx = Greeter.getDeployTransaction();

        const checkedTransaction = sig.checkTransaction(tx);

        assert.equal(await checkedTransaction.from, sig.address);

        const populatedTransaction = await sig.populateTransaction(
          checkedTransaction
        );

        assert.equal(populatedTransaction.from, sig.address);
      });
    });

    describe("getContractFactory", function() {
      describe("by name", function() {
        it("should return a contract factory", async function() {
          // It's already compiled in artifacts/
          const contract = await this.env.hethers.getContractFactory(
            "Greeter"
          );

          assert.containsAllKeys(contract.interface.functions, [
            "setGreeting(string)",
            "greet()"
          ]);

          assert.equal(
            await contract.signer.getAddress(),
            await signers[0].getAddress()
          );
        });

        it("should fail to return a contract factory for an interface", async function() {
          try {
            await this.env.hethers.getContractFactory("IGreeter");
          } catch (reason: any) {
            assert.instanceOf(
              reason,
              NomicLabsHardhatPluginError,
              "getContractFactory should fail with a hardhat plugin error"
            );
            assert.isTrue(
              reason.message.includes("is abstract and can't be deployed"),
              "getContractFactory should report the abstract contract as the cause"
            );
            return;
          }

          // The test shouldn't reach this point.
          assert.fail(
            "getContractFactory should fail with an abstract contract"
          );
        });

        it("should link a library", async function() {
          const libraryFactory = await this.env.hethers.getContractFactory(
            "TestLibrary"
          );
          const library = await libraryFactory.deploy();

          const contractFactory = await this.env.hethers.getContractFactory(
            "TestContractLib",
            { libraries: { TestLibrary: library.address } }
          );
          assert.equal(
            await contractFactory.signer.getAddress(),
            await signers[0].getAddress()
          );
          const numberPrinter = await contractFactory.deploy();
          const someNumber = 50;
          assert.equal(
            await numberPrinter.callStatic.printNumber(someNumber),
            someNumber * 2
          );
        });

        it("should fail to link when passing in an ambiguous library link", async function() {
          const libraryFactory = await this.env.hethers.getContractFactory(
            "contracts/TestContractLib.sol:TestLibrary"
          );
          const library = await libraryFactory.deploy();

          try {
            await this.env.hethers.getContractFactory("TestContractLib", {
              libraries: {
                TestLibrary: library.address,
                "contracts/TestContractLib.sol:TestLibrary": library.address
              }
            });
          } catch (reason: any) {
            assert.instanceOf(
              reason,
              NomicLabsHardhatPluginError,
              "getContractFactory should fail with a hardhat plugin error"
            );
            assert.isTrue(
              reason.message.includes(
                "refer to the same library and were given as two separate library links"
              ),
              "getContractFactory should report the ambiguous link as the cause"
            );
            assert.isTrue(
              reason.message.includes(
                "TestLibrary and contracts/TestContractLib.sol:TestLibrary"
              ),
              "getContractFactory should display the ambiguous library links"
            );
            return;
          }

          // The test shouldn't reach this point
          assert.fail(
            "getContractFactory should fail when the link for one library is ambiguous"
          );
        });

        it("should link a library even if there's an identically named library in the project", async function() {
          const libraryFactory = await this.env.hethers.getContractFactory(
            "contracts/TestNonUniqueLib.sol:NonUniqueLibrary"
          );
          const library = await libraryFactory.deploy();

          const contractFactory = await this.env.hethers.getContractFactory(
            "TestNonUniqueLib",
            { libraries: { NonUniqueLibrary: library.address } }
          );
          assert.equal(
            await contractFactory.signer.getAddress(),
            await signers[0].getAddress()
          );
        });

        it("should fail to link an ambiguous library", async function() {
          const libraryFactory = await this.env.hethers.getContractFactory(
            "contracts/AmbiguousLibrary.sol:AmbiguousLibrary"
          );
          const library = await libraryFactory.deploy();
          const library2Factory = await this.env.hethers.getContractFactory(
            "contracts/AmbiguousLibrary2.sol:AmbiguousLibrary"
          );
          const library2 = await library2Factory.deploy();

          try {
            await this.env.hethers.getContractFactory("TestAmbiguousLib", {
              libraries: {
                AmbiguousLibrary: library.address,
                "contracts/AmbiguousLibrary2.sol:AmbiguousLibrary":
                library2.address
              }
            });
          } catch (reason: any) {
            assert.instanceOf(
              reason,
              NomicLabsHardhatPluginError,
              "getContractFactory should fail with a hardhat plugin error"
            );
            assert.isTrue(
              reason.message.includes("is ambiguous for the contract"),
              "getContractFactory should report the ambiguous name resolution as the cause"
            );
            assert.isTrue(
              reason.message.includes(
                "AmbiguousLibrary.sol:AmbiguousLibrary"
              ) &&
              reason.message.includes(
                "AmbiguousLibrary2.sol:AmbiguousLibrary"
              ),
              "getContractFactory should enumerate both available library name candidates"
            );
            return;
          }

          // The test shouldn't reach this point
          assert.fail(
            "getContractFactory should fail to retrieve an ambiguous library name"
          );
        });

        it("should fail to create a contract factory with missing libraries", async function() {
          try {
            await this.env.hethers.getContractFactory("TestContractLib");
          } catch (reason: any) {
            assert.instanceOf(
              reason,
              NomicLabsHardhatPluginError,
              "getContractFactory should fail with a hardhat plugin error"
            );
            assert.isTrue(
              reason.message.includes(
                "missing links for the following libraries"
              ),
              "getContractFactory should report the missing libraries as the cause"
            );
            assert.isTrue(
              reason.message.includes("TestContractLib.sol:TestLibrary"),
              "getContractFactory should enumerate missing library names"
            );
            return;
          }

          // The test shouldn't reach this point
          assert.fail(
            "getContractFactory should fail to create a contract factory if there are missing libraries"
          );
        });

        it("should fail to create a contract factory with an invalid address", async function() {
          const notAnAddress = "definitely not an address";
          try {
            await this.env.hethers.getContractFactory("TestContractLib", {
              libraries: { TestLibrary: notAnAddress }
            });
          } catch (reason: any) {
            assert.instanceOf(
              reason,
              NomicLabsHardhatPluginError,
              "getContractFactory should fail with a hardhat plugin error"
            );
            assert.isTrue(
              reason.message.includes("invalid address"),
              "getContractFactory should report the invalid address as the cause"
            );
            assert.isTrue(
              reason.message.includes(notAnAddress),
              "getContractFactory should display the invalid address"
            );
            return;
          }

          // The test shouldn't reach this point
          assert.fail(
            "getContractFactory should fail to create a contract factory if there is an invalid address"
          );
        });

        it("should fail to create a contract factory when incorrectly linking a library with an hethers.Contract", async function() {
          const libraryFactory = await this.env.hethers.getContractFactory(
            "TestLibrary"
          );
          const library = await libraryFactory.deploy();

          try {
            await this.env.hethers.getContractFactory("TestContractLib", {
              libraries: { TestLibrary: library as any }
            });
          } catch (reason: any) {
            assert.instanceOf(
              reason,
              NomicLabsHardhatPluginError,
              "getContractFactory should fail with a hardhat plugin error"
            );
            assert.isTrue(
              reason.message.includes(
                "invalid address",
                "getContractFactory should report the invalid address as the cause"
              )
            );
            // This assert is here just to make sure we don't end up printing an enormous object
            // in the error message. This may happen if the argument received is particularly complex.
            assert.isTrue(
              reason.message.length <= 400,
              "getContractFactory should fail with an error message that isn't too large"
            );
            return;
          }

          assert.fail(
            "getContractFactory should fail to create a contract factory if there is an invalid address"
          );
        });

        it("Should be able to send txs and make calls", async function() {
          const Greeter = await this.env.hethers.getContractFactory("Greeter");
          const greeter = await Greeter.deploy();

          assert.equal(await greeter.functions.greet(), "Hi");
          await greeter.functions.setGreeting("Hola");
          assert.equal(await greeter.functions.greet(), "Hola");
        });

        it("Should be able to deploy contracts with arguments in constructor", async function() {
          const GreeterWithArgs = await this.env.hethers.getContractFactory("GreeterWithArgs");
          const greeter = await GreeterWithArgs.deploy("SomeArgument");
          assert.equal(await greeter.functions.greet(), "SomeArgument");
        });

        it("Should throw the correct error messages when deploying with incorrect number of arguments", async function() {
          const GreeterWithArgs = await this.env.hethers.getContractFactory("GreeterWithArgs");

          try {
            const greeter = await GreeterWithArgs.deploy("SomeArgument", "ExtraArgument");
          } catch (err: any) {
            assert.exists(err);
            assert.equal(err.code, 'UNEXPECTED_ARGUMENT');
            assert.equal(err.reason, 'too many arguments:  in Contract constructor');
            assert.equal(err.count, 2);
            assert.equal(err.expectedCount, 1);
          }

          try {
            const greeter = await GreeterWithArgs.deploy("SomeArgument", "ExtraArgument", "ExtraExtraArgument");
          } catch (err: any) {
            assert.exists(err);
            assert.equal(err.code, 'UNEXPECTED_ARGUMENT');
            assert.equal(err.reason, 'too many arguments:  in Contract constructor');
            assert.equal(err.count, 3);
            assert.equal(err.expectedCount, 1);
          }

          try {
            const greeter = await GreeterWithArgs.deploy();
          } catch (err: any) {
            assert.exists(err);
            assert.equal(err.code, 'MISSING_ARGUMENT');
            assert.equal(err.reason, 'missing argument:  in Contract constructor');
            assert.equal(err.count, 0);
            assert.equal(err.expectedCount, 1);
            return;
          }

          assert.isTrue(false);
        });

        it("Should be able to deploy contracts with arguments in constructor and manually set gasLimit", async function() {
          const GreeterWithArgs = await this.env.hethers.getContractFactory("GreeterWithArgs");
          const greeter = await GreeterWithArgs.deploy("SomeArgument", {gasLimit: 300000});
          assert.equal(await greeter.functions.greet(), "SomeArgument");
        });

        describe("with custom signer", function() {
          it("should return a contract factory connected to the custom signer", async function() {
            // It's already compiled in artifacts/
            const contract = await this.env.hethers.getContractFactory(
              "Greeter",
              signers[1]
            );

            assert.containsAllKeys(contract.interface.functions, [
              "setGreeting(string)",
              "greet()"
            ]);

            assert.equal(
              await contract.signer.getAddress(),
              await signers[1].getAddress()
            );
          });
        });
      });

      describe("by abi and bytecode", function() {
        it("should return a contract factory", async function() {
          // It's already compiled in artifacts/
          const contract = await this.env.hethers.getContractFactory(
            greeterArtifact.abi,
            greeterArtifact.bytecode
          );

          assert.containsAllKeys(contract.interface.functions, [
            "setGreeting(string)",
            "greet()"
          ]);

          assert.equal(
            await contract.signer.getAddress(),
            await signers[0].getAddress()
          );
        });

        it("should return a contract factory for an interface", async function() {
          const contract = await this.env.hethers.getContractFactory(
            iGreeterArtifact.abi,
            iGreeterArtifact.bytecode
          );
          assert.equal(contract.bytecode, "0x");
          assert.containsAllKeys(contract.interface.functions, ["greet()"]);

          assert.equal(
            await contract.signer.getAddress(),
            await signers[0].getAddress()
          );
        });

        it("Should be able to send txs and make calls", async function() {
          const Greeter = await this.env.hethers.getContractFactory(
            greeterArtifact.abi,
            greeterArtifact.bytecode
          );
          const greeter = await Greeter.deploy();

          assert.equal(await greeter.functions.greet(), "Hi");
          await greeter.functions.setGreeting("Hola");
          assert.equal(await greeter.functions.greet(), "Hola");
        });

        describe("with custom signer", function() {
          it("should return a contract factory connected to the custom signer", async function() {
            // It's already compiled in artifacts/
            const contract = await this.env.hethers.getContractFactory(
              greeterArtifact.abi,
              greeterArtifact.bytecode,
              signers[1]
            );

            assert.containsAllKeys(contract.interface.functions, [
              "setGreeting(string)",
              "greet()"
            ]);

            assert.equal(
              await contract.signer.getAddress(),
              await signers[1].getAddress()
            );
          });
        });
      });
    });

    describe("getContractFactoryFromArtifact", function() {

      it("should return a contract factory", async function() {
        const contract = await this.env.hethers.getContractFactoryFromArtifact(
          greeterArtifact
        );

        assert.containsAllKeys(contract.interface.functions, [
          "setGreeting(string)",
          "greet()"
        ]);

        assert.equal(
          await contract.signer.getAddress(),
          await signers[0].getAddress()
        );
      });

      it("should link a library", async function() {
        const libraryFactory = await this.env.hethers.getContractFactory(
          "TestLibrary"
        );
        const library = await libraryFactory.deploy();

        const testContractLibArtifact = await this.env.artifacts.readArtifact(
          "TestContractLib"
        );

        const contractFactory =
          await this.env.hethers.getContractFactoryFromArtifact(
            testContractLibArtifact,
            { libraries: { TestLibrary: library.address } }
          );

        assert.equal(
          await contractFactory.signer.getAddress(),
          await signers[0].getAddress()
        );
        const numberPrinter = await contractFactory.deploy();
        const someNumber = 50;
        assert.equal(
          await numberPrinter.callStatic.printNumber(someNumber),
          someNumber * 2
        );
      });

      it("Should be able to send txs and make calls", async function() {
        const Greeter = await this.env.hethers.getContractFactoryFromArtifact(
          greeterArtifact
        );
        const greeter = await Greeter.deploy();

        assert.equal(await greeter.functions.greet(), "Hi");
        await greeter.functions.setGreeting("Hola");
        assert.equal(await greeter.functions.greet(), "Hola");
      });

      describe("with custom signer", function() {
        it("should return a contract factory connected to the custom signer", async function() {
          const contract =
            await this.env.hethers.getContractFactoryFromArtifact(
              greeterArtifact,
              signers[1]
            );

          assert.containsAllKeys(contract.interface.functions, [
            "setGreeting(string)",
            "greet()"
          ]);

          assert.equal(
            await contract.signer.getAddress(),
            await signers[1].getAddress()
          );
        });
      });
    });

    describe("getContractAt", function() {
      let deployedGreeter: hethers.Contract;

      beforeEach(async function() {
        const Greeter = await this.env.hethers.getContractFactory("Greeter");
        deployedGreeter = await Greeter.deploy();
      });

      describe("by name and address", function() {
        it("Should return an instance of a contract", async function() {
          const contract = await this.env.hethers.getContractAt(
            "Greeter",
            deployedGreeter.address
          );

          assert.containsAllKeys(contract.functions, [
            "setGreeting(string)",
            "greet()"
          ]);

          assert.equal(
            await contract.signer.getAddress(),
            await signers[0].getAddress()
          );
        });

        it("Should return an instance of an interface", async function() {
          const contract = await this.env.hethers.getContractAt(
            "IGreeter",
            deployedGreeter.address
          );

          assert.containsAllKeys(contract.functions, ["greet()"]);

          assert.equal(
            await contract.signer.getAddress(),
            await signers[0].getAddress()
          );
        });

        it("Should be able to send txs and make calls", async function() {
          const greeter = await this.env.hethers.getContractAt(
            "Greeter",
            deployedGreeter.address
          );

          assert.equal(await greeter.functions.greet(), "Hi");
          await greeter.functions.setGreeting("Hola");
          assert.equal(await greeter.functions.greet(), "Hola");
        });

        describe("with custom signer", function() {
          it("Should return an instance of a contract associated to a custom signer", async function() {
            const contract = await this.env.hethers.getContractAt(
              "Greeter",
              deployedGreeter.address,
              signers[1]
            );

            assert.equal(
              await contract.signer.getAddress(),
              await signers[1].getAddress()
            );
          });
        });
      });

      describe("by abi and address", function() {
        it("Should return an instance of a contract", async function() {
          const contract = await this.env.hethers.getContractAt(
            greeterArtifact.abi,
            deployedGreeter.address
          );

          assert.containsAllKeys(contract.functions, [
            "setGreeting(string)",
            "greet()"
          ]);

          assert.equal(
            await contract.signer.getAddress(),
            await signers[0].getAddress()
          );
        });

        it("Should return an instance of an interface", async function() {
          const contract = await this.env.hethers.getContractAt(
            iGreeterArtifact.abi,
            deployedGreeter.address
          );

          assert.containsAllKeys(contract.functions, ["greet()"]);

          assert.equal(
            await contract.signer.getAddress(),
            await signers[0].getAddress()
          );
        });

        it("Should be able to send txs and make calls", async function() {
          const greeter = await this.env.hethers.getContractAt(
            greeterArtifact.abi,
            deployedGreeter.address
          );

          assert.equal(await greeter.functions.greet(), "Hi");
          await greeter.functions.setGreeting("Hola");
          assert.equal(await greeter.functions.greet(), "Hola");
        });

        it("Should be able to detect events", async function() {

          const greeter = await this.env.hethers.getContractAt(
            greeterArtifact.abi,
            deployedGreeter.address
          );

          const provider = greeter.provider as HethersProviderWrapper;
          provider.pollingInterval = 1000;

          let eventEmitted = false;
          greeter.on("GreetingUpdated", () => {
            eventEmitted = true;
          });

          await greeter.setGreeting("Hola");

          // wait for 1.5 polling intervals for the event to fire
          await new Promise((resolve) =>
            setTimeout(resolve, provider.pollingInterval * 20)
          );

          assert.equal(eventEmitted, true);
        });

        describe("with custom signer", function() {
          it("Should return an instance of a contract associated to a custom signer", async function() {
            const contract = await this.env.hethers.getContractAt(
              greeterArtifact.abi,
              deployedGreeter.address,
              signers[1]
            );

            assert.equal(
              await contract.signer.getAddress(),
              await signers[1].getAddress()
            );
          });
        });

        it("should work with linked contracts", async function() {
          const libraryFactory = await this.env.hethers.getContractFactory(
            "TestLibrary"
          );
          const library = await libraryFactory.deploy();

          const contractFactory = await this.env.hethers.getContractFactory(
            "TestContractLib",
            { libraries: { TestLibrary: library.address } }
          );
          const numberPrinter = await contractFactory.deploy();

          const numberPrinterAtAddress = await this.env.hethers.getContractAt(
            "TestContractLib",
            numberPrinter.address
          );

          const someNumber = 50;
          assert.equal(
            await numberPrinterAtAddress.callStatic.printNumber(someNumber),
            someNumber * 2
          );
        });
      });
    });

    describe("getContractAtFromArtifact", function() {
      let deployedGreeter: hethers.Contract;

      beforeEach(async function() {
        const Greeter = await this.env.hethers.getContractFactory("Greeter");
        deployedGreeter = await Greeter.deploy();
      });

      describe("by artifact and address", function() {
        it("Should return an instance of a contract", async function() {
          const contract = await this.env.hethers.getContractAtFromArtifact(
            greeterArtifact,
            deployedGreeter.address
          );

          assert.containsAllKeys(contract.functions, [
            "setGreeting(string)",
            "greet()"
          ]);

          assert.equal(
            await contract.signer.getAddress(),
            await signers[0].getAddress()
          );
        });

        it("Should be able to send txs and make calls", async function() {
          const signers = await this.env.hethers.getSigners();
          const greeter = await this.env.hethers.getContractAtFromArtifact(
            greeterArtifact,
            deployedGreeter.address
          );

          assert.equal(await greeter.functions.greet(), "Hi");
          const receipt = await greeter.functions.setGreeting("Hola");
          assert.equal(await greeter.functions.greet(), "Hola");
          assert.equal(receipt.from, signers[0].address);
        });

        it("Should be able to connect different signer and send txs and make calls", async function() {
          const signers = await this.env.hethers.getSigners();

          const greeter = await this.env.hethers.getContractAtFromArtifact(
            greeterArtifact,
            deployedGreeter.address
          );

          const receipt = await greeter.connect(signers[1]).functions.setGreeting("Hola from the second signer");

          assert.equal(await greeter.functions.greet(), "Hola from the second signer");
          assert.equal(receipt.from, signers[1].address);
          assert.notEqual(receipt.from, signers[0].address);
        });

        describe("with custom signer", function() {
          it("Should return an instance of a contract associated to a custom signer", async function() {
            const contract = await this.env.hethers.getContractAtFromArtifact(
              greeterArtifact,
              deployedGreeter.address,
              signers[1]
            );

            assert.equal(
              await contract.signer.getAddress(),
              await signers[1].getAddress()
            );
          });
        });
      });
    });
  });

});




