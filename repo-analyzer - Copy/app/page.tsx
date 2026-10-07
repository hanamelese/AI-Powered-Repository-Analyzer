"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  GitBranch,
  UploadCloud,
  ShieldCheck,
  Zap,
  Bot,
  Terminal,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  const [inputUrl, setInputUrl] = useState("");
  const [isEphemeral, setIsEphemeral] = useState(false);
  const [activeTab, setActiveTab] = useState<"github" | "zip">("github");

  const router = useRouter();

  // const handleAnalyze = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!inputUrl && activeTab === "github") return;
  //   alert(`Starting analysis for: ${inputUrl || "Uploaded ZIP"} (Ephemeral: ${isEphemeral})`);
  // };

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl && activeTab === "github") return;

    // Generate a random project ID for demo purposes
    const sampleProjectId = "demo-repo-" + Math.floor(Math.random() * 1000);
    router.push(`/projects/${sampleProjectId}/processing`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Ambient Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-slate-800/80 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
              <GitBranch className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              RepoLens AI
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
            <a href="#architecture" className="hover:text-cyan-400 transition-colors">Architecture</a>
            <a href="#docs" className="hover:text-cyan-400 transition-colors">Docs</a>
          </nav>

          <button className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white transition-all">
            Get Started
          </button>
          <button
            onClick={() => router.push("/settings")}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white transition-all"
          >
            Settings & API Keys
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-300 text-xs font-medium mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Repository Visualizer & RAG Engine</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight"
          >
            Visualize Any Codebase. <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
              Chat with Your Architecture.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-slate-400 text-base md:text-lg leading-relaxed"
          >
            Turn complex repositories into interactive AST node graphs, search codebases using context-aware RAG, and auto-generate live API playgrounds in seconds.
          </motion.p>

          {/* Ingestion Box */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl max-w-2xl mx-auto text-left"
          >
            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-slate-950/60 rounded-xl border border-slate-800/60 w-fit text-xs font-medium mb-3">
              <button
                type="button"
                onClick={() => setActiveTab("github")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${activeTab === "github"
                  ? "bg-slate-800 text-cyan-400 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
                  }`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                GitHub URL
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("zip")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${activeTab === "zip"
                  ? "bg-slate-800 text-cyan-400 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
                  }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                Upload .ZIP Archive
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleAnalyze} className="space-y-3">
              {activeTab === "github" ? (
                <div className="flex items-center gap-2 bg-slate-950 rounded-xl border border-slate-800 px-3 py-2 focus-within:border-cyan-500/80 transition-all">
                  <Terminal className="w-5 h-5 text-slate-500 shrink-0" />
                  <input
                    type="url"
                    placeholder="https://github.com/username/repository"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    className="w-full bg-transparent border-none text-sm text-slate-100 placeholder-slate-600 focus:outline-none"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs rounded-lg flex items-center gap-2 shrink-0 transition-all shadow-md shadow-cyan-500/20"
                  >
                    Analyze <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-xl p-8 text-center bg-slate-950/40 transition-all cursor-pointer">
                  <UploadCloud className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-300 font-medium">Click to browse or drag & drop a .ZIP file here</p>
                  <p className="text-[10px] text-slate-500 mt-1">Maximum file size: 100MB</p>
                </div>
              )}

              {/* Ephemeral Mode Toggle */}
              <div className="flex items-center justify-between px-2 pt-2 border-t border-slate-800/60">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isEphemeral}
                    onChange={(e) => setIsEphemeral(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs text-slate-400 group-hover:text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    Ephemeral Mode (Purge vector database after session)
                  </span>
                </label>
                <span className="text-[10px] text-slate-500">Free Tier Ready</span>
              </div>
            </form>
          </motion.div>

          {/* Sample Repos */}
          <div className="mt-6 flex items-center justify-center gap-3 text-xs text-slate-500">
            <span>Or try a sample project:</span>
            <button
              onClick={() => setInputUrl("https://github.com/expressjs/express")}
              className="text-cyan-400 hover:underline font-mono"
            >
              expressjs/express
            </button>
            <span>•</span>
            <button
              onClick={() => setInputUrl("https://github.com/fastapi/fastapi")}
              className="text-cyan-400 hover:underline font-mono"
            >
              fastapi/fastapi
            </button>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div id="features" className="mt-28 grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800/50 flex items-center justify-center text-cyan-400 mb-4">
              <GitBranch className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">AST Visual Dependency Maps</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Extract file dependencies into zoomable React Flow node graphs. Spot tight couplings and architecture bottlenecks instantly.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800/50 flex items-center justify-center text-blue-400 mb-4">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Context-Aware RAG Engine</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Ask natural language questions across codebases. Get grounded answers backed by local PGVector similarity search and inline code links.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-800/50 flex items-center justify-center text-indigo-400 mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Auto-Detected API Playground</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Automatically parse REST routes, express decorators, or OpenAPI specs into an in-browser request builder for live endpoint testing.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}