package main

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/coder/websocket"
	"github.com/labstack/echo/v5"
)

type ExecuteRequest struct {
	Files map[string]string `json:"files"`
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
	hub := newHub()
	go hub.run()

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
			err := writeToFile(fileName, fileValue)
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

	if err := e.Start(":8000"); err != nil {
		e.Logger.Error("failed to start server", "error", err)
	}
}
