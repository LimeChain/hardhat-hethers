import 'mocha';
import path from 'path';
import {resetHardhatContext} from 'hardhat/plugins-testing';
import '../src/internal/type-extensions';

export function useEnvironment(
    fixtureProjectName: string,
    networkName = 'localhost'
) {
    beforeEach('Loading hardhat environment', function () {
        process.chdir(path.join(__dirname, 'fixture-projects', fixtureProjectName));
        process.env.HARDHAT_NETWORK = networkName;

        this.env = require('hardhat');
    });

    afterEach('Resetting hardhat', function () {
        resetHardhatContext();
    });
}
