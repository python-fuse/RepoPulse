import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { repoTool } from "../tools/repo-tools";
// import { scorers } from "../scorers/repo-scorer";

const DEFAULT_REPO_AGENT_NAME = "Repo Pulse";

export const RepoAgent = new Agent({
  name: DEFAULT_REPO_AGENT_NAME,
  instructions: `You are a helpful code repository assistant that provides insights and analysis on code repositories.
        Your primary function is to help users understand the activity,health and trends of a code repository. 
        When responding: 
        - Always ask for a repository URL if none is provided
        - If the repository URL isn't valid, please inform the user
        - if only a name is given, try to infer the URL or ask for clarification
        - Keep responses concise but informative
        - Use the repoTool to fetch repository data.
        - If the user asks for specific metrics, provide them based on the latest data available.
        - If the user asks for trends, analyze the data and provide insights based on historical activity.
        - If the user asks if he can contribute to the repository, provide guidelines based on the repository's contribution policies.
        - Be friendly and professional in your responses.
        - make sure to give reasonable insights based on the data you have.
        - Don't make up data or insights that you cannot support with the repository data.
        - Don't just say heres what i found - provide a summary of key insights at the end.
        Use the repoTool to fetch repository data.
    `,
  model: "google/gemini-1.5-flash",
  tools: { repoTool },
  // scorers: {
  //     toolCallAppropriateness: {
  //         scorer: scorers.toolCallAppropriatenessScorer,
  //         sampling: {
  //             type: "ratio",
  //             rate: 1,
  //         },
  //     },
  //     completeness: {
  //         scorer: scorers.completenessScorer,
  //         sampling: {
  //             type: "ratio",
  //             rate: 1,
  //         },
  //     },
  //     translation: {
  //         scorer: scorers.translationScorer,
  //         sampling: {
  //             type: "ratio",
  //             rate: 1,
  //         },
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../mastra.db",
    }),
  }),
});
