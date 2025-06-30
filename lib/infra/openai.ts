import { Express } from "express";
import { OpenAI } from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

interface OpenAIConfig {
    OPENAI_API_KEY: string;
}

class OpenAIClient {
    private static instance: OpenAIClient | null = null;
    private static client: OpenAI | null = null;
    private static config: OpenAIConfig = {
        OPENAI_API_KEY: "",
    };
    private static initialized = false;

    private constructor() {
    }

    public static initApp(app: Express): void {
        const { OPENAI_API_KEY } = app.get("config");
        OpenAIClient.config.OPENAI_API_KEY = OPENAI_API_KEY;
        OpenAIClient.client = new OpenAI({
            apiKey: OPENAI_API_KEY,
        });
        OpenAIClient.initialized = true;
    }

    public static getInstance(): OpenAIClient {
        if (!OpenAIClient.initialized || !OpenAIClient.client) {
            throw new Error("OpenAIClient not initialized. Call OpenAIClient.initApp() first.");
        }

        if (!OpenAIClient.instance) {
            OpenAIClient.instance = new OpenAIClient();
        }

        return OpenAIClient.instance;
    }

    public async chat(messages: ChatCompletionMessageParam[], model: string = "gpt-4", temperature: number = 0.7): Promise<string> {
        const completion = await OpenAIClient.client!.chat.completions.create({
            model,
            messages,
            temperature,
        });

        return completion.choices[0].message.content ?? "";
    }

    public get rawClient() {
        return OpenAIClient.client!;
    }
}

export default OpenAIClient;
