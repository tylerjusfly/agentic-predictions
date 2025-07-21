export interface LLMResponse {
  response: string;
  messages: any[];
}

export interface LLMObjectResponse {
  response: any;
  messages: any[];
}


export interface LLM {
//   generateText(messages: any[], temperature?: number): Promise<LLMResponse>;
  generateObject(messages: any[], schema: any, temperature?: number): Promise<LLMObjectResponse>;
}