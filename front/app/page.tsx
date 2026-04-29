"use client";

import { useRef, useState } from "react";
import CodeEditor, { CodeEditorHandle } from "./_components/code-editor";
import Terminal, { TerminalLine } from "./_components/terminal";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

interface ExecuteResponse {
  stdout: string;
  stderr: string;
  exit_code: number;
  timed_out: boolean;
}

export default function Home() {
  const editorRef = useRef<CodeEditorHandle>(null);
  const [lines, setLines] = useState<TerminalLine[]>([
    { text: "Ready. Press Run to execute.", type: "info" },
  ]);
  const [running, setRunning] = useState(false);

  async function handleRun() {
    const code = editorRef.current?.getValue() ?? "";
    setRunning(true);
    setLines((prev) => [...prev, { text: `$ run`, type: "info" }]);

    try {
      const res = await fetch(`${API_BASE}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: { "main.go": code } }),
      });

      if (!res.ok) {
        const text = await res.text();
        setLines((prev) => [
          ...prev,
          { text: `Error ${res.status}: ${text}`, type: "error" },
        ]);
        return;
      }

      const data: ExecuteResponse = await res.json();

      if (data.timed_out) {
        setLines((prev) => [
          ...prev,
          { text: "Process timed out.", type: "error" },
        ]);
      }
      if (data.stdout) {
        data.stdout
          .split("\n")
          .forEach((line) =>
            setLines((prev) => [...prev, { text: line, type: "stdout" }]),
          );
      }
      if (data.stderr) {
        data.stderr
          .split("\n")
          .forEach((line) =>
            setLines((prev) => [...prev, { text: line, type: "stderr" }]),
          );
      }
      setLines((prev) => [
        ...prev,
        { text: `Process exited with code ${data.exit_code}.`, type: "info" },
      ]);
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
        onClear={() => setLines([])}
      />
    </div>
  );
}
