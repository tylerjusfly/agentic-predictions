import { ChromaClient } from "chromadb";
import { OpenAI } from "openai";
import dotenv from "dotenv";
import { OPENAI_API_KEY } from "../../utils/enviroments";
dotenv.config();


export const client = new ChromaClient({
  path: process.env.CHROMA_URL
});

export const openai = new OpenAI({ apiKey: OPENAI_API_KEY });