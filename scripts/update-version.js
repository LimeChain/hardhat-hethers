const {exec} = require('child_process');
const {getLatestRelease} = require('./helpers');

(async function() {
    let latestRelease = await getLatestRelease();
    if (latestRelease && latestRelease.prerelease) {
        let name = latestRelease.name.toLowerCase();

        let versionType = 'patch';

        if (name.includes('minor')) {
            versionType = 'minor';
        }
        else if (name.includes('major')) {
            versionType = 'major';
        }

        try {
            await exec(`npm version ${versionType} --no-git-tag-version`);
        }
        catch(err) {
            console.error(err);
        }
    }
})();