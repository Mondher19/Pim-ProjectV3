import { Octokit } from "@octokit/core";

const octokit = new Octokit({
  auth: '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'
});

async function getRepositories() {
  try {
    const { data } = await octokit.request('GET /user/repos', {});
    const repositories = [];
    for (const repo of data) {
      const { data: branches } = await octokit.request(`GET /repos/${repo.owner.login}/${repo.name}/branches`);
      repositories.push({
        id: repo.id,
        name: repo.name,
        url: repo.html_url,
        branches: branches.map(branch => branch.name)
      });
    }
    return repositories;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default getRepositories;
