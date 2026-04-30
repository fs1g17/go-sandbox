"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const EXT_COLORS: Record<string, string> = {
  go: "#00acd7",
  ts: "#3178c6",
  tsx: "#61dafb",
  js: "#f7df1e",
  jsx: "#61dafb",
  json: "#cbcb41",
  md: "#519aba",
  css: "#563d7c",
  html: "#e34c26",
  sh: "#89e051",
  yaml: "#cc3e44",
  yml: "#cc3e44",
  mod: "#00acd7",
  sum: "#00acd7",
};

function FileIcon({ ext }: { ext: string }) {
  const color = EXT_COLORS[ext] ?? "#858585";
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className="shrink-0"
      aria-hidden
    >
      <path
        d="M2.5 1.5H8.5L11.5 4.5V12.5H2.5V1.5Z"
        stroke={color}
        strokeWidth="1"
        fill="none"
      />
      <path d="M8.5 1.5V4.5H11.5" stroke={color} strokeWidth="1" fill="none" />
      <path
        d="M4.5 6.5H9.5M4.5 8.5H9.5M4.5 10.5H7.5"
        stroke={color}
        strokeWidth="0.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface FileSystemProps {
  files: string[];
  activeFile?: string;
  onFileSelect?: (file: string) => void;
  onAddFile?: (file: string) => void;
}

export default function FileSystem({
  files,
  activeFile,
  onFileSelect,
  onAddFile,
}: FileSystemProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  function handleCreate() {
    const name = input.trim();
    if (!name) return;
    onAddFile?.(name);
    setInput("");
    setOpen(false);
  }

  return (
    <div
      className="flex flex-col border-r border-[#3c3c3c] select-none"
      style={{ width: "200px", minWidth: "160px", background: "#1e1e1e" }}
    >
      <div className="flex items-center px-3 py-2 border-b border-[#3c3c3c] bg-[#252526]">
        <span className="text-xs text-[#bbb] font-mono uppercase tracking-widest">
          Explorer
        </span>
      </div>

      <div className="flex items-center justify-between px-3 pt-3 pb-1">
        <span className="text-[10px] text-[#6b6b6b] font-mono uppercase tracking-widest font-semibold">
          Files
        </span>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              className="flex items-center justify-center w-4 h-4 rounded text-[#6b6b6b] hover:text-[#cccccc] hover:bg-[#2a2d2e] transition-colors"
              aria-label="New file"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xs">
            <DialogHeader>
              <DialogTitle>New File</DialogTitle>
            </DialogHeader>
            <input
              autoFocus
              type="text"
              placeholder="filename.go"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm font-mono outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <DialogFooter>
              <Button
                onClick={handleCreate}
                disabled={!input.trim()}
                size="sm"
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <ul className="flex-1 overflow-y-auto py-1">
        {files.map((filename) => {
          const ext = filename.split(".").pop() ?? "";
          const isActive = filename === activeFile;
          return (
            <li key={filename}>
              <button
                onClick={() => onFileSelect?.(filename)}
                className={[
                  "w-full flex items-center gap-2 px-3 py-[5px] text-left group transition-colors duration-75",
                  isActive
                    ? "bg-[#37373d] text-[#d4d4d4]"
                    : "text-[#858585] hover:bg-[#2a2d2e] hover:text-[#cccccc]",
                ].join(" ")}
              >
                <FileIcon ext={ext} />
                <span className="text-xs font-mono truncate">{filename}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
