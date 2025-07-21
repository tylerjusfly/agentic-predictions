import { Request, Response } from "express";
import { generateTextsFromData } from "../../data/load-data";
import { client, openai } from "./client";


async function embedTexts(texts: string[]) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts
  });
  return response.data.map((item) => item.embedding);
}

export default class ChromaService {
  public createCollection = async (req: Request, res: Response): Promise<any> => {
    try {
      const { name } = req.body;

      const collections = await client.listCollections();

      const exists = collections.find((c) => c === name);

      if (exists) {
        return res.status(400).json({ error: "collection already exists" });
      }

      const collection = await client.createCollection({
        name
      });

      return res.json({ name: collection.name });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Error creating collection" });
    }
  };

  public populateCollection = async (req: Request, res: Response): Promise<any> => {
    try {
      const collection = await client.getCollection({ name: "predictions" });
      // load and generate text
      const texts = generateTextsFromData();

      // Turn text to embedings
      const embeddings = await embedTexts(texts);

      const ids = texts.map((_, i) => `doc_${i}`);

      await collection.add({
        ids,
        embeddings,
        documents: texts,
        metadatas: texts.map((text) => ({ text }))
      });

      return res.json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Error populating collection" });
    }
  };
}
