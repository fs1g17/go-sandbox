# go-sandbox

The purpose of this project is to create a collaborative go sandbox for executing Go code remotely

## How to Run

### backend

Need to have go installed. Then:

- `cd back`
- `go mod download`
- `go mod tidy`
- `go run .`

### frontend

Need to have npm installed

- `cd front`
- `npm ci`
- `npm run dev`

Navigate to `http://localhost:3000` and check it out

### TODO

- ~~implement backend with Go (not testcontainers, there's the moby project)~~
- ~~implement console with websockets~~
- allow multiple files: allow creating files in temp directory:
  - when user clicks run, all the file names and their contents are copied over (or sent as a zip)
  - copied over to temp directory
  - then executed with run command, something like "go run ."

### Resoureces:

[Tutorial](https://how2.sh/posts/how-to-build-ai-code-execution-sandbox)

### TODO:

- Go backend doesn't write to sessions correctly (when calling /execute)

- generally test that sessions do indeed work

- make sure that when visiting a link with invalid session id, error is displayed in some form:
  - could be done with a simple /session-exists endpoint?
  - in yjs websocket server, I could initialise state with "error", and check for that, but that doesn't feel as clean
