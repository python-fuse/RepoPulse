import { Message } from "@mastra/core/a2a";
import { registerApiRoute } from "@mastra/core/server";
import { error } from "console";

export const a2aAgentApiRoute = registerApiRoute("/a2a/agent/:agentId", {
  method: "POST",
  handler: async (ctx) => {
    try {
      const mastra = ctx.get("mastra");
      const agentId = ctx.req.param("agentId");

      //   Parse the JSON-RPC 2.0 request body
      const body = await ctx.req.json();

      const { jsonrpc, method, params, id: requestId } = body;

      if (jsonrpc !== "2.0") {
        return ctx.json(
          {
            jsonrpc: "2.0",
            id: requestId || null,
            error: {
              code: -32602,
              message: "Invalid Request",
              data: {
                details:
                  "jsonrpc version must be '2.0' and id must be provided",
              },
            },
          },
          400
        );
      }

      const agent = mastra.getAgent(agentId);
      if (!agent) {
        return ctx.json(
          {
            jsonrpc: "2.0",
            id: requestId || null,
            error: {
              code: -32601,
              message: `Agent '${agentId}' not found`,
            },
          },
          404
        );
      }

      let { message, messages, contextId, taskId, metadata } = params || {};

      let messageList = [];

      if (message) {
        messageList = [message];
      } else if (messages && Array.isArray(messages)) {
        messageList = messages;
      }

      //   convert A2A messages to mastra format
      const mastraMessages = messageList.map((msg: Message) => ({
        role: msg.role,
        content:
          msg.parts
            ?.map((part) => {
              if (part.kind === "text") return part.text;
              // if (part.kind === "text") return JSON.stringify(part.data);
              return "";
            })
            .join("\n") || "",
      }));

      // Convert to simple string array
      const response = await agent.generate(
        mastraMessages.map((msg) => `${msg.role}: ${msg.content}`)
      );

      const agentText = response.text || "";

      //   build artifacts array
      const artifacts: any = [
        {
          artifactId: crypto.randomUUID(),
          name: `${agentId}Response`,
          parts: [{ kind: "text", text: agentText }],
        },
      ];

      //   add tool results as artifacts

      if (response.toolResults && response.toolResults.length > 0) {
        artifacts.push({
          artifactId: crypto.randomUUID(),
          name: "ToolResults",
          parts: response.toolResults.map((result) => ({
            kind: "data",
            data: result.payload.result,
          })),
        });
      }

      console.log("Artifacts:", response.toolResults);

      //   Conversation history
      const conversationHistory: Message[] = [
        ...messageList.map((msg: Message) => ({
          kind: "message" as const,
          role: msg.role,
          parts: msg.parts,
          messageId: msg.messageId || crypto.randomUUID(),
          taskId: msg.taskId || crypto.randomUUID(),
        })),
        {
          kind: "message" as const,
          role: "agent",
          parts: [{ kind: "text", text: agentText }],
          messageId: crypto.randomUUID(),
          taskId: taskId || crypto.randomUUID(),
        },
      ];

      //   finally return the response as an a2a response
      return ctx.json({
        jsonrpc: "2.0",
        id: requestId,
        result: {
          id: taskId || crypto.randomUUID(),
          contextId: contextId || crypto.randomUUID(),
          status: {
            state: "completed",
            timestamp: new Date().toISOString(),
            message: {
              messageId: crypto.randomUUID(),
              role: "agent",
              parts: [{ kind: "text", text: agentText }],
              kind: "message" as const,
            },
          },
        },
        artifacts: artifacts,
        history: conversationHistory,
        kind: "task" as const,
      });
    } catch (err) {
      return ctx.json(
        {
          jsonrpc: "2.0",
          id: null,
          error: {
            code: -32603,
            message: "Internal error",
            data: {
              details: (error as unknown as Error).message,
            },
          },
        },
        500
      );
    }
  },
});
