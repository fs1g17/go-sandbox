package main

import (
	"fmt"
	"slices"
)

type SessionMessage struct {
	sessionID string
	message   string
}

type Hub struct {
	clients    map[string][]*Client
	register   chan *Client
	unregister chan *Client
	message    chan SessionMessage
}

func newHub() *Hub {
	return &Hub{
		clients:    make(map[string][]*Client),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		message:    make(chan SessionMessage),
	}
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			// appending to nil slice just creates it - so it's fine
			h.clients[client.sessionID] = append(h.clients[client.sessionID], client)
		case client := <-h.unregister:
			// if session has already been deleted, return early
			if _, ok := h.clients[client.sessionID]; !ok {
				continue
			}

			updatedSessionClients := slices.DeleteFunc(h.clients[client.sessionID], func(c *Client) bool {
				return c == client
			})

			// if session has no more users, delete from memory
			if len(updatedSessionClients) == 0 {
				delete(h.clients, client.sessionID)
			} else {
				h.clients[client.sessionID] = updatedSessionClients
			}
		case msg := <-h.message:
			fmt.Printf("recieved message: %v\n", string(msg.message))
			// loop over clients and push message into their send channels

			var i int = 0
			for _, client := range h.clients[msg.sessionID] {
				client.send <- []byte(msg.message)
				fmt.Printf("sent message to client %d\n", i)
				i++
			}
		}
	}
}
