"use client";

import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { MonacoBinding } from "y-monaco";
import { editor } from "monaco-editor";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const monacoEditorDiv = document.getElementById("monaco-editor");
    if (!monacoEditorDiv) {
      console.error("couldn't find monaco-editor div");
      return;
    }

    const ydoc = new Y.Doc();
    const provider = new WebrtcProvider("monaco", ydoc);
    const type = ydoc.getText("monaco");

    const myEditor = editor.create(monacoEditorDiv, {
      value: "",
      language: "go",
      theme: "vs-dark",
    });

    const model = myEditor.getModel();
    if (!model) {
      console.error("couldn't get model");
      return;
    }

    const monacoBinding = new MonacoBinding(
      type,
      model,
      new Set([myEditor]),
      provider.awareness,
    );
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div id="monaco-editor" className="flex-1"></div>
    </div>
  );
}
