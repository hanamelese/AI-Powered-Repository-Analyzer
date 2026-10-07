import { pipeline } from "@xenova/transformers";

let extractorInstance: any = null;

// Singleton to reuse the feature extraction pipeline
async function getExtractor() {
    if (!extractorInstance) {
        extractorInstance = await pipeline(
            "feature-extraction",
            "Xenova/all-MiniLM-L6-v2"
        );
    }
    return extractorInstance;
}

/**
 * Generates a 384-dimensional vector embedding for a string of code or text.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    const extractor = await getExtractor();
    const output = await extractor(text, { pooling: "mean", normalize: true });
    return output.tolist()[0];
}

/**
 * Calculates Cosine Similarity between two normalized vector embeddings.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
    }
    return dotProduct;
}