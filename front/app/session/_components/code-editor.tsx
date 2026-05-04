"use client";

import { Doc } from "yjs";
import { editor } from "monaco-editor";
import { CodeExecutor } from "../page";
import FileSystem from "./file-system";
import { MonacoBinding } from "y-monaco";
import { WebsocketProvider } from "y-websocket";
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { deleteFile } from "@/api/sessions";
import { useMutation } from "@tanstack/react-query";

export interface CodeEditorHandle {
  getValue: () => string;
}

export default function CodeEditor({
  ref,
  codeRef,
  sessionId = "",
}: {
  ref: React.Ref<CodeEditorHandle>;
  codeRef: React.Ref<CodeExecutor>;
  sessionId?: string;
}) {
  const yDocRef = useRef<Doc>(null);
  const providerRef = useRef<WebsocketProvider>(null);
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

  const { mutate: handleDeleteFile } = useMutation({
    mutationFn: ({
      name,
      activeFileName,
    }: {
      name: string;
      activeFileName?: string;
    }) => deleteFile(sessionId, name),
    onSettled: (_, _2, { name, activeFileName }) => {
      console.log("deleted file successfully");
      const yFiles = yDocRef.current?.getArray<string>("files");
      if (yFiles) {
        const idx = yFiles.toArray().indexOf(name);
        if (idx !== -1) yFiles.delete(idx, 1);
      }

      bindingsRef.current.get(name)?.destroy();
      bindingsRef.current.delete(name);
      modelsRef.current.get(name)?.dispose();
      modelsRef.current.delete(name);

      if (activeFileName === name) {
        const remaining =
          yDocRef.current?.getArray<string>("files").toArray() ?? [];
        if (remaining.length > 0) {
          setSharedActiveFile(remaining[0]);
        } else {
          editorRef.current?.setModel(null);
          setActiveFile(undefined);
        }
      }
    },
  });

  const createModelBinding = useCallback((activeFile: string) => {
    const model = editor.createModel("", "go");
    const yText = yDocRef.current!.getText(activeFile);
    const binding = new MonacoBinding(
      yText,
      model,
      new Set([editorRef.current!]),
      providerRef.current!.awareness,
    );
    modelsRef.current.set(activeFile, model);
    bindingsRef.current.set(activeFile, binding);
  }, []);

  useEffect(() => {
    const monacoEditorDiv = document.getElementById("monaco-editor");
    if (!monacoEditorDiv) return;

    if (!yDocRef.current) {
      yDocRef.current = new Doc();
      providerRef.current = new WebsocketProvider(
        "ws://localhost:1234",
        sessionId,
        yDocRef.current,
      );
      editorRef.current = editor.create(monacoEditorDiv, {
        value: "",
        language: "go",
        theme: "vs-dark",
      });

      const yFiles = yDocRef.current.getArray<string>("files");
      const yState = yDocRef.current.getMap("state");

      yFiles.observe(() => {
        const updatedFileNames = yFiles.toArray();
        setFiles(updatedFileNames);
        // create models and bindings for each file name

        // filter out the new ones
        const newFileNames = updatedFileNames.filter(
          (updatedFileName) => !modelsRef.current.has(updatedFileName),
        );
        // create models for each
        newFileNames.forEach(createModelBinding);
      });
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

    // if the user created a new file
    if (!modelsRef.current.has(activeFile)) {
      createModelBinding(activeFile);
    }

    editorRef.current!.setModel(modelsRef.current.get(activeFile)!);

    return () => {
      // TODO: implement the cleanup of all resources
    };
  }, [activeFile, sessionId]);

  return (
    <div className="flex flex-1 min-h-0">
      <FileSystem
        files={files}
        activeFile={activeFile}
        onFileSelect={setSharedActiveFile}
        onAddFile={handleAddFile}
        onDeleteFile={(name) =>
          handleDeleteFile({ name, activeFileName: activeFile })
        }
      />
      <div id="monaco-editor" className="flex-1 min-h-0" />
    </div>
  );
}
