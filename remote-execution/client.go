package main

import (
	"context"

	"github.com/coder/websocket"
)

type Client struct {
	hub    *Hub
	send   chan []byte
	conn   *websocket.Conn
	ctx    context.Context
	cancel context.CancelFunc
}

func (c *Client) read() {
	defer c.cancel()

	for {
		_, r, err := c.conn.Read(c.ctx)
		if err != nil {
			c.hub.unregister <- c
			return
		}
		c.hub.message <- r
	}
}

func (c *Client) write() {
	defer c.cancel()

	for {
		select {
		case <-c.ctx.Done():
			return
		case msg := <-c.send:
			err := c.conn.Write(c.ctx, websocket.MessageText, msg)
			if err != nil {
				c.hub.unregister <- c
				return
			}
		}
	}
}
