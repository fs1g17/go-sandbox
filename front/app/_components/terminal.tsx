"use client";

import { useEffect, useRef } from "react";

export interface TerminalLine {
  text: string;
  type: "stdout" | "stderr" | "info" | "error";
}

interface TerminalProps {
  lines: TerminalLine[];
  running: boolean;
  onRun: () => void;
  onClear: () => void;
}

export default function Terminal({ lines, running, onRun, onClear }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className="flex flex-col border-t border-[#3c3c3c]" style={{ height: "220px" }}>
      <div className="flex items-center justify-between px-3 py-1 bg-[#252526] border-b border-[#3c3c3c]">
        <span className="text-xs text-[#858585] font-mono uppercase tracking-wider">Terminal</span>
        <div className="flex gap-2">
          <button
            onClick={onClear}
            className="text-xs text-[#858585] hover:text-white px-2 py-0.5 rounded hover:bg-[#3c3c3c] transition-colors"
          >
            Clear
          </button>
          <button
            onClick={onRun}
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
  );
}
