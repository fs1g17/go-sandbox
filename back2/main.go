package main

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v5"
)

type ExecuteRequest struct {
	Files map[string]string `json:"files"`
}

func main() {
	e := echo.New()

	e.GET("/", func(c *echo.Context) error {
		return c.String(http.StatusOK, "Hello, World!")
	})

	e.POST("/execute", func(c *echo.Context) error {
		var req ExecuteRequest
		if err := c.Bind(&req); err != nil {
			fmt.Print(fmt.Errorf("got error: %v", err))
			return err
		}

		for fileName, fileValue := range req.Files {
			fmt.Print(fileName + ":" + fileValue)
		}
		return c.String(http.StatusOK, "ok")
	})

	// run()

	if err := e.Start(":8000"); err != nil {
		e.Logger.Error("failed to start server", "error", err)
	}
}
