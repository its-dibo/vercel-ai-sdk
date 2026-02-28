import { streamText, UIMessage, convertToModelMessages, tool } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { z } from 'zod';


 const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
   model: openrouter("openrouter/free"),
    messages: await convertToModelMessages(messages),
    tools: {
      weather: tool({
        description: 'Get the weather in a location (celsius)',
        inputSchema: z.object({
          location: z.string().describe('The location to get the weather for'),
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

