"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyzeMatch = AnalyzeMatch;
exports.getEmbedding = getEmbedding;
const genai_1 = require("@google/genai");
const ai = new genai_1.GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});
async function AnalyzeMatch(prompt) {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    return response.text;
}
async function getEmbedding(prompt) {
    const response = await ai.models.embedContent({
        model: "gemini-embedding-001",
        contents: prompt,
    });
    return response.embeddings?.[0]?.values;
}
