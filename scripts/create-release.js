const { exec } = require("child_process");
const { getLatestRelease, deleteRelease, createRelease } = require("./helpers");

const sleep = async (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

(async () => {
  let latestRelease = await getLatestRelease();
  if (latestRelease && latestRelease.prerelease) {
    if (latestRelease && latestRelease.prerelease) {
      await deleteRelease(latestRelease.id.toString());

      const { tag_name } = latestRelease;

      // Delete the tag:
      await exec(`git push --delete origin ${tag_name}`);

      // Recreate the tag:
      await exec(`git tag ${tag_name}`);
      await exec(`git push origin --tags`);
    }

    latestRelease.name = latestRelease.name
      .replace("minor", "")
      .replace("major", "")
      .trim();

    await sleep(5000);
    await createRelease(latestRelease);

  }
})();