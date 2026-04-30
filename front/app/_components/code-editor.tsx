"use client";

import { useEffect, useImperativeHandle, useRef, useState } from "react";
import FileSystem from "./file-system";

export interface CodeEditorHandle {
  getValue: () => string;
}

export default function CodeEditor({
  ref,
}: {
  ref: React.Ref<CodeEditorHandle>;
}) {
  const editorRef = useRef<
    import("monaco-editor").editor.IStandaloneCodeEditor | null
  >(null);
  const yDocRef = useRef<import("yjs").Doc>(null);
  const providerRef = useRef<import("y-webrtc").WebrtcProvider>(null);
  const modelsRef = useRef<
    Map<string, import("monaco-editor").editor.ITextModel>
  >(new Map());
  const bindingsRef = useRef<Map<string, import("y-monaco").MonacoBinding>>(
    new Map(),
  );

  const [files, setFiles] = useState<string[]>([]);
  const [activeFile, setActiveFile] = useState<string>();
  useImperativeHandle(ref, () => ({
    getValue: () => editorRef.current?.getValue() ?? "",
  }));

  function setSharedActiveFile(name: string) {
    if (yDocRef.current) {
      yDocRef.current.getMap("state").set("activeFile", name);
    } else {
      setActiveFile(name);
    }
  }

  function handleAddFile(name: string) {
    const yFiles = yDocRef.current?.getArray<string>("files");
    if (!yFiles || yFiles.toArray().includes(name)) return;
    yFiles.push([name]);
    setSharedActiveFile(name);
  }

  useEffect(() => {
    const monacoEditorDiv = document.getElementById("monaco-editor");
    if (!monacoEditorDiv) return;

    (async () => {
      const Y = await import("yjs");
      const { WebrtcProvider } = await import("y-webrtc");
      const { MonacoBinding } = await import("y-monaco");
      const { editor } = await import("monaco-editor");

      if (!yDocRef.current) {
        yDocRef.current = new Y.Doc();
        providerRef.current = new WebrtcProvider("monaco", yDocRef.current);
        editorRef.current = editor.create(monacoEditorDiv, {
          value: "",
          language: "go",
          theme: "vs-dark",
        });

        const yFiles = yDocRef.current.getArray<string>("files");
        const yState = yDocRef.current.getMap("state");

        // Register observers exactly once
        yFiles.observe(() => setFiles(yFiles.toArray()));
        yState.observe(() => {
          const af = yState.get("activeFile") as string | undefined;
          if (af) setActiveFile(af);
        });

        setFiles(yFiles.toArray());
        const af = yState.get("activeFile") as string | undefined;
        if (af) setActiveFile(af);

        return; // activeFile update will re-trigger this effect
      }

      if (!activeFile) return;

      if (!modelsRef.current.has(activeFile)) {
        const model = editor.createModel("", "go");
        const yText = yDocRef.current.getText(activeFile);
        const binding = new MonacoBinding(
          yText,
          model,
          new Set([editorRef.current!]),
          providerRef.current!.awareness,
        );
        modelsRef.current.set(activeFile, model);
        bindingsRef.current.set(activeFile, binding);
      }

      editorRef.current!.setModel(modelsRef.current.get(activeFile)!);
    })();
  }, [activeFile]);

  return (
    <div className="flex flex-1 min-h-0">
      <FileSystem
        files={files}
        activeFile={activeFile}
        onFileSelect={setSharedActiveFile}
        onAddFile={handleAddFile}
      />
      <div id="monaco-editor" className="flex-1 min-h-0" />
    </div>
  );
}
