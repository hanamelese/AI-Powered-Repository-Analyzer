
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";

function ProcessingContent() {
    const params = useParams();
    const router = useRouter();

    const rawProjectId = (params?.id as string) || "";
    const projectId = decodeURIComponent(rawProjectId);

    const [statusText, setStatusText] = useState("Initializing ingestion pipeline...");
    const [progress, setProgress] = useState(10);
    const [errorDetails, setErrorDetails] = useState<string | null>(null);

    useEffect(() => {
        let isCancelled = false;

        async function runPipeline() {
            if (!projectId) return;

            try {
                setErrorDetails(null);

                // Step 1: Ingest Repository Files
                setStatusText(`Downloading repository content for ${projectId}...`);
                setProgress(30);

                const targetUrl = projectId.startsWith("http")
                    ? projectId
                    : `https://github.com/${projectId}`;

                const ingestRes = await fetch("/api/ingest", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ repoUrl: targetUrl }),
                });

                if (!ingestRes.ok) {
                    const errData = await ingestRes.json().catch(() => ({}));
                    throw new Error(
                        errData.error || `Ingestion API returned status ${ingestRes.status}`
                    );
                }

                const ingestData = await ingestRes.json();
                if (!ingestData.success || !ingestData.files) {
                    throw new Error(ingestData.error || "Failed to parse repository file tree.");
                }

                if (isCancelled) return;

                // Step 2: Build AST Dependency Graph
                setStatusText("Generating AST nodes and mapping module imports...");
                setProgress(65);

                const astRes = await fetch("/api/ast", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ files: ingestData.files }),
                });

                if (!astRes.ok) {
                    const errData = await astRes.json().catch(() => ({}));
                    throw new Error(
                        errData.error || `AST API returned status ${astRes.status}`
                    );
                }

                const astData = await astRes.json();
                if (isCancelled) return;

                // Step 3: Cache processed session data for WorkspacePage
                const sessionPayload = {
                    files: ingestData.files,
                    nodes: astData.nodes || [],
                    edges: astData.edges || [],
                    timestamp: Date.now(),
                };

                sessionStorage.setItem(
                    `repo_lens_${projectId}`,
                    JSON.stringify(sessionPayload)
                );

                setProgress(100);
                setStatusText("Complete! Redirecting to visual workspace...");

                setTimeout(() => {
                    if (!isCancelled) {
                        router.push(`/projects/${encodeURIComponent(projectId)}`);
                    }
                }, 800);
            } catch (err: any) {
                if (!isCancelled) {
                    console.error("Pipeline failure:", err);
                    setErrorDetails(
                        err?.message || "An unexpected error occurred during repository ingestion."
                    );
                }
            }
        }

        runPipeline();

        return () => {
            isCancelled = true;
        };
    }, [projectId, router]);

    return (
        <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl relative z-10 text-center space-y-6">
            {!errorDetails ? (
                <>
                    <div className="flex items-center justify-center">
                        <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl">
                            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-bold text-base text-slate-100 truncate">
                            Indexing {projectId}
                        </h3>
                        <p className="text-xs text-slate-400 min-h-[32px] flex items-center justify-center">
                            {statusText}
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-950 border border-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </>
            ) : (
                <>
                    <div className="flex items-center justify-center">
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                            <AlertCircle className="w-8 h-8 text-red-400" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-bold text-base text-slate-100">
                            Pipeline Failed
                        </h3>
                        <p className="text-xs text-red-400 font-mono bg-slate-950 p-3 rounded-xl border border-slate-800 text-left break-words max-h-32 overflow-y-auto">
                            {errorDetails}
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => router.push("/")}
                            className="flex-1 py-2 px-3 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> Back Home
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="flex-1 py-2 px-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-500/20"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Retry Pipeline
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default function ProcessingPage() {
    return (
        <div className="h-screen w-screen bg-slate-950 text-slate-100 font-sans flex flex-col items-center justify-center p-6 relative">
            <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <Suspense
                fallback={
                    <div className="text-slate-400 text-xs flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                        Loading processing pipeline...
                    </div>
                }
            >
                <ProcessingContent />
            </Suspense>
        </div>
    );
}