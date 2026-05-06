package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"

	"github.com/coder/websocket"
	"github.com/labstack/echo/v5"
)

var sessionMissingErr = errors.New("session ID is missing")

func serve(hub *Hub, c *echo.Context, sessionID string) error {
	conn, err := websocket.Accept(c.Response(), c.Request(), &websocket.AcceptOptions{InsecureSkipVerify: true})
	if err != nil {
		log.Printf("error1: %v", err)
		//TODO: maybe handle the response here as well?
		return err
	}
	ctx, cancel := context.WithCancel(context.Background())
	client := &Client{
		hub:       hub,
		send:      make(chan []byte),
		conn:      conn,
		ctx:       ctx,
		cancel:    cancel,
		sessionID: sessionID,
	}
	hub.register <- client
	go client.read()
	go client.write()
	return nil
}

type ExecuteRequest struct {
	Files     map[string]string `json:"files"`
	SessionID string            `json:"session_id"`
}

func execute(c *echo.Context, hub *Hub) error {
	var req ExecuteRequest
	if err := c.Bind(&req); err != nil {
		log.Printf("got error: %v", err)
		return err
	}

	err := clearSession(req.SessionID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	for fileName, fileValue := range req.Files {
		err := writeToFile(fileName, req.SessionID, fileValue)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
	}

	err = run(hub, req.SessionID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.String(http.StatusOK, "ok")
}

type TerminalRequest struct {
	SessionID string `query:"session_id"`
}

func (t *TerminalRequest) validate() error {
	if t.SessionID == "" {
		return sessionMissingErr
	}

	return nil
}

func terminal(c *echo.Context, hub *Hub) error {
	var req TerminalRequest
	if err := c.Bind(&req); err != nil {
		log.Printf("got error: %v", err)
		return err
	}

	if err := req.validate(); err != nil {
		var status int
		if errors.Is(err, sessionMissingErr) {
			status = http.StatusBadRequest
		} else {
			status = http.StatusInternalServerError
		}
		return c.JSON(status, map[string]string{"error": err.Error()})
	}

	return serve(hub, c, req.SessionID)
}

func newSession(c *echo.Context) error {
	id, err := makeSessionFolder()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusCreated, map[string]string{"session_id": id})
}

type FilesRequest struct {
	SessionID string `query:"session_id"`
}

func getSessionFiles(c *echo.Context) error {
	var req FilesRequest
	if err := c.Bind(&req); err != nil {
		log.Printf("got error: %v", err)
		return err
	}

	fileMap, err := getFiles(req.SessionID)
	if err != nil {
		if errors.Is(err, sessionNotDirectory) {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": sessionNotDirectory.Error()})
		}
		if os.IsNotExist(err) {
			return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "something went wrong"})
	}

	return c.JSON(http.StatusOK, map[string]map[string]string{"fileMap": fileMap})
}

type PostFilesRequest struct {
	SessionID string            `json:"session_id"`
	Files     map[string]string `json:"files"`
}

func (r *PostFilesRequest) validate() error {
	if r.SessionID == "" {
		return sessionMissingErr
	}

	return nil
}

func postSessionFiles(c *echo.Context) error {
	var req PostFilesRequest
	if err := c.Bind(&req); err != nil {
		log.Printf("got error: %v", err)
		return err
	}

	if err := req.validate(); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	err := clearSession(req.SessionID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	for fileName, fileValue := range req.Files {
		err := writeToFile(fileName, req.SessionID, fileValue)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
	}

	return c.NoContent(http.StatusNoContent)
}

func sessions(c *echo.Context) error {
	sessions, err := getSessions()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string][]string{"session_ids": sessions})
}

type DeleteSessionRequest struct {
	SessionID string `json:"session_id"`
}

func sessionDelete(c *echo.Context) error {
	var req DeleteSessionRequest
	if err := c.Bind(&req); err != nil {
		log.Printf("got error: %v", err)
		return err
	}
	err := deleteSession(req.SessionID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.NoContent(http.StatusOK)
}
