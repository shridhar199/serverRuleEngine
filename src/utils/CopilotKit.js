import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import {
  CopilotRuntime,
  LangChainAdapter,
} from '@copilotkit/runtime';

// Initialize the Google Generative AI model
const model = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  temperature: 0,
  apiKey: process.env.GOOGLE_API_KEY,
});

// Create CopilotRuntime instance
export const runtime = new CopilotRuntime();

export const serviceAdapter = new LangChainAdapter({
  chainFn: async ({ messages, tools, threadId }) => {
    console.log("POST messages: ", messages);
    console.log("POST tools: ", Object.keys(tools));
    console.log("POST tools: ", tools.map(tool => {
      return {
        name: tool.lc_kwargs.name,
        func: JSON.stringify(tool.lc_kwargs.func)
      };
    }));
    console.log("POST threadId: ", threadId);
    
    const modelWithTools = model.bindTools(tools);
    return modelWithTools.stream(messages, { 
      tools, 
      metadata: { conversation_id: threadId } 
    });
  },
});