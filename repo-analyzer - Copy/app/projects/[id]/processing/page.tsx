"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
    GitBranch,
    CheckCircle2,
    Loader2,
    Terminal,
    FileCode2,
    Database,
    Cpu,
    ArrowRight,
} from "lucide-react";

interface ProcessingStep {
    id: number;
    label: string;
    subtext: string;
    icon: React.ElementType;
}

const STEPS: ProcessingStep[] = [
    {
        id: 1,
        label: "Fetching Repository Source",
        subtext: "Downloading repository archive and validating structure...",
        icon: GitBranch,
    },
    {
        id: 2,
        label: "Filtering & Cleaning Files",
        subtext: "Applying .ignore rules, removing lockfiles & binary assets...",
        icon: FileCode2,
    },
    {
        id: 3,
        label: "Extracting AST Dependency Graph",
        subtext: "Parsing imports, exports, and module linkages via AST...",
        icon: Cpu,
    },
    {
        id: 4,
        label: "Generating Vector Embeddings",
        subtext: "Chunking code and indexing vectors in PGVector for RAG search...",
        icon: Database,
    },
];

export default function ProcessingPage() {
    const router = useRouter();
    const params = useParams();
    const projectId = params.id as string;

    const [currentStep, setCurrentStep] = useState(1);
    const [progress, setProgress] = useState(10);
    const [logs, setLogs] = useState<string[]>([
        "Initializing ingestion engine...",
        `Connected to target project session: ${projectId}`,
    ]);

    // Simulate progress and backend stage transitions
    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer);
                    return 100;
                }
                const nextProgress = prev + 5;

                // Stage transitions based on progress percentages
                if (nextProgress === 30) {
                    setCurrentStep(2);
                    setLogs((l) => [
                        ...l,
                        "Repository cloned successfully.",
                        "Filtering node_modules, .git, and binary assets...",
                    ]);
                } else if (nextProgress === 60) {
                    setCurrentStep(3);
                    setLogs((l) => [
                        ...l,
                        "Target source files isolated.",
                        "Running AST compiler parser across 48 module files...",
                    ]);
                } else if (nextProgress === 85) {
                    setCurrentStep(4);
                    setLogs((l) => [
                        ...l,
                        "Dependency graph constructed (48 nodes, 72 edges).",
                        "Generating 1536-dim embeddings for vector index...",
                    ]);
                } else if (nextProgress === 100) {
                    setLogs((l) => [
                        ...l,
                        "Vector embeddings successfully stored in PGVector.",
                        "Redirecting to interactive canvas workspace...",
                    ]);
                }

                return nextProgress;
            });
        }, 400);

        return () => clearInterval(timer);
    }, []);

    // Redirect to Main Dashboard when progress hits 100%
    useEffect(() => {
        if (progress === 100) {
            const redirectTimer = setTimeout(() => {
                router.push(`/projects/${projectId}`);
            }, 1200);
            return () => clearTimeout(redirectTimer);
        }
    }, [progress, projectId, router]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 flex flex-col justify-between">
            {/* Background Gradients */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
                            <GitBranch className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                        </div>
                        <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                            RepoLens AI
                        </span>
                    </div>
                    <span className="text-xs font-mono text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1 rounded-md">
                        ID: {projectId}
                    </span>
                </div>
            </header>

            {/* Main Processing Body */}
            <main className="relative z-10 max-w-3xl mx-auto px-6 py-12 w-full my-auto">
                <div className="text-center mb-10">
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                        Analyzing Repository Architecture
                    </h1>
                    <p className="text-xs md:text-sm text-slate-400 mt-2">
                        Please wait while our engine parses AST dependencies and indexes vector embeddings.
                    </p>
                </div>

                {/* Progress Bar Header */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-2xl space-y-6">
                    <div>
                        <div className="flex justify-between items-center text-xs font-semibold mb-2">
                            <span className="text-cyan-400 flex items-center gap-2">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                {progress < 100 ? "Processing Codebase..." : "Analysis Complete!"}
                            </span>
                            <span className="text-slate-400 font-mono">{progress}%</span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-2.5 border border-slate-800 overflow-hidden">
                            <motion.div
                                className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 h-2.5 rounded-full"
                                animate={{ width: `${progress}%` }}
                                transition={{ ease: "easeOut", duration: 0.3 }}
                            />
                        </div>
                    </div>

                    {/* Stepper Steps */}
                    <div className="space-y-4 pt-2">
                        {STEPS.map((step) => {
                            const Icon = step.icon;
                            const isDone = currentStep > step.id || progress === 100;
                            const isCurrent = currentStep === step.id && progress < 100;

                            return (
                                <div
                                    key={step.id}
                                    className={`flex items-start gap-4 p-3.5 rounded-xl border transition-all ${isCurrent
                                            ? "bg-slate-950 border-cyan-500/50 shadow-md shadow-cyan-500/5"
                                            : isDone
                                                ? "bg-slate-950/40 border-slate-800/80"
                                                : "bg-slate-950/20 border-slate-900 opacity-40"
                                        }`}
                                >
                                    <div
                                        className={`p-2 rounded-lg shrink-0 ${isDone
                                                ? "bg-cyan-950 text-cyan-400 border border-cyan-800/50"
                                                : isCurrent
                                                    ? "bg-blue-950 text-blue-400 border border-blue-800/50"
                                                    : "bg-slate-900 text-slate-600"
                                            }`}
                                    >
                                        {isDone ? (
                                            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                                        ) : isCurrent ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                                        ) : (
                                            <Icon className="w-4 h-4" />
                                        )}
                                    </div>

                                    <div className="text-left flex-1">
                                        <h3
                                            className={`text-xs font-bold ${isDone || isCurrent ? "text-slate-200" : "text-slate-500"
                                                }`}
                                        >
                                            {step.label}
                                        </h3>
                                        <p className="text-[11px] text-slate-400 mt-0.5">{step.subtext}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Live Terminal Log Viewer */}
                <div className="mt-6 bg-slate-950 border border-slate-800/90 rounded-xl p-4 font-mono text-[11px] text-slate-400 shadow-inner">
                    <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-800/60 text-slate-500 text-[10px]">
                        <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                        <span>INGESTION_LOGS_STREAM</span>
                    </div>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                        {logs.map((log, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <span className="text-cyan-500/60">&gt;</span>
                                <span className="text-slate-300">{log}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-900 py-4 text-center text-[11px] text-slate-600">
                RepoLens Engine • Automated Code Ingestion Pipeline
            </footer>
        </div>
    );
}