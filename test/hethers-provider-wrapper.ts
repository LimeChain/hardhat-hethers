import 'mocha';
import {assert} from 'chai';
import {HethersProviderWrapper} from '../src/internal/hethers-provider-wrapper';
import {hethers} from '@hashgraph/hethers';
import {useEnvironment} from './helpers';
import path from 'path';
import dotenv from "dotenv";
dotenv.config({path: path.resolve(__dirname, '../.env')});

const test_on = process.env['RUN_TEST_ON'];
// @ts-ignore
const test_on_lowercase = test_on.toLowerCase();


describe('Hethers provider wrapper', function () {
    let realProvider: hethers.providers.BaseProvider;
    let wrapperProvider: HethersProviderWrapper;

    useEnvironment('hardhat-project', test_on_lowercase);

    beforeEach(function () {
        realProvider = new hethers.providers.BaseProvider(test_on_lowercase);
        wrapperProvider = new HethersProviderWrapper(this.env.network.provider);
    });

    it('Should return the same as the real provider', async function () {
        const accountId = process.env[`${test_on}_ACCOUNT_ID_2`];
        // @ts-ignore
        const realProviderResponse = (await realProvider.getBalance(accountId)).toString();
        // @ts-ignore
        const wrapperProviderResponse = (await wrapperProvider.getBalance(accountId)).toString();

        assert.deepEqual(realProviderResponse, wrapperProviderResponse);
    });

    it('Should return the same error', async function () {
        try {
            await realProvider.getCode('error_please');
            assert.fail('realProvider should have failed');
        } catch (_err) {
            const err = _err as Error;
            try {
                await wrapperProvider.getCode('error_please');
                assert.fail('wrapperProvider should have failed');
            } catch (_err2) {
                const err2 = _err2 as Error;
                assert.deepEqual(err2.message, err.message);
            }
        }
    });
});
