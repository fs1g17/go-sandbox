package main

import (
	"bytes"
	"context"
	"fmt"
	"path/filepath"

	"github.com/docker/docker/pkg/stdcopy"
	"github.com/moby/moby/api/types/container"
	"github.com/moby/moby/client"
)

func createContainer(apiClient *client.Client) (client.ContainerCreateResult, error) {
	codeDir, err := filepath.Abs("./code")
	if err != nil {
		panic(err)
	}

	result, err := apiClient.ContainerCreate(
		context.Background(),
		client.ContainerCreateOptions{
			Name:  "golang_test",
			Image: "test-go-sandbox:latest",
			Config: &container.Config{
				Cmd: []string{"go", "run", "."},
			},
			HostConfig: &container.HostConfig{
				Binds: []string{codeDir + ":/home/sandbox"},
			},
		})
	if err != nil {
		return result, err
	}

	return result, nil
}

type ContainerLogs struct {
	stdout string
	stderr string
}

func getContainerLogs(apiClient *client.Client, result client.ContainerCreateResult) (*ContainerLogs, error) {
	apiClient.ContainerStart(context.Background(), result.ID, client.ContainerStartOptions{})

	waitResult := apiClient.ContainerWait(context.Background(), result.ID, client.ContainerWaitOptions{Condition: container.WaitConditionNotRunning})

	select {
	case err := <-waitResult.Error:
		return nil, err
	case <-waitResult.Result:
		fmt.Println("completed successfully")
	}

	logs, err := apiClient.ContainerLogs(context.Background(), result.ID, client.ContainerLogsOptions{ShowStdout: true, ShowStderr: true})
	if err != nil {
		return nil, err
	}
	defer logs.Close()

	var stdout, stderr bytes.Buffer
	stdcopy.StdCopy(&stdout, &stderr, logs)

	return &ContainerLogs{
		stdout: stdout.String(),
		stderr: stderr.String(),
	}, nil
}

func run(hub *Hub) {
	apiClient, err := client.New(client.FromEnv)
	if err != nil {
		panic(err)
	}
	defer apiClient.Close()

	result, err := createContainer(apiClient)
	if err != nil {
		panic(err)
	}

	containerLogs, err := getContainerLogs(apiClient, result)
	if err != nil {
		panic(err)
	}

	fmt.Printf("stdout: %s", containerLogs.stdout)
	fmt.Printf("stderr: %s", containerLogs.stderr)
	msg := fmt.Sprintf("stdout: %s\nstderr: %s\n", containerLogs.stdout, containerLogs.stderr)
	hub.message <- []byte(msg)

	apiClient.ContainerRemove(context.Background(), result.ID, client.ContainerRemoveOptions{})
}
