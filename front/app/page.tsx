"use client";

import { useEffect, useRef, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

interface ExecuteResponse {
  stdout: string;
  stderr: string;
  exit_code: number;
  timed_out: boolean;
}

interface TerminalLine {
  text: string;
  type: "stdout" | "stderr" | "info" | "error";
}

export default function Home() {
  const editorRef = useRef<import("monaco-editor").editor.IStandaloneCodeEditor | null>(null);
  const [lines, setLines] = useState<TerminalLine[]>([{ text: "Ready. Press Run to execute.", type: "info" }]);
  const [running, setRunning] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const monacoEditorDiv = document.getElementById("monaco-editor");
    if (!monacoEditorDiv) return;

    (async () => {
      const Y = await import("yjs");
      const { WebrtcProvider } = await import("y-webrtc");
      const { MonacoBinding } = await import("y-monaco");
      const { editor } = await import("monaco-editor");

      const ydoc = new Y.Doc();
      const provider = new WebrtcProvider("monaco", ydoc);
      const type = ydoc.getText("monaco");

      editorRef.current = editor.create(monacoEditorDiv, {
        value: "",
        language: "go",
        theme: "vs-dark",
      });

      const model = editorRef.current.getModel();
      if (!model) return;

      new MonacoBinding(type, model, new Set([editorRef.current]), provider.awareness);
    })();

    return () => {
      editorRef.current?.dispose();
    };
  }, []);

  // Scroll terminal to bottom on new output
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  async function handleRun() {
    const code = editorRef.current?.getValue() ?? "";
    setRunning(true);
    setLines((prev) => [
      ...prev,
      { text: `$ run`, type: "info" },
    ]);

    try {
      const res = await fetch(`${API_BASE}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language: "golang" }),
      });

      if (!res.ok) {
        const text = await res.text();
        setLines((prev) => [...prev, { text: `Error ${res.status}: ${text}`, type: "error" }]);
        return;
      }

      const data: ExecuteResponse = await res.json();

      if (data.timed_out) {
        setLines((prev) => [...prev, { text: "Process timed out.", type: "error" }]);
      }
      if (data.stdout) {
        data.stdout.split("\n").forEach((line) =>
          setLines((prev) => [...prev, { text: line, type: "stdout" }])
        );
      }
      if (data.stderr) {
        data.stderr.split("\n").forEach((line) =>
          setLines((prev) => [...prev, { text: line, type: "stderr" }])
        );
      }
      setLines((prev) => [
        ...prev,
        { text: `Process exited with code ${data.exit_code}.`, type: "info" },
      ]);
    } catch (err) {
      setLines((prev) => [...prev, { text: `Failed to reach backend: ${err}`, type: "error" }]);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Editor */}
      <div id="monaco-editor" className="flex-1 min-h-0" />

      {/* Terminal panel */}
      <div className="flex flex-col border-t border-[#3c3c3c]" style={{ height: "220px" }}>
        {/* Terminal toolbar */}
        <div className="flex items-center justify-between px-3 py-1 bg-[#252526] border-b border-[#3c3c3c]">
          <span className="text-xs text-[#858585] font-mono uppercase tracking-wider">Terminal</span>
          <div className="flex gap-2">
            <button
              onClick={() => setLines([])}
              className="text-xs text-[#858585] hover:text-white px-2 py-0.5 rounded hover:bg-[#3c3c3c] transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleRun}
              disabled={running}
              className="flex items-center gap-1.5 text-xs bg-[#0e7a0d] hover:bg-[#1a9e19] disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1 rounded transition-colors font-medium"
            >
              {running ? (
                <>
                  <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  Running…
                </>
              ) : (
                <>
                  <span>▶</span>
                  Run
                </>
              )}
            </button>
          </div>
        </div>

        {/* Terminal output */}
        <div
          ref={terminalRef}
          className="flex-1 overflow-y-auto px-3 py-2 font-mono text-xs leading-5"
          style={{ background: "#0d0d0d" }}
        >
          {lines.map((line, i) => (
            <div
              key={i}
              className={
                line.type === "stderr"
                  ? "text-red-400"
                  : line.type === "error"
                  ? "text-red-500"
                  : line.type === "info"
                  ? "text-[#858585]"
                  : "text-[#d4d4d4]"
              }
            >
              {line.text || "\u00a0"}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
