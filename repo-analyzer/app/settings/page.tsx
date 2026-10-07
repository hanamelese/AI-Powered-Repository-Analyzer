"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Key,
    Shield,
    FileCode,
    Database,
    Save,
    Check,
    Sparkles,
    Server,
} from "lucide-react";

export default function SettingsPage() {
    const router = useRouter();

    // Settings State
    const [selectedProvider, setSelectedProvider] = useState<"groq" | "gemini" | "ollama">("groq");
    const [apiKey, setApiKey] = useState("");
    const [ephemeralDefault, setEphemeralDefault] = useState(true);
    const [ignorePatterns, setIgnorePatterns] = useState(
        "node_modules/\n.git/\ndist/\n*.lock\n*.png\n*.jpg"
    );
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        // Persist settings locally or via session
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2500);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 flex flex-col">
            {/* Background Gradients */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
            </div>

            {/* Navigation Header */}
            <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push("/")}
                            className="p-1.5 text-slate-400 hover:text-slate-100 bg-slate-900 border border-slate-800 rounded-lg transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                            Settings & Preferences
                        </span>
                    </div>

                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-2 transition-all shadow-md shadow-cyan-500/20"
                    >
                        {isSaved ? (
                            <>
                                <Check className="w-3.5 h-3.5" /> Saved!
                            </>
                        ) : (
                            <>
                                <Save className="w-3.5 h-3.5" /> Save Changes
                            </>
                        )}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-4xl mx-auto px-6 py-10 w-full flex-1 space-y-8">
                {/* Section 1: AI Provider & API Keys */}
                <section className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl space-y-4">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm border-b border-slate-800 pb-3">
                        <Key className="w-4 h-4" />
                        <span>AI Provider Configuration</span>
                    </div>

                    <p className="text-xs text-slate-400">
                        Select your preferred inference engine. Use free tier keys from cloud providers or connect a zero-cost local instance.
                    </p>

                    <div className="grid md:grid-cols-3 gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setSelectedProvider("groq")}
                            className={`p-3.5 rounded-xl border text-left transition-all ${selectedProvider === "groq"
                                    ? "bg-slate-950 border-cyan-500/80 text-slate-100 shadow-md shadow-cyan-500/10"
                                    : "bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-200"
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-xs">Groq Cloud API</span>
                                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">Free & extremely fast Llama 3 models.</p>
                        </button>

                        <button
                            type="button"
                            onClick={() => setSelectedProvider("gemini")}
                            className={`p-3.5 rounded-xl border text-left transition-all ${selectedProvider === "gemini"
                                    ? "bg-slate-950 border-cyan-500/80 text-slate-100 shadow-md shadow-cyan-500/10"
                                    : "bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-200"
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-xs">Google Gemini</span>
                                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">1M token window for huge files.</p>
                        </button>

                        <button
                            type="button"
                            onClick={() => setSelectedProvider("ollama")}
                            className={`p-3.5 rounded-xl border text-left transition-all ${selectedProvider === "ollama"
                                    ? "bg-slate-950 border-cyan-500/80 text-slate-100 shadow-md shadow-cyan-500/10"
                                    : "bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-200"
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-xs">Local Ollama</span>
                                <Server className="w-3.5 h-3.5 text-purple-400" />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">Zero-cost local endpoint (localhost:11434).</p>
                        </button>
                    </div>

                    {selectedProvider !== "ollama" ? (
                        <div className="pt-2 space-y-1.5">
                            <label className="text-xs font-semibold text-slate-300">API Key</label>
                            <input
                                type="password"
                                placeholder={selectedProvider === "groq" ? "gsk_..." : "AIzaSy..."}
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                            />
                        </div>
                    ) : (
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-400 font-mono">
                            Host: http://localhost:11434 (Make sure Ollama is running on your machine)
                        </div>
                    )}
                </section>

                {/* Section 2: Ingestion & Ignore Rules */}
                <section className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl space-y-4">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm border-b border-slate-800 pb-3">
                        <FileCode className="w-4 h-4" />
                        <span>Repository Exclude Filters (.ignore Rules)</span>
                    </div>

                    <p className="text-xs text-slate-400">
                        Specify glob patterns to exclude non-code assets, lockfiles, or large directories from being sent to vector embeddings.
                    </p>

                    <textarea
                        rows={5}
                        value={ignorePatterns}
                        onChange={(e) => setIgnorePatterns(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                </section>

                {/* Section 3: Privacy & Data Retention */}
                <section className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl space-y-4">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm border-b border-slate-800 pb-3">
                        <Shield className="w-4 h-4" />
                        <span>Privacy & Storage Controls</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                        <div className="space-y-0.5">
                            <h4 className="text-xs font-bold text-slate-200">Default Ephemeral Mode</h4>
                            <p className="text-[11px] text-slate-400">Automatically delete vector embeddings when browser tab closes.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={ephemeralDefault}
                                onChange={(e) => setEphemeralDefault(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500 border border-slate-800"></div>
                        </label>
                    </div>
                </section>
            </main>
        </div>
    );
}