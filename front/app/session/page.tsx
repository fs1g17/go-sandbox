"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import type { CodeEditorHandle } from "./_components/code-editor";
import Terminal, { TerminalLine } from "./_components/terminal";

const CodeEditor = dynamic(() => import("./_components/code-editor"), {
  ssr: false,
});

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export interface CodeExecutor {
  getCodeMap: () => { [key: string]: string };
}

export default function Home() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") ?? "";

  const editorRef = useRef<CodeEditorHandle>(null);
  const codeRef = useRef<CodeExecutor>(null);
  const [lines, setLines] = useState<TerminalLine[]>([
    { text: "Ready. Press Run to execute.", type: "info" },
  ]);
  const [running, setRunning] = useState(false);
  const [initialFiles, setInitialFiles] = useState<Record<
    string,
    string
  > | null>(null);
  const [sessionError, setSessionError] = useState<boolean>(false);

  useEffect(() => {
    if (!sessionId) return;
    fetch(`${API_BASE}/session-files?session_id=${sessionId}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then((data) => setInitialFiles(data.fileMap ?? {}))
      .catch(() => setSessionError(true));
  }, [sessionId]);

  function addLines(newLines: TerminalLine[]) {
    setLines((prev) => [...prev, ...newLines]);
  }

  async function handleRun() {
    setRunning(true);
    setLines((prev) => [...prev, { text: `$ run`, type: "info" }]);

    const codeMap = codeRef.current?.getCodeMap();

    try {
      await fetch(`${API_BASE}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: codeMap }),
      });
    } catch (err) {
      setLines((prev) => [
        ...prev,
        { text: `Failed to reach backend: ${err}`, type: "error" },
      ]);
    } finally {
      setRunning(false);
    }
  }

  if (sessionError) {
    return (
      <div className="h-full flex items-center justify-center bg-[#1e1e1e]">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center">
          <div className="w-10 h-10 rounded-full border border-red-800 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 3v5M8 11v1"
                stroke="#f87171"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-mono text-[#d4d4d4]">
              Session not found
            </p>
            <p className="text-xs font-mono text-[#555]">
              <span className="text-[#3a3a3a]">id: </span>
              <span className="text-[#6b6b6b]">{sessionId}</span>
            </p>
          </div>
          <a
            href="/"
            className="text-xs font-mono text-[#555] hover:text-[#f59e0b] transition-colors underline underline-offset-4"
          >
            ← back to sessions
          </a>
        </div>
      </div>
    );
  }

  if (initialFiles === null) {
    return (
      <div className="h-full flex items-center justify-center bg-[#1e1e1e]">
        <span className="text-xs font-mono text-[#555]">loading session…</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      <CodeEditor
        ref={editorRef}
        codeRef={codeRef}
        initialFiles={initialFiles}
      />
      <Terminal
        lines={lines}
        running={running}
        onRun={handleRun}
        addLines={addLines}
        onClear={() => setLines([])}
      />
    </div>
  );
}
