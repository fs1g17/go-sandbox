"use client";

import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { CodeEditorHandle } from "./_components/code-editor";
import Terminal, { TerminalLine } from "./_components/terminal";
import { executeCode, getSessionFiles } from "@/api/sessions";

const CodeEditor = dynamic(() => import("./_components/code-editor"), {
  ssr: false,
});

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

  function addLines(newLines: TerminalLine[]) {
    setLines((prev) => [...prev, ...newLines]);
  }

  const { mutate: run, isPending: running } = useMutation({
    mutationFn: (codeMap: Record<string, string>) =>
      executeCode(codeMap, sessionId),
    onError: (err) => {
      setLines((prev) => [
        ...prev,
        { text: `Failed to reach backend: ${err}`, type: "error" },
      ]);
    },
  });

  const { isLoading: sessionFilesLoading, isError: isSessionError } = useQuery({
    queryKey: ["session-files", { sessionId }],
    queryFn: () => getSessionFiles(sessionId),
  });

  async function handleRun() {
    setLines((prev) => [...prev, { text: `$ run`, type: "info" }]);

    const codeMap = codeRef.current?.getCodeMap();

    console.log(codeMap);

    if (!codeMap) return;
    run(codeMap);
  }

  if (sessionId === "") {
    return <div>SessionID is missing</div>;
  }

  if (sessionFilesLoading) {
    return <div>Session is loading</div>;
  }

  if (isSessionError) {
    return <div>Failed to get session, it may not exist</div>;
  }

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      <CodeEditor ref={editorRef} codeRef={codeRef} sessionId={sessionId} />
      <Terminal
        lines={lines}
        running={running}
        sessionId={sessionId}
        onRun={handleRun}
        addLines={addLines}
        onClear={() => setLines([])}
      />
    </div>
  );
}
