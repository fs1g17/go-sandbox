#!/usr/bin/env node

import WebSocket from "ws";
import http from "http";
import * as number from "lib0/number";
import { setPersistence, setupWSConnection } from "./utils.js";
import { fetchSessionFiles } from "./connector.js";

const wss = new WebSocket.Server({ noServer: true });
const host = process.env.HOST || "localhost";
const port = number.parseInt(process.env.PORT || "1234");

const server = http.createServer((_request, response) => {
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.end("okay");
});

setPersistence({
  bindState: async (docName, ydoc) => {
    // Called when a Y.Doc is first accessed.
    // Load the persisted state for `docName` and apply it to `ydoc`.
    //
    // It is recommended to also subscribe to `ydoc.on('update', update => ...)`
    // here so you can persist updates incrementally as they happen, rather
    // than only on shutdown.

    console.log("FETCHING FILES");
    const filesArray = ydoc.getArray("files");
    const state = ydoc.getMap("state");

    try {
      const data = await fetchSessionFiles(docName);

      const fileNames = Object.keys(data);

      console.log("GOT FILES");
      fileNames.forEach(console.log);

      filesArray.push(fileNames);
      fileNames.forEach((name) => {
        const yText = ydoc.getText(name);
        yText.insert(0, data[name]);
      });

      state.set("activeFile", fileNames[0]);
    } catch (error) {
      console.error(error);
      state.set("error", "true");
    }
  },
  writeState: async (docName, ydoc) => {
    // Called when the last connected client disconnects from this document
    // (i.e. the session is closing). Flush / persist any remaining state.
  },
});

wss.on("connection", setupWSConnection);

server.on("upgrade", (request, socket, head) => {
  // You may check auth of request here..
  // Call `wss.HandleUpgrade` *after* you checked whether the client has access
  // (e.g. by checking cookies, or url parameters).
  // See https://github.com/websockets/ws#client-authentication
  wss.handleUpgrade(
    request,
    socket,
    head,
    /** @param {any} ws */ (ws) => {
      wss.emit("connection", ws, request);
    },
  );
});

server.listen(port, host, () => {
  console.log(`running at '${host}' on port ${port}`);
});
