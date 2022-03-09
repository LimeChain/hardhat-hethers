import 'mocha';
import {assert} from 'chai';
import {HethersProviderWrapper} from '../src/internal/hethers-provider-wrapper';
import {hethers} from '@hashgraph/hethers';
import {useEnvironment} from './helpers';

describe('Hethers provider wrapper', function () {
    let realProvider: hethers.providers.BaseProvider;
    let wrapperProvider: HethersProviderWrapper;

    useEnvironment('hardhat-project', 'testnet');

    beforeEach(function () {
        realProvider = new hethers.providers.BaseProvider('testnet');
        wrapperProvider = new HethersProviderWrapper(this.env.network.provider);
    });

    it('Should return the same as the real provider', async function () {
        const realProviderResponse = (await realProvider.getBalance('0.0.28542425')).toString();
        const wrapperProviderResponse = (await wrapperProvider.getBalance('0.0.28542425')).toString();

        assert.deepEqual(realProviderResponse, wrapperProviderResponse);
    });

    it('Should return the same error', async function () {
        try {
            await realProvider.getCode('error_please');
            assert.fail('realProvider should have failed');
        } catch (err: any) {
            try {
                await wrapperProvider.getCode('error_please');
                assert.fail('wrapperProvider should have failed');
            } catch (err2: any) {
                assert.deepEqual(err2.message, err.message);
            }
        }
    });
});
