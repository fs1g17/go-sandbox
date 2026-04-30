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

  const [files, setFiles] = useState<string[]>(["main.go"]);
  const [activeFile, setActiveFile] = useState(files[0]);
  useImperativeHandle(ref, () => ({
    getValue: () => editorRef.current?.getValue() ?? "",
  }));

  function handleAddFile(name: string) {
    if (files.includes(name)) return;
    setFiles((prev) => [...prev, name]);
    setActiveFile(name);

    if (!yDocRef.current) return;
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
      }

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

    return () => {
      //editorRef.current?.dispose();
    };
  }, [activeFile]);

  return (
    <div className="flex flex-1 min-h-0">
      <FileSystem
        files={files}
        activeFile={activeFile}
        onFileSelect={setActiveFile}
        onAddFile={handleAddFile}
      />
      <div id="monaco-editor" className="flex-1 min-h-0" />
    </div>
  );
}
