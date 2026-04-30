package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"

	"github.com/coder/websocket"
	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
)

type ExecuteRequest struct {
	Files     map[string]string `json:"files"`
	SessionID string            `json:"session_id"`
}

type FilesRequest struct {
	SessionID string `query:"session_id"`
}

func serve(hub *Hub, c *echo.Context) error {
	conn, err := websocket.Accept(c.Response(), c.Request(), &websocket.AcceptOptions{InsecureSkipVerify: true})
	if err != nil {
		log.Printf("error1: %v", err)
		//TODO: maybe handle the response here as well?
		return err
	}
	ctx, cancel := context.WithCancel(context.Background())
	client := &Client{hub: hub, send: make(chan []byte), conn: conn, ctx: ctx, cancel: cancel}
	hub.register <- client
	go client.read()
	go client.write()
	return nil
}

func main() {
	e := echo.New()
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:3000"},
	}))
	hub := newHub()
	go hub.run()

	e.POST("/execute", func(c *echo.Context) error {
		var req ExecuteRequest
		if err := c.Bind(&req); err != nil {
			fmt.Print(fmt.Errorf("got error: %v", err))
			return err
		}

		for fileName, fileValue := range req.Files {
			err := writeToFile(fileName, req.SessionID, fileValue)
			if err != nil {
				return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
			}
		}

		run(hub)

		return c.String(http.StatusOK, "ok")
	})

	e.GET("/terminal", func(c *echo.Context) error {
		err := serve(hub, c)
		if err != nil {
			return err
		}
		return nil
	})

	e.GET("/new-session", func(c *echo.Context) error {
		id, err := makeSessionFolder()
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}

		return c.JSON(http.StatusCreated, map[string]string{"session_id": id})
	})

	e.GET("/files", func(c *echo.Context) error {
		var req FilesRequest
		if err := c.Bind(&req); err != nil {
			fmt.Print(fmt.Errorf("got error: %v", err))
			return err
		}

		fmt.Println(req.SessionID)

		fileMap, err := getFiles(req.SessionID)
		if err != nil {
			if errors.Is(err, noSessionErr) {
				return c.JSON(http.StatusNotFound, map[string]string{"error": noSessionErr.Error()})
			}
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "something went wrong"})
		}

		return c.JSON(http.StatusOK, map[string]map[string]string{"fileMap": fileMap})
	})

	if err := e.Start(":8000"); err != nil {
		e.Logger.Error("failed to start server", "error", err)
	}
}
