# go-sandbox

The purpose of this project is to create a collaborative go sandbox for executing Go code remotely. I built this using yjs and Docker containers.

## How it Works

There are 3 distinct parts to this project, the frontend lives in `front` directory, the Go backend in the `remote-execution` directory, and the Nodejs backend in teh `yjs-WebSocket-server` directory.

### Go backend

The Go backend exposes some endpoints, most importantly:

- `/execute`
- `/terminal`

The `/execute` endpoint accepts a map of filenames to their content, as well as session ID. It works by:

- creating files under `/code/<SESSION_ID>` and writing the file contents
- spinning up a docker container, mounting `/code/<SESSION_ID>` to the work directory
- running everything with `go run .`

The `/terminal` endpoint creates WebSocket connection for a given session ID. It is used to send the containers `stdout` and `stderr`.

### Node backend

The frontend uses yjs. For the connection provider, I opted to use the WebSocket provider, which is mediated by the Node backend. I used the official [yjs WebSocket server](https://github.com/yjs/y-WebSocket-server).

The `session_id` is used to specify a `room-name`, which allows multiple sessions to run in parallel. Loading the initial data is done with the simple `fetchSessionFiles` function inside `yjs-websocket-server\src\connector.js` - which fetches the session files from the Go backend. I set the files with a call to `setPersistence` inside `yjs-websocket-server\src\server.js`.

### Front

The Next.js frontend lives inside the `front` directory. It's a basic Next.js app that uses a couple of `useEffects` to initialise the yjs document, and the terminal WebSocket.

## How to Run

### Node backend

Need to have Node installed. Then:

- `cd yjs-WebSocket-server`
- `npm ci`
- `npm start`

### Go backend

Need to have go installed. Then:

- `cd remote-execution`
- `go mod download`
- `go mod tidy`
- `go run .`

### frontend

Need to have npm installed

- `cd front`
- `npm ci`
- `npm run dev`

Navigate to `http://localhost:3000` and check it out

### TODO:

- in the nodejs backend, update it to write on close
- set "running" state in yjs (make sure to clear it later!)

### Resoureces:

[Tutorial](https://how2.sh/posts/how-to-build-ai-code-execution-sandbox)

### TODO:

- in terminal websocket, maybe implement reconnection logic?
- consider what happens if frontend is open (nodejs websocket yjs has the doc) but the session is deleted in backend

- ~~container leak on error path (need a defer function)~~
- add container resource limits
- CORS bullshit
- make consistent error handling (use c.JSON instead of return err in api.go)
