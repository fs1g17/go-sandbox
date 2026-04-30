package main

import (
	"errors"
	"os"
	"path/filepath"

	"github.com/google/uuid"
)

var sessionNotDirectory = errors.New("session is not a directory")

func writeToFile(fileName string, sessionID string, content string) error {
	path := filepath.Join("./code", sessionID, fileName)
	finalPath, err := filepath.Abs(path)
	if err != nil {
		return err
	}

	err = os.WriteFile(finalPath, []byte(content), 0644)
	if err != nil {
		return err
	}

	return nil
}

func makeSessionFolder() (string, error) {
	id := uuid.New()
	path := filepath.Join("./code", id.String())
	finalPath, err := filepath.Abs(path)
	if err != nil {
		return "", err
	}

	err = os.Mkdir(finalPath, 0755)
	if err != nil {
		return "", err
	}

	writeToFile("go.mod", id.String(), "module example.com\n\ngo 1.24.5")
	writeToFile("main.go", id.String(), "package main\n\nimport \"fmt\"\n\nfunc main() {\n\tfmt.Println(\"hello world!!!\")\n}")

	return id.String(), nil
}

func pathExists(path string) (bool, error) {
	info, err := os.Stat(path)
	if os.IsNotExist(err) {
		return false, err
	}
	if !info.IsDir() {
		return false, sessionNotDirectory
	}
	return true, nil
}

func getFiles(sessionId string) (map[string]string, error) {
	fileMap := make(map[string]string)

	path := filepath.Join("./code", sessionId)
	finalPath, err := filepath.Abs(path)
	if err != nil {
		return fileMap, err
	}

	_, err = pathExists(finalPath)
	if err != nil {
		return fileMap, err
	}

	entries, err := os.ReadDir(finalPath)
	if err != nil {
		return fileMap, err
	}

	for _, e := range entries {
		if e.IsDir() {
			continue // skip subdirectories if you only want files
		}

		filePath := filepath.Join(finalPath, e.Name())
		content, err := os.ReadFile(filePath)
		if err != nil {
			return fileMap, err
		}

		fileMap[e.Name()] = string(content)
	}
	return fileMap, nil
}

func getSessions() ([]string, error) {
	path, err := filepath.Abs("./code")
	if err != nil {
		return nil, err
	}

	entries, err := os.ReadDir(path)
	if err != nil {
		return nil, err
	}

	var sessions []string
	for _, e := range entries {
		if e.IsDir() && e.Name() != ".cache" && e.Name() != ".config" {
			sessions = append(sessions, e.Name())
		}
	}

	return sessions, nil
}
