"use client";

import { Doc } from "yjs";
import { editor } from "monaco-editor";
import { CodeExecutor } from "../page";
import FileSystem from "./file-system";
import { MonacoBinding } from "y-monaco";
import { WebrtcProvider } from "y-webrtc";
import { useEffect, useImperativeHandle, useRef, useState } from "react";

export interface CodeEditorHandle {
  getValue: () => string;
}

export default function CodeEditor({
  ref,
  codeRef,
}: {
  ref: React.Ref<CodeEditorHandle>;
  codeRef: React.Ref<CodeExecutor>;
}) {
  const yDocRef = useRef<Doc>(null);
  const providerRef = useRef<WebrtcProvider>(null);
  const bindingsRef = useRef<Map<string, MonacoBinding>>(new Map());
  const modelsRef = useRef<Map<string, editor.ITextModel>>(new Map());
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const [files, setFiles] = useState<string[]>([]);
  const [activeFile, setActiveFile] = useState<string>();

  useImperativeHandle(ref, () => ({
    getValue: () => editorRef.current?.getValue() ?? "",
  }));

  useImperativeHandle(codeRef, () => ({
    getCodeMap: () => {
      const result: { [key: string]: string } = {};
      modelsRef.current.forEach((value, key) => {
        result[key] = value.getValue();
      });
      return result;
    },
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

    if (!yDocRef.current) {
      yDocRef.current = new Doc();
      providerRef.current = new WebrtcProvider("monaco", yDocRef.current);
      editorRef.current = editor.create(monacoEditorDiv, {
        value: "",
        language: "go",
        theme: "vs-dark",
      });

      const yFiles = yDocRef.current.getArray<string>("files");
      const yState = yDocRef.current.getMap("state");

      yFiles.observe(() => setFiles(yFiles.toArray()));
      yState.observe(() => {
        const af = yState.get("activeFile") as string | undefined;
        if (af) setActiveFile(af);
      });

      setFiles(yFiles.toArray());
      const af = yState.get("activeFile") as string | undefined;
      if (af) setActiveFile(af);

      return;
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
