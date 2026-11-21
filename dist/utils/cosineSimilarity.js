"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cosineSimilarity = cosineSimilarity;
function cosineSimilarity(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) {
        throw new Error("Vectors must have the same length");
    }
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    for (let i = 0; i < vectorA.length; i++) {
        dotProduct += vectorA[i] * vectorB[i];
        magnitudeA += vectorA[i] * vectorA[i];
        magnitudeB += vectorB[i] * vectorB[i];
    }
    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);
    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }
    return dotProduct / (magnitudeA * magnitudeB);
}
