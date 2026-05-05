package main

import (
	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
)

func main() {
	e := echo.New()
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:3000"},
	}))
	hub := newHub()
	go hub.run()

	e.POST("/execute", func(c *echo.Context) error {
		return execute(c, hub)
	})
	e.GET("/terminal", func(c *echo.Context) error {
		return terminal(c, hub)
	})
	e.POST("/new-session", newSession)
	e.GET("/session-files", sessionFiles)
	e.GET("/sessions", sessions)
	e.DELETE("/session", sessionDelete)

	if err := e.Start(":8000"); err != nil {
		e.Logger.Error("failed to start server", "error", err)
	}
}
