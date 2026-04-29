"use client";

import { useEffect, useImperativeHandle, useRef } from "react";

export interface CodeEditorHandle {
  getValue: () => string;
}

export default function CodeEditor({ ref }: { ref: React.Ref<CodeEditorHandle> }) {
  const editorRef = useRef<import("monaco-editor").editor.IStandaloneCodeEditor | null>(null);

  useImperativeHandle(ref, () => ({
    getValue: () => editorRef.current?.getValue() ?? "",
  }));

  useEffect(() => {
    const monacoEditorDiv = document.getElementById("monaco-editor");
    if (!monacoEditorDiv) return;

    (async () => {
      const Y = await import("yjs");
      const { WebrtcProvider } = await import("y-webrtc");
      const { MonacoBinding } = await import("y-monaco");
      const { editor } = await import("monaco-editor");

      const ydoc = new Y.Doc();
      const provider = new WebrtcProvider("monaco", ydoc);
      const type = ydoc.getText("monaco");

      editorRef.current = editor.create(monacoEditorDiv, {
        value: "",
        language: "go",
        theme: "vs-dark",
      });

      const model = editorRef.current.getModel();
      if (!model) return;

      new MonacoBinding(type, model, new Set([editorRef.current]), provider.awareness);
    })();

    return () => {
      editorRef.current?.dispose();
    };
  }, []);

  return <div id="monaco-editor" className="flex-1 min-h-0" />;
}
