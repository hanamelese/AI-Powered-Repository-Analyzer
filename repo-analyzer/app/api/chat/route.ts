

import { NextRequest, NextResponse } from "next/server";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { generateEmbedding, cosineSimilarity } from "@/lib/embedder";

export async function POST(req: NextRequest) {
    try {
        if (!process.env.GROQ_API_KEY) {
            return NextResponse.json(
                { error: "GROQ_API_KEY environment variable is missing." },
                { status: 500 }
            );
        }

        const body = await req.json();
        const { message, codeChunks } = body;

        if (!message) {
            return NextResponse.json({ error: "Message query is required." }, { status: 400 });
        }

        let relevantContext = "";
        let citations: string[] = [];

        if (codeChunks && Array.isArray(codeChunks) && codeChunks.length > 0) {
            try {
                const hasEmbeddings = codeChunks.some((c) => Array.isArray(c.embedding));

                if (hasEmbeddings) {
                    const queryEmbedding = await generateEmbedding(message);
                    const ranked = codeChunks
                        .filter((chunk) => Array.isArray(chunk.embedding))
                        .map((chunk) => ({
                            ...chunk,
                            score: cosineSimilarity(queryEmbedding, chunk.embedding),
                        }))
                        .sort((a, b) => b.score - a.score)
                        .slice(0, 4);

                    relevantContext = ranked
                        .map((c) => `--- FILE: ${c.filePath} ---\n${c.codeSnippet}`)
                        .join("\n\n");
                    citations = ranked.map((c) => c.filePath);
                } else {
                    const selected = codeChunks.slice(0, 4);
                    relevantContext = selected
                        .map((c: any) => `--- FILE: ${c.filePath} ---\n${c.codeSnippet}`)
                        .join("\n\n");
                    citations = selected.map((c: any) => c.filePath);
                }
            } catch (embedErr) {
                console.warn("Embedding generation skipped, falling back to raw slices:", embedErr);
                const selected = codeChunks.slice(0, 3);
                relevantContext = selected
                    .map((c: any) => `--- FILE: ${c.filePath} ---\n${c.codeSnippet}`)
                    .join("\n\n");
                citations = selected.map((c: any) => c.filePath);
            }
        }

        const systemPrompt = `You are RepoLens AI, an expert software architecture assistant.
Ground your technical answers using ONLY the relevant source code context provided below. Be concise, point out specific file paths, and explain function linkages clearly.

RELEVANT CODE CONTEXT:
${relevantContext || "No code context provided."}`;

        // Generate full response text at once instead of streaming
        const result = await generateText({
            model: groq("llama-3.1-8b-instant"), // <-- Change model string here
            system: systemPrompt,
            prompt: message,
        });

        return NextResponse.json({
            reply: result.text,
            citations: citations,
        }, { status: 200 });

    } catch (error: any) {
        console.error("Chat API Error:", error);
        return NextResponse.json(
            { error: "Failed to generate AI response.", details: error?.message || error },
            { status: 500 }
        );
    }
}