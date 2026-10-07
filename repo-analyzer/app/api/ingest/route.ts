import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import AdmZip from "adm-zip";
import ignore from "ignore";

// Default patterns to exclude from code processing
const DEFAULT_IGNORE_PATTERNS = [
    "node_modules",
    ".git",
    ".next",
    "dist",
    "build",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "*.png",
    "*.jpg",
    "*.jpeg",
    "*.svg",
    "*.ico",
    "*.pdf",
    "*.zip",
    "*.woff",
    "*.woff2",
    "*.ttf",
    "*.eot",
];

// Helper to determine if a buffer contains valid UTF-8 text
function isTextFile(buffer: Buffer): boolean {
    for (let i = 0; i < Math.min(buffer.length, 512); i++) {
        if (buffer[i] === 0) return false; // Null byte indicates binary content
    }
    return true;
}

export async function POST(req: NextRequest) {
    let tempDir: string | null = null;

    try {
        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json(
                { success: false, error: "Invalid or empty JSON payload provided." },
                { status: 400 }
            );
        }

        const { repoUrl, customIgnore } = body || {};

        if (!repoUrl) {
            return NextResponse.json(
                { success: false, error: "A valid GitHub repository URL is required." },
                { status: 400 }
            );
        }

        // Extract owner and repo name cleanly from input URL (stripping trailing .git and slashes)
        const cleanRepo = repoUrl
            .trim()
            .replace(/\/$/, "")
            .replace(/\.git$/, "")
            .replace(/^https?:\/\/github\.com\//, "");

        const [owner, repo] = cleanRepo.split("/");
        if (!owner || !repo) {
            return NextResponse.json(
                { success: false, error: "Invalid GitHub repository format. Use 'owner/repo'." },
                { status: 400 }
            );
        }

        // Optional GitHub authorization headers if token is configured in env
        const githubToken = process.env.GITHUB_TOKEN;
        const headers: Record<string, string> = {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "RepoLens-AI-App",
        };
        if (githubToken) {
            headers["Authorization"] = `Bearer ${githubToken}`;
        }

        // 1. Fetch repository metadata to obtain exact default branch name
        let defaultBranch = "main";
        const metaRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });

        if (metaRes.ok) {
            const metaData = await metaRes.json();
            defaultBranch = metaData.default_branch || "main";
        }

        // 2. Fetch repository archive ZIP using dynamic branch ref
        let archiveRes = await fetch(
            `https://github.com/${owner}/${repo}/archive/refs/heads/${defaultBranch}.zip`,
            { headers }
        );

        if (!archiveRes.ok && defaultBranch !== "main") {
            archiveRes = await fetch(`https://github.com/${owner}/${repo}/archive/refs/heads/main.zip`, { headers });
        }
        if (!archiveRes.ok) {
            archiveRes = await fetch(`https://github.com/${owner}/${repo}/archive/refs/heads/master.zip`, { headers });
        }

        if (!archiveRes.ok) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Failed to download archive for repository '${owner}/${repo}'. Ensure the repository is public.`,
                },
                { status: 404 }
            );
        }

        // 3. Buffer and extract ZIP archive into isolated OS temp folder
        const arrayBuffer = await archiveRes.arrayBuffer();
        const zipBuffer = Buffer.from(arrayBuffer);

        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "repo-lens-"));
        const zip = new AdmZip(zipBuffer);
        zip.extractAllTo(tempDir, true);

        const extractedFolders = fs.readdirSync(tempDir);
        const repoRootDir = path.join(tempDir, extractedFolders[0] || "");

        if (!fs.existsSync(repoRootDir)) {
            return NextResponse.json(
                { success: false, error: "Extracted repository tree is empty." },
                { status: 500 }
            );
        }

        // 4. Configure .ignore filter rules
        const ig = ignore();
        ig.add(DEFAULT_IGNORE_PATTERNS);

        if (customIgnore && typeof customIgnore === "string") {
            const userRules = customIgnore
                .split("\n")
                .map((rule) => rule.trim())
                .filter((rule) => rule.length > 0);
            ig.add(userRules);
        }

        // 5. Recursively extract clean text/source code files
        const processedFiles: Array<{ filePath: string; content: string }> = [];

        function walkDirectory(currentPath: string, relativePath: string = "") {
            const items = fs.readdirSync(currentPath);

            for (const item of items) {
                const fullPath = path.join(currentPath, item);
                const relPath = path.join(relativePath, item);

                // Evaluate against ignore filters
                if (ig.ignores(relPath) || ig.ignores(relPath + "/")) {
                    continue;
                }

                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    walkDirectory(fullPath, relPath);
                } else if (stat.isFile()) {
                    // Limit individual file size to 1MB
                    if (stat.size <= 1024 * 1024) {
                        const fileBuffer = fs.readFileSync(fullPath);
                        if (isTextFile(fileBuffer)) {
                            processedFiles.push({
                                filePath: relPath.replace(/\\/g, "/"), // Normalize Windows paths
                                content: fileBuffer.toString("utf-8"),
                            });
                        }
                    }
                }
            }
        }

        walkDirectory(repoRootDir);

        // 6. Return standard structured response payload
        return NextResponse.json({
            success: true,
            message: "Repository successfully ingested and filtered.",
            totalFilesCount: processedFiles.length,
            files: processedFiles,
        });
    } catch (error: any) {
        console.error("Ingestion API Error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "An error occurred during repository ingestion.",
                details: error.message,
            },
            { status: 500 }
        );
    } finally {
        // Guarantees temp folder cleanup even if extraction throws an error
        if (tempDir && fs.existsSync(tempDir)) {
            try {
                fs.rmSync(tempDir, { recursive: true, force: true });
            } catch (cleanupErr) {
                console.error("Temp directory cleanup error:", cleanupErr);
            }
        }
    }
}

export async function OPTIONS() {
    return NextResponse.json({}, { status: 200 });
}