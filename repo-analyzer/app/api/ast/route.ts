import { NextRequest, NextResponse } from "next/server";
import { parse } from "@babel/parser";
import _traverse from "@babel/traverse";

// Robust interop for Babel traverse ESM/CJS export mismatch
const traverse = (_traverse as any).default || _traverse;

interface SourceFile {
    filePath: string;
    content: string;
}

interface ReactFlowNode {
    id: string;
    data: { label: string; filePath: string };
    position: { x: number; y: number };
    style?: Record<string, any>;
}

interface ReactFlowEdge {
    id: string;
    source: string;
    target: string;
    animated?: boolean;
    style?: Record<string, any>;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { files }: { files: SourceFile[] } = body;

        if (!files || !Array.isArray(files) || files.length === 0) {
            return NextResponse.json(
                { success: false, error: "No files provided for AST parsing.", nodes: [], edges: [] },
                { status: 400 }
            );
        }

        const nodes: ReactFlowNode[] = [];
        const edges: ReactFlowEdge[] = [];
        const fileToIdMap = new Map<string, string>();

        // 1. Map each relative file path to a unique Node ID
        files.forEach((file, index) => {
            const nodeId = (index + 1).toString();
            fileToIdMap.set(file.filePath, nodeId);

            const columns = 3;
            const col = index % columns;
            const row = Math.floor(index / columns);

            nodes.push({
                id: nodeId,
                data: {
                    label: file.filePath.split("/").pop() || file.filePath,
                    filePath: file.filePath,
                },
                position: { x: col * 260 + 50, y: row * 120 + 50 },
                style: {
                    background: "#0f172a",
                    color: "#e2e8f0",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    padding: "10px 16px",
                    fontSize: "12px",
                    fontWeight: "500",
                },
            });
        });

        // 2. Parse AST for each file and extract import dependencies
        files.forEach((file) => {
            const sourceNodeId = fileToIdMap.get(file.filePath);
            if (!sourceNodeId) return;

            try {
                const ast = parse(file.content, {
                    sourceType: "module",
                    plugins: [
                        "typescript",
                        "jsx",
                        "classProperties",
                        "decorators-legacy",
                        "dynamicImport",
                    ],
                });

                traverse(ast, {
                    ImportDeclaration(path: any) {
                        const importPath = path.node.source.value;
                        resolveDependencyEdge(file.filePath, importPath, sourceNodeId);
                    },
                    CallExpression(path: any) {
                        if (
                            path.node.callee.type === "Identifier" &&
                            path.node.callee.name === "require" &&
                            path.node.arguments.length > 0 &&
                            path.node.arguments[0].type === "StringLiteral"
                        ) {
                            const requirePath = path.node.arguments[0].value;
                            resolveDependencyEdge(file.filePath, requirePath, sourceNodeId);
                        }
                    },
                });
            } catch (err) {
                // Skip non-JS/TS files or syntax parser warnings silently
            }
        });

        // Helper: Match relative import paths to known files
        function resolveDependencyEdge(
            currentFilePath: string,
            importSpecifier: string,
            sourceId: string
        ) {
            if (!importSpecifier.startsWith(".")) return; // Ignore node_modules / absolute packages

            const lastSlashIdx = currentFilePath.lastIndexOf("/");
            const currentDir = lastSlashIdx !== -1 ? currentFilePath.substring(0, lastSlashIdx) : "";

            // Normalize target relative path resolution
            let rawTarget = currentDir
                ? `${currentDir}/${importSpecifier.replace(/^\.\//, "")}`
                : importSpecifier.replace(/^\.\//, "");

            rawTarget = rawTarget.replace(/\/+/g, "/");

            for (const [targetPath, targetId] of fileToIdMap.entries()) {
                if (sourceId === targetId) continue; // Prevent self-referencing edges

                const cleanTargetPath = targetPath.replace(/\.(ts|js|tsx|jsx)$/, "");
                const cleanRawTarget = rawTarget.replace(/\.(ts|js|tsx|jsx)$/, "");

                if (
                    cleanTargetPath === cleanRawTarget ||
                    cleanTargetPath.endsWith(`/${cleanRawTarget}`) ||
                    cleanRawTarget.endsWith(cleanTargetPath)
                ) {
                    const edgeId = `e${sourceId}-${targetId}`;

                    if (!edges.some((e) => e.id === edgeId)) {
                        edges.push({
                            id: edgeId,
                            source: sourceId,
                            target: targetId,
                            animated: true,
                            style: { stroke: "#38bdf8", strokeWidth: 1.5 },
                        });
                    }
                    break;
                }
            }
        }

        return NextResponse.json({
            success: true,
            nodesCount: nodes.length,
            edgesCount: edges.length,
            nodes,
            edges,
        });
    } catch (error: any) {
        console.error("AST Engine Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to process AST dependencies.", details: error.message },
            { status: 500 }
        );
    }
}