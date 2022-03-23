const axios = require("axios");
const githubRepo = "LimeChain/hardhat-hethers";

async function getLatestRelease() {
  const res = await axios.get(`https://api.github.com/repos/${githubRepo}/releases`, {
    headers: { "authorization": `Bearer ${process.env.GITHUB_TOKEN}` }
  });

  return res.data[0];
}

async function deleteRelease(releaseId) {
  return axios.delete(`https://api.github.com/repos/${githubRepo}/releases/${releaseId}`, {
    headers: { "authorization": `Bearer ${process.env.GITHUB_TOKEN}` }
  });
}

async function createRelease(data) {
  const { tag_name, target_commitish, name, body } = data;
  return axios({
    method: "post",
    url: `https://api.github.com/repos/${githubRepo}/releases`,
    data: {
      tag_name,
      target_commitish,
      name,
      body,
      draft: false,
      prerelease: false
    },
    headers: { "authorization": `Bearer ${process.env.GITHUB_TOKEN}` }
  });
}

module.exports = { getLatestRelease, deleteRelease, createRelease };