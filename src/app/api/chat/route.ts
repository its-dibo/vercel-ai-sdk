import {
  streamText,
  UIMessage,
  convertToModelMessages,
  tool,
  stepCountIs,
  wrapLanguageModel,
} from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";
import { devToolsMiddleware } from "@ai-sdk/devtools";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const model = wrapLanguageModel({
  model: openrouter("openrouter/free"),
  middleware: devToolsMiddleware(),
});

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    onStepFinish: ({ toolResults }) => {
      console.log(toolResults);
    },
    tools: {
      weather: tool({
        description: "Get the weather in a location (celsius)",
        inputSchema: z.object({
          location: z.string().describe("The location to get the weather for"),
        }),
        execute: async ({ location }) => {
          const temperature = 25;
          return {
            location,
            temperature,
          };
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
