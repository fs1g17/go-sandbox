# go-sandbox

The purpose of this project is to create a collaborative go sandbox for executing Go code remotely

### TODO

- ~~implement backend with Go (not testcontainers, there's the moby project)~~
- ~~implement console with websockets~~
- allow multiple files: allow creating files in temp directory:
  - when user clicks run, all the file names and their contents are copied over (or sent as a zip)
  - copied over to temp directory
  - then executed with run command, something like "go run ."

### Resoureces:

[Tutorial](https://how2.sh/posts/how-to-build-ai-code-execution-sandbox)
