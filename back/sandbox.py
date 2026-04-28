# sandbox.py
import docker
import tempfile
import os
from dataclasses import dataclass

client = docker.from_env()

@dataclass
class ExecutionResult:
    stdout: str
    stderr: str
    exit_code: int
    timed_out: bool
    oom_killed: bool

def run_code(
    code: str,
    language: str = "python",
    timeout_seconds: int = 10,
    memory_limit: str = "512m",
    cpu_period: int = 100_000,
    cpu_quota: int = 50_000,   # 50% of one CPU core
) -> ExecutionResult:
    """Execute untrusted code in a sandboxed Docker container."""

    # Language-specific execution commands
    commands = {
        "python": ["python3", "-c", code],
        "javascript": ["node", "-e", code],
        "bash": ["sh", "-c", code],
        "golang": ["sh", "-c", f"cat > /tmp/main.go << 'EOF'\n{code}\nEOF\ncd /tmp && go run main.go"],
    }
    
    images = {
      "python": "code-sandbox-py:latest",
      "golang": "code-sandbox-go:latest",
    }

    cmd = commands.get(language)
    if cmd is None:
        return ExecutionResult("", f"Unsupported language: {language}", 1, False, False)

    image = images.get(language)
    if image is None:
        return ExecutionResult("", f"Unsupported language: {language}", 1, False, False)

    try:
        container = client.containers.run(
            image,
            command=cmd,
            detach=True,
            # Security constraints
            network_disabled=True,     # no internet access
            read_only=True,            # read-only filesystem
            tmpfs={"/tmp": "size=128m,exec"},  # writable /tmp, 128MB cap
            environment={
              "GOCACHE": "/tmp/go-cache",
              "GOPATH": "/tmp/go-path",
            },
            mem_limit=memory_limit,    # RAM cap
            memswap_limit=memory_limit,  # no swap
            cpu_period=cpu_period,
            cpu_quota=cpu_quota,
            pids_limit=32,             # prevents fork bombs
            user="sandbox",
            # Drop all capabilities
            cap_drop=["ALL"],
            security_opt=["no-new-privileges:true"],
        )

        # Wait with timeout
        result = container.wait(timeout=timeout_seconds)
        exit_code = result["StatusCode"]
        oom_killed = result.get("Error", "") != "" or (
            container.attrs.get("State", {}).get("OOMKilled", False)
        )

        stdout = container.logs(stdout=True, stderr=False).decode("utf-8", errors="replace")
        stderr = container.logs(stdout=False, stderr=True).decode("utf-8", errors="replace")

        container.remove(force=True)

        return ExecutionResult(
            stdout=stdout[:50_000],  # cap output size
            stderr=stderr[:10_000],
            exit_code=exit_code,
            timed_out=False,
            oom_killed=oom_killed,
        )

    except docker.errors.ContainerError as e:
        return ExecutionResult("", str(e), 1, False, False)
    except Exception as e:
        # Timeout or other failure
        try:
            container.kill()
            container.remove(force=True)
        except Exception:
            pass
        return ExecutionResult("", str(e), 1, True, False)


# # Test it
# result = run_code('print("hello from sandbox")')
# print(f"stdout: {result.stdout}")
# print(f"exit: {result.exit_code}")
# # stdout: hello from sandbox
# # exit: 0

# # Test timeout protection
# result = run_code("import time; time.sleep(60)", timeout_seconds=3)
# print(f"timed_out: {result.timed_out}")
# # timed_out: True
