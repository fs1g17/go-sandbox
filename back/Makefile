python-image:
	docker build -t code-sandbox-py:latest -f Dockerfile.python .

go-image:
	docker build -t code-sandbox-go:latest -f Dockerfile.golang .

run:
	uvicorn api:app --reload