# api.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from sandbox import run_code

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)

class CodeRequest(BaseModel):
    code: str
    language: str = "python"
    timeout: int = 10

@app.post("/execute")
async def execute(req: CodeRequest):
    if req.timeout > 30:
        raise HTTPException(400, "Timeout must be 30 seconds or less")
    if len(req.code) > 50_000:
        raise HTTPException(400, "Code too large (50KB limit)")

    result = run_code(req.code, req.language, req.timeout)
    return {
        "stdout": result.stdout,
        "stderr": result.stderr,
        "exit_code": result.exit_code,
        "timed_out": result.timed_out,
    }
