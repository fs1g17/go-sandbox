package main

import (
	"errors"
	"os"
	"path/filepath"

	"github.com/google/uuid"
)

var noSessionErr = errors.New("no such session exists")

func writeToFile(fileName string, content string) error {
	path := filepath.Join("./code", fileName)
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

	return id.String(), nil
}

func pathExists(path string) (bool, error) {
	info, err := os.Stat(path)
	return (!os.IsNotExist(err) && info.IsDir()), err
}

func getFiles(sessionId string) (map[string]string, error) {
	fileMap := make(map[string]string)

	path := filepath.Join("./code", sessionId)
	finalPath, err := filepath.Abs(path)
	if err != nil {
		return fileMap, err
	}

	exists, err := pathExists(finalPath)
	if err != nil {
		return fileMap, err
	}
	if !exists {
		return fileMap, noSessionErr
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
