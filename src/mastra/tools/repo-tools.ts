import { createTool } from "@mastra/core";
import { z } from "zod";
import { GitHubRepoSummary } from "../utils/definitions";

export const repoTool = createTool({
  id: "repo-info",
  description: "Get a repository information from a git url",
  inputSchema: z.object({
    repoUrl: z.string().describe("The URL of the git repository"),
  }),
  outputSchema: z.object({
    name: z.string(),
    description: z.string().nullable(),
    stars: z.number(),
    forks: z.number(),
    openIssues: z.number(),
    lastUpdated: z.string(),
    activityLevel: z.string(),
    commitsCount: z.number(),
    createdAt: z.string(),
    owner: z.object({
      name: z.string(),
      profileUrl: z.string(),
    }),
  }),
  execute: async ({ context }) => {
    return await fetchRepoInfo(context.repoUrl);
  },
});

const fetchRepoInfo = async (repoUrl: string) => {
  const repoMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)(\.git)?$/);
  if (!repoMatch) {
    throw new Error("Invalid GitHub repository URL");
  }

  const owner = repoMatch[1];
  const repo = repoMatch[2];
  const baseApiUrl = "https://api.github.com/repos";

  const getRepoUrl = `${baseApiUrl}/${owner}/${repo}`;
  const getCommitsUrl = `${baseApiUrl}/${owner}/${repo}/commits?since=${new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString()}`;

  const response = await fetch(getRepoUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch repository info: ${response.statusText}`);
  }

  const data: GitHubRepoSummary = await response.json();

  const commitsResponse = await fetch(getCommitsUrl);
  if (!commitsResponse.ok) {
    throw new Error(
      `Failed to fetch commits info: ${commitsResponse.statusText}`
    );
  }
  const commitsData = (await commitsResponse.json()) as any[];
  const activityLevel = getActivityLevel(commitsData.length);

  data.commits_count = commitsData.length;

  return {
    name: data.name,
    description: data.description,
    stars: data.stargazers_count,
    forks: data.forks_count,
    openIssues: data.open_issues_count,
    lastUpdated: data.updated_at,
    createdAt: data.created_at,
    activityLevel: activityLevel,
    commitsCount: data.commits_count,
    owner: {
      name: data.owner.login,
      profileUrl: data.owner.html_url,
    },
  };
};

function getActivityLevel(commitsLastMonth: number): string {
  if (commitsLastMonth >= 20) {
    return "High";
  } else if (commitsLastMonth >= 5) {
    return "Medium";
  } else {
    return "Low";
  }
}
