"use client";

import React, { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactFlow, {
    Node,
    Edge,
    Controls,
    Background,
    applyNodeChanges,
    applyEdgeChanges,
    NodeChange,
    EdgeChange,
    MiniMap,
    BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";

import {
    GitBranch,
    Bot,
    FileCode2,
    Zap,
    Send,
    Sparkles,
    ArrowLeft,
    Search,
    ExternalLink,
    Code2,
    Layers,
} from "lucide-react";

// Mock Nodes representing parsed AST files
const initialNodes: Node[] = [
    {
        id: "1",
        data: { label: "app.ts (Root Server)" },
        position: { x: 250, y: 0 },
        style: {
            background: "#0f172a",
            color: "#38bdf8",
            border: "1px solid #0284c7",
            borderRadius: "12px",
            padding: "10px 16px",
            fontSize: "12px",
            fontWeight: "bold",
        },
    },
    {
        id: "2",
        data: { label: "routes/auth.routes.ts" },
        position: { x: 100, y: 120 },
        style: {
            background: "#0f172a",
            color: "#e2e8f0",
            border: "1px solid #334155",
            borderRadius: "12px",
            padding: "10px 16px",
            fontSize: "12px",
        },
    },
    {
        id: "3",
        data: { label: "routes/user.routes.ts" },
        position: { x: 400, y: 120 },
        style: {
            background: "#0f172a",
            color: "#e2e8f0",
            border: "1px solid #334155",
            borderRadius: "12px",
            padding: "10px 16px",
            fontSize: "12px",
        },
    },
    {
        id: "4",
        data: { label: "controllers/AuthController.ts" },
        position: { x: 100, y: 240 },
        style: {
            background: "#0f172a",
            color: "#cbd5e1",
            border: "1px solid #334155",
            borderRadius: "12px",
            padding: "10px 16px",
            fontSize: "12px",
        },
    },
    {
        id: "5",
        data: { label: "services/AuthService.ts" },
        position: { x: 100, y: 360 },
        style: {
            background: "#0f172a",
            color: "#a855f7",
            border: "1px solid #7e22ce",
            borderRadius: "12px",
            padding: "10px 16px",
            fontSize: "12px",
            fontWeight: "bold",
        },
    },
    {
        id: "6",
        data: { label: "db/vectorClient.ts" },
        position: { x: 400, y: 240 },
        style: {
            background: "#0f172a",
            color: "#22c55e",
            border: "1px solid #15803d",
            borderRadius: "12px",
            padding: "10px 16px",
            fontSize: "12px",
        },
    },
];

// Mock Edges representing AST import dependencies
const initialEdges: Edge[] = [
    { id: "e1-2", source: "1", target: "2", animated: true, style: { stroke: "#38bdf8" } },
    { id: "e1-3", source: "1", target: "3", animated: true, style: { stroke: "#38bdf8" } },
    { id: "e2-4", source: "2", target: "4", style: { stroke: "#64748b" } },
    { id: "e4-5", source: "4", target: "5", style: { stroke: "#a855f7" } },
    { id: "e3-6", source: "3", target: "6", style: { stroke: "#22c55e" } },
];

export default function WorkspacePage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;

    // React Flow state
    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);
    const [selectedNode, setSelectedNode] = useState<Node | null>(nodes[0]);

    // Sidebar tab state
    const [activeTab, setActiveTab] = useState<"chat" | "inspector" | "api">("chat");

    // RAG Chat State
    const [messages, setMessages] = useState<
        Array<{ sender: "user" | "ai"; text: string; citation?: string }>
    >([
        {
            sender: "ai",
            text: `Hello! I've finished indexing **${projectId}**. You can ask me how authentication works, request route summaries, or explore file dependencies.`,
        },
    ]);
    const [chatInput, setChatInput] = useState("");

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );
    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    const handleNodeClick = (_: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
        setActiveTab("inspector");
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMsg = chatInput;
        setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
        setChatInput("");

        // Simulate RAG response
        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                {
                    sender: "ai",
                    text: `Authentication logic is implemented in **AuthService.ts**. It uses JWT verification and interacts with the PGVector database.`,
                    citation: "services/AuthService.ts (Line 14-42)",
                },
            ]);
        }, 1000);
    };

    return (
        <div className="h-screen w-screen bg-slate-950 text-slate-100 font-sans flex flex-col overflow-hidden">
            {/* Top Navigation Header */}
            <header className="h-14 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 flex items-center justify-between z-20 shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push("/")}
                        className="p-1.5 text-slate-400 hover:text-slate-100 bg-slate-900 border border-slate-800 rounded-lg transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                            <GitBranch className="w-4 h-4 text-cyan-400" />
                        </div>
                        <span className="font-bold text-sm text-slate-200">{projectId}</span>
                        <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                            AST Synced
                        </span>
                    </div>
                </div>

                {/* Global Search Bar */}
                <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-400 w-80">
                    <Search className="w-3.5 h-3.5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search files, routes, or functions..."
                        className="bg-transparent border-none focus:outline-none w-full text-slate-200 placeholder-slate-600"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">6 Files • 5 Edges</span>
                </div>
            </header>

            {/* Main Workspace Split Screen */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Left Side: React Flow Canvas */}
                <div className="flex-1 h-full bg-slate-950 relative">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onNodeClick={handleNodeClick}
                        fitView
                    >
                        <Background color="#334155" variant={BackgroundVariant.Dots} gap={20} size={1} />
                        <Controls className="!bg-slate-900 !border-slate-800 !text-slate-200 !rounded-xl overflow-hidden shadow-lg" />
                        <MiniMap
                            nodeColor="#1e293b"
                            maskColor="rgba(15, 23, 42, 0.7)"
                            className="!bg-slate-900 !border-slate-800 !rounded-xl"
                        />
                    </ReactFlow>
                </div>

                {/* Right Side: Tabbed AI Workspace Sidebar */}
                <div className="w-96 border-l border-slate-800 bg-slate-900/90 backdrop-blur-xl flex flex-col z-10 shrink-0">
                    {/* Sidebar Tab Selector */}
                    <div className="flex border-b border-slate-800 p-2 gap-1 bg-slate-950/60 text-xs font-medium">
                        <button
                            onClick={() => setActiveTab("chat")}
                            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${activeTab === "chat"
                                    ? "bg-slate-800 text-cyan-400 shadow-sm"
                                    : "text-slate-400 hover:text-slate-200"
                                }`}
                        >
                            <Bot className="w-3.5 h-3.5" />
                            RAG Chat
                        </button>
                        <button
                            onClick={() => setActiveTab("inspector")}
                            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${activeTab === "inspector"
                                    ? "bg-slate-800 text-cyan-400 shadow-sm"
                                    : "text-slate-400 hover:text-slate-200"
                                }`}
                        >
                            <FileCode2 className="w-3.5 h-3.5" />
                            Inspector
                        </button>
                        <button
                            onClick={() => setActiveTab("api")}
                            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${activeTab === "api"
                                    ? "bg-slate-800 text-cyan-400 shadow-sm"
                                    : "text-slate-400 hover:text-slate-200"
                                }`}
                        >
                            <Zap className="w-3.5 h-3.5" />
                            APIs
                        </button>
                    </div>

                    {/* TAB 1: RAG Chat Panel */}
                    {activeTab === "chat" && (
                        <div className="flex-1 flex flex-col justify-between p-4 overflow-hidden">
                            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                                {messages.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-3 rounded-xl text-xs leading-relaxed max-w-[90%] ${msg.sender === "user"
                                                ? "bg-cyan-600/20 border border-cyan-500/40 text-cyan-100 ml-auto"
                                                : "bg-slate-950 border border-slate-800 text-slate-300"
                                            }`}
                                    >
                                        <p>{msg.text}</p>
                                        {msg.citation && (
                                            <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center gap-1 text-[10px] text-cyan-400 font-mono">
                                                <ExternalLink className="w-3 h-3" />
                                                <span>{msg.citation}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={handleSendMessage} className="mt-3 flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Ask about this codebase..."
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                                />
                                <button
                                    type="submit"
                                    className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl shrink-0"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    )}

                    {/* TAB 2: File Code Inspector Panel */}
                    {activeTab === "inspector" && (
                        <div className="flex-1 p-4 overflow-y-auto space-y-4">
                            {selectedNode ? (
                                <>
                                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                                        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                                            <Code2 className="w-4 h-4" />
                                            <span>{selectedNode.data.label}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-1 font-mono">
                                            ID: {selectedNode.id} • Type: AST Node
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            Source Preview
                                        </h4>
                                        <pre className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
                                            {`import { Request, Response } from "express";\nimport { AuthService } from "../services/AuthService";\n\nexport class AuthController {\n  static async login(req: Request, res: Response) {\n    // Extracted AST Route Logic\n    const token = await AuthService.verify(req.body);\n    return res.json({ token });\n  }\n}`}
                                        </pre>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-12 text-slate-500 text-xs">
                                    Click any node on the graph to inspect its source code.
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 3: Auto-Detected API Playground Panel */}
                    {activeTab === "api" && (
                        <div className="flex-1 p-4 overflow-y-auto space-y-3">
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Detected REST Routes
                            </h4>

                            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="px-2 py-0.5 bg-green-950 border border-green-800 text-green-400 rounded text-[10px] font-bold">
                                        POST
                                    </span>
                                    <span className="font-mono text-slate-200">/api/v1/auth/login</span>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                    Authenticates user credentials and returns JWT bearer token.
                                </p>
                                <button className="w-full py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-cyan-400 text-xs font-semibold rounded-lg transition-all">
                                    Test Request in Playground
                                </button>
                            </div>

                            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="px-2 py-0.5 bg-blue-950 border border-blue-800 text-blue-400 rounded text-[10px] font-bold">
                                        GET
                                    </span>
                                    <span className="font-mono text-slate-200">/api/v1/users/me</span>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                    Fetches active authenticated profile metadata.
                                </p>
                                <button className="w-full py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-cyan-400 text-xs font-semibold rounded-lg transition-all">
                                    Test Request in Playground
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}