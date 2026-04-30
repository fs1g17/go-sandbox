"use client";

import { useRef, useState } from "react";
import CodeEditor, { CodeEditorHandle } from "./_components/code-editor";
import FileSystem from "./_components/file-system";
import Terminal, { TerminalLine } from "./_components/terminal";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export default function Home() {
  const editorRef = useRef<CodeEditorHandle>(null);
  const [lines, setLines] = useState<TerminalLine[]>([
    { text: "Ready. Press Run to execute.", type: "info" },
  ]);
  const [running, setRunning] = useState(false);

  function addLines(lines: TerminalLine[]) {
    setLines((prev) => [...prev, ...lines]);
  }

  async function handleRun() {
    const code = editorRef.current?.getValue() ?? "";
    setRunning(true);
    setLines((prev) => [...prev, { text: `$ run`, type: "info" }]);

    try {
      await fetch(`${API_BASE}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: { "main.go": code } }),
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

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      <CodeEditor ref={editorRef} />
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
