import OpenAIClient from "@lib/infra/openai";

export class OpenAIIntegrator {
    client: OpenAIClient;

    constructor() {
        this.client = OpenAIClient.getInstance();
    }


}
