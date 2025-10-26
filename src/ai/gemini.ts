import { GoogleGenAI } from "@google/genai";
import logger from "../utils/logger";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function AnalyzeMatch(prompt: string) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  return response.text;
}

export async function getEmbedding(prompt: string) {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: prompt,
  });

  console.log(response.embeddings?.values);
  return response.embeddings?.[0]?.values;
}
