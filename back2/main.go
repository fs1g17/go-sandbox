package main

import (
	"bytes"
	"context"
	"fmt"

	"github.com/docker/docker/pkg/stdcopy"
	"github.com/moby/moby/api/types/container"
	"github.com/moby/moby/client"
)

func main() {
	apiClient, err := client.New(client.FromEnv)
	if err != nil {
		panic(err)
	}
	defer apiClient.Close()

	result, err := apiClient.ContainerCreate(
		context.Background(),
		client.ContainerCreateOptions{
			Name:  "poopy-scoopy",
			Image: "test-go-sandbox:latest",
			Config: &container.Config{
				Cmd: []string{"sh", "-c", "echo hello"},
			},
		})
	if err != nil {
		panic(err)
	}
	apiClient.ContainerStart(context.Background(), result.ID, client.ContainerStartOptions{})

	waitResult := apiClient.ContainerWait(context.Background(), result.ID, client.ContainerWaitOptions{Condition: container.WaitConditionNotRunning})

	select {
	case err := <-waitResult.Error:
		panic(err)
	case <-waitResult.Result:
		fmt.Println("completed successfully")
	}

	logs, err := apiClient.ContainerLogs(context.Background(), result.ID, client.ContainerLogsOptions{ShowStdout: true, ShowStderr: true})
	if err != nil {
		panic(err)
	}
	defer logs.Close()

	var stdout, stderr bytes.Buffer
	stdcopy.StdCopy(&stdout, &stderr, logs)
	fmt.Println("stdout:", stdout.String())
	fmt.Println("stderr:", stderr.String())
}
