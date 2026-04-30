"use client";

import { useEffect, useRef, useState } from "react";

export interface TerminalLine {
  text: string;
  type: "stdout" | "stderr" | "info" | "error";
}

interface TerminalProps {
  lines: TerminalLine[];
  running: boolean;
  onRun: () => void;
  onClear: () => void;
  addLines: (lines: TerminalLine[]) => void;
}

type Status = "open" | "connecting" | "closed";

export default function Terminal({
  lines,
  running,
  onRun,
  onClear,
  addLines,
}: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const connection = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<Status>("closed");

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    if (connection.current) {
      console.log("connection already established");
      return;
    }

    console.log("running websocket initialisation");

    const socket = new WebSocket("ws://localhost:8000/terminal");
    setStatus("connecting");

    // Connection opened
    socket.addEventListener("open", () => {
      setStatus("open");
      console.log("Connection established!");
    });

    socket.addEventListener("message", (event) => {
      console.log("Message from server ", event.data);
      const message: string = event.data as string;
      const messages = message.split("\n");

      var i = 0;
      for (const message of messages) {
        console.log(i + ": " + message);
        i += 1;
      }

      const lines = messages.map(
        (message) =>
          ({
            text: message,
            type: message.includes("stderr") ? "error" : "info",
          }) as TerminalLine,
      );

      console.log("lines", lines);

      addLines(lines);
    });

    const closeEventListener = (event: CloseEvent) => {
      setStatus("closed");
      connection.current = null;
      console.log(`OnClose: ${event.code} ${event.reason}`);
    };

    socket.addEventListener("close", closeEventListener);

    connection.current = socket;

    return () => {
      console.log("running cleanup");
      if (connection.current) {
        console.log("running close");
        connection.current.removeEventListener("close", closeEventListener);
        connection.current.close();
        connection.current = null;
      }
    };
  }, []);

  return (
    <div
      className="flex flex-col border-t border-[#3c3c3c]"
      style={{ height: "220px" }}
    >
      <div className="flex items-center justify-between px-3 py-1 bg-[#252526] border-b border-[#3c3c3c]">
        <span className="text-xs text-[#858585] font-mono uppercase tracking-wider">
          Terminal
        </span>
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
