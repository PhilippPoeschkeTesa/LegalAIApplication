import { ClientSecretCredential } from "@azure/identity";
import { AIProjectClient } from "@azure/ai-projects";

interface ChatServiceConfig {
  projectEndpoint: string;
  agentName: string;
  tenantId: string;
  clientId: string;
  clientSecret: string;
}

class ChatService {
  private projectClient: AIProjectClient;
  private retrievedAgent: any;
  private openAIClient: any;
  private isInitialized: boolean = false;

  constructor(private config: ChatServiceConfig) {
    const credential = new ClientSecretCredential(
      config.tenantId,
      config.clientId,
      config.clientSecret
    );

    this.projectClient = new AIProjectClient(
      config.projectEndpoint,
      credential
    );
  }

  async initialize(): Promise<void> {
    try {
      console.log("🤖 Initializing Azure AI Agent...");
      this.retrievedAgent = await this.projectClient.agents.get(this.config.agentName);
      this.openAIClient = await this.projectClient.getOpenAIClient();
      this.isInitialized = true;
      console.log("✅ Agent initialized:", this.retrievedAgent.name);
    } catch (error) {
      console.error("❌ Failed to initialize agent:", error);
      throw new Error("Failed to initialize AI agent");
    }
  }

  async handleMessage(userMessage: string): Promise<string> {
    if (!this.isInitialized) {
      throw new Error("Chat service not initialized");
    }

    try {
      const conversation = await this.openAIClient.conversations.create({
        items: [{ type: "message", role: "user", content: userMessage }]
      });

      await new Promise(resolve => setTimeout(resolve, 3000));

      const response = await this.openAIClient.responses.create(
        { conversation: conversation.id },
        {
          body: {
            agent: {
              name: this.retrievedAgent.name,
              type: "agent_reference"
            }
          }
        }
      );

      return response.output_text || "I apologize, but I couldn't generate a response. Please try again.";
    } catch (error: any) {
      console.error("Error generating response:", error);
      throw new Error(error.message || "Failed to generate AI response");
    }
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}

let chatServiceInstance: ChatService | null = null;

export async function initChatService(): Promise<void> {
  const config: ChatServiceConfig = {
    projectEndpoint: process.env.AZURE_AI_PROJECT_ENDPOINT || "",
    agentName: process.env.AZURE_AI_AGENT_NAME || "",
    tenantId: process.env.AZURE_TENANT_ID || "",
    clientId: process.env.AZURE_CLIENT_ID || "",
    clientSecret: process.env.AZURE_CLIENT_SECRET || "",
  };

  if (!config.projectEndpoint || !config.agentName || !config.tenantId ||
      !config.clientId || !config.clientSecret) {
    throw new Error("Missing required Azure AI configuration in environment variables");
  }

  chatServiceInstance = new ChatService(config);
  await chatServiceInstance.initialize();
}

export function getChatService(): ChatService {
  if (!chatServiceInstance) {
    throw new Error("Chat service not initialized. Call initChatService first.");
  }
  return chatServiceInstance;
}

export async function handleChatMessage(message: string): Promise<string> {
  const service = getChatService();
  return await service.handleMessage(message);
}
