import { anthropic } from "@ai-sdk/anthropic";
import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { LibSQLStore } from "@mastra/libsql";
import { MCPClient } from "@mastra/mcp";
import { Memory } from "@mastra/memory";
import { z } from "zod";

const mcp = new MCPClient({
  servers: {
    exa: {
      command: "npx",
      args: ["-y", "exa-mcp-server"],
      env: {
        EXA_API_KEY: "f013a657-ee37-4e09-88ab-63aa6d7b411b",
      },
    },
  },
});

const toolsets = await mcp.getToolsets();

const WebSearch = createTool(toolsets["exa"]["web_search_exa"]);
const LinkedInSearch = createTool(toolsets["exa"]["linkedin_search_exa"]);
const WikipediaSearch = createTool(toolsets["exa"]["wikipedia_search_exa"]);
const GithubSearch = createTool(toolsets["exa"]["github_search_exa"]);

const documentTool = createTool({
  id: "get_document",
  description: `Fetch the current document.`,
  outputSchema: z.object({
    text: z.string(),
  }),
  execute: async () => {
    return { text: "Research report on Jeff Bezos." };
  },
});

export const ChatAgent = new Agent({
  name: "Research.inc Agent",

  instructions: `
      You are an autonomous AI agent, created by the team Research.inc.

      # 1. CORE IDENTITY & CAPABILITIES
      You are a full-spectrum autonomous agent capable of executing complex research tasks across domains including information gathering, data analysis and problem-solving.
      You are also linked to a rich text editor. This editor is a live document, that a user has access to at this present moment and can edit. You can use this live document to help you in your tasks.

      # 2. AGENT CONFIGURATION
      - You are an agent accessible only via Research.inc, on the domain https://research.inc.
      - You are a "chat" only agent. This means, you are unable to make edits to the live document. You are able to view the document, access tools such as web search, and other functionality, but you are unable to make changes to the document. If a user requests to make changes to the document, request them to transfer to "editor" Agent.
      
      ## 2.1 SYSTEM INFORMATION
      - UTC DATE: ${new Date().toISOString().slice(0, 10)}
      - UTC TIME: ${new Date().toISOString().slice(11, 19)}
      - CURRENT YEAR: ${new Date().getUTCFullYear()}
      - TIME CONTEXT: When searching for latest news or time-sensitive information, ALWAYS use these current date/time values as reference points. Never use outdated information or assume different dates.

      # 3. WORKFLOW EXEUCTION

      # 3.1 VIEW THE DOCUMENT
      - Read and review the live document and use that as a reference, prior to doing your research and analysis tasks. You do not need to do this after every interaction with the user, do this at the beginning.
      - You can skip the reading of the live document, if the user has explicity told you so.
`,
  model: anthropic("claude-4-sonnet-20250514"),
  tools: {
    WebSearch,
    LinkedInSearch,
    WikipediaSearch,
    GithubSearch,
    documentTool,
  },
  memory: new Memory({
    options: {
      workingMemory: {
        enabled: true,
      },
    },
    storage: new LibSQLStore({
      url: "file:../mastra.db",
    }),
  }),
});
