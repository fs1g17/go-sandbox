"use client";

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
}

export default function FileSystem({
  files,
  activeFile,
  onFileSelect,
}: FileSystemProps) {
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

      <div className="flex items-center px-3 pt-3 pb-1">
        <span className="text-[10px] text-[#6b6b6b] font-mono uppercase tracking-widest font-semibold">
          Files
        </span>
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
