import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { LLM, LLMObjectResponse } from "./llm";
import { GEMINI_API_KEY } from "@/lib/constants";

// ─── Gemini ───────────────────────────────────────────────

export class GeminiModel implements LLM {
  public contextLength: number = 1000000;
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "");
  }

  async generateObject(messages: any[], schema: any, temperature: number = 0): Promise<LLMObjectResponse> {
    const cleanSchema = schema ? this.cleanSchemaForGemini(schema) : undefined;
    const { systemInstruction, userPrompt } = this.convertToGeminiHistory(messages);

    const model = this.genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.5-pro",
      systemInstruction: systemInstruction,
    });

    const chatSession = model.startChat({
      generationConfig: {
        temperature,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 65536,
        responseMimeType: "application/json",
        responseSchema: cleanSchema,
      },
    });

    const result = await chatSession.sendMessage(userPrompt);
    let responseText = result.response.text();

    responseText = responseText.replace(/^[^[{]*/, "").replace(/[^}\]]*$/, "");
    const generatedObject = JSON.parse(responseText);

    messages.push({ role: "assistant", content: responseText });
    return { response: generatedObject, messages };
  }

  private cleanSchemaForGemini(schema: any): any {
    if (schema.$schema !== undefined) delete schema.$schema;
    if (schema.additionalProperties !== undefined) delete schema.additionalProperties;
    if (schema.optional !== undefined) delete schema.optional;

    if (schema.properties && typeof schema.properties === "object") {
      schema.required = Object.keys(schema.properties);
      for (const prop of Object.values(schema.properties)) {
        if (typeof prop === "object") this.cleanSchemaForGemini(prop);
      }
    }

    if (schema.items && typeof schema.items === "object") {
      this.cleanSchemaForGemini(schema.items);
    }

    return schema;
  }

  private convertToGeminiHistory(messages: OpenAI.Chat.ChatCompletionMessageParam[]): {
    geminiHistory: any;
    systemInstruction: any;
    userPrompt: any;
  } {
    const geminiHistory: any[] = [];
    let userPrompt: any;
    let systemInstruction: any;

    for (let i = 0; i < messages.length; i++) {
      if (messages[i].role == "system") {
        systemInstruction = messages[i].content;
        continue;
      }
      if (i == messages.length - 1) {
        userPrompt = messages[i].content;
        continue;
      }
      geminiHistory.push({
        role: messages[i].role == "assistant" ? "model" : messages[i].role,
        parts: [{ text: messages[i].content }],
      });
    }

    return { geminiHistory, systemInstruction, userPrompt };
  }
}

// ─── Claude (Anthropic) ──────────────────────────────────

export class ClaudeModel implements LLM {
  private client: Anthropic;
  private model: string;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || "",
    });
    this.model = process.env.CLAUDE_MODEL || "claude-sonnet-4-20250514";
  }

  async generateObject(messages: any[], schema: any, temperature: number = 0): Promise<LLMObjectResponse> {
    let systemPrompt = "";
    const claudeMessages: Anthropic.MessageParam[] = [];

    for (const msg of messages) {
      if (msg.role === "system") {
        systemPrompt = msg.content;
      } else {
        claudeMessages.push({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        });
      }
    }

    const schemaInstruction = schema
      ? `\n\nYou MUST respond with valid JSON only, no markdown or code fences. The response must match this JSON schema:\n${JSON.stringify(schema, null, 2)}`
      : "";

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 8192,
      temperature,
      system: systemPrompt + schemaInstruction,
      messages: claudeMessages,
    });

    const textBlock = response.content.find((block) => block.type === "text");
    let responseText = textBlock?.text || "";

    responseText = responseText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .replace(/^[^[{]*/, "")
      .replace(/[^}\]]*$/, "");

    const generatedObject = JSON.parse(responseText);
    messages.push({ role: "assistant", content: responseText });

    return { response: generatedObject, messages };
  }
}

// ─── OpenAI ──────────────────────────────────────────────

export class OpenAIModel implements LLM {
  private client: OpenAI;
  private model: string;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "",
    });
    this.model = process.env.OPENAI_MODEL || "gpt-4o";
  }

  async generateObject(messages: any[], schema: any, temperature: number = 0): Promise<LLMObjectResponse> {
    const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Append schema instruction to the system message
    if (schema && openaiMessages.length > 0 && openaiMessages[0].role === "system") {
      openaiMessages[0].content += `\n\nYou MUST respond with valid JSON only. The response must match this JSON schema:\n${JSON.stringify(schema, null, 2)}`;
    }

    const response = await this.client.chat.completions.create({
      model: this.model,
      temperature,
      response_format: { type: "json_object" },
      messages: openaiMessages,
    });

    let responseText = response.choices[0]?.message?.content || "";
    responseText = responseText.replace(/^[^[{]*/, "").replace(/[^}\]]*$/, "");
    const generatedObject = JSON.parse(responseText);

    messages.push({ role: "assistant", content: responseText });
    return { response: generatedObject, messages };
  }
}

// ─── Factory ─────────────────────────────────────────────

/**
 * Returns the LLM implementation based on `LLM_PROVIDER` env var.
 * Supported values: GEMINI (default), ANTHROPIC, OPENAI
 */
export function createLLM(): LLM {
  const provider = (process.env.LLM_PROVIDER || "GEMINI").toUpperCase();

  switch (provider) {
    case "ANTHROPIC":
      return new ClaudeModel();
    case "OPENAI":
      return new OpenAIModel();
    case "GEMINI":
    default:
      return new GeminiModel();
  }
}
