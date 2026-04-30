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
  onDeleteFile?: (file: string) => void;
}

export default function FileSystem({
  files,
  activeFile,
  onFileSelect,
  onAddFile,
  onDeleteFile,
}: FileSystemProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

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
              <div
                className={[
                  "w-full flex items-center gap-2 px-3 py-[5px] group transition-colors duration-75",
                  isActive
                    ? "bg-[#37373d] text-[#d4d4d4]"
                    : "text-[#858585] hover:bg-[#2a2d2e] hover:text-[#cccccc]",
                ].join(" ")}
              >
                <button
                  onClick={() => onFileSelect?.(filename)}
                  className="flex items-center gap-2 flex-1 min-w-0 text-left"
                >
                  <FileIcon ext={ext} />
                  <span className="text-xs font-mono truncate">{filename}</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(filename); }}
                  className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-4 h-4 rounded text-[#6b6b6b] hover:text-red-400 hover:bg-[#3a2020] transition-all duration-75 shrink-0"
                  aria-label={`Delete ${filename}`}
                >
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                    <path d="M1.5 1.5l6 6M7.5 1.5l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <Dialog open={deleteTarget !== null} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Delete file</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-mono text-foreground">{deleteTarget}</span>?
            This cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (deleteTarget) onDeleteFile?.(deleteTarget);
                setDeleteTarget(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
