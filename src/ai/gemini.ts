import { GoogleGenAI } from "@google/genai";
import logger from "../utils/logger";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_APIKEY,
});

export const AnalyzeMatch = async (prompt: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  return response.text;
};
