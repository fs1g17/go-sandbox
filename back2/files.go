package main

import (
	"os"
	"path/filepath"
)

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
