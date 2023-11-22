package src

import (
	"fmt"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/julienschmidt/httprouter"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// Achten Sie auf Sicherheitsaspekte bezüglich der Herkunftsüberprüfung!
	CheckOrigin: func(r *http.Request) bool { return true },
}

func (app *application) apiHandleWebSocket(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	projectId, valid := app.getAndValidateID(w, r, "projectId")
	if !valid {
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		app.logger.Info(fmt.Sprintf("Failed to upgrade to websocket: %v", err))
		return
	}

	app.logger.Info(fmt.Sprintf("WebSocket connection established for project: %s", projectId))
	app.WebSocketHandler(conn, projectId)
}

func (app *application) WebSocketHandler(conn *websocket.Conn, projectId string) {
	client := &wsClient{conn: conn, projectId: projectId}

	app.mutex.Lock()
	if app.clients[projectId] == nil {
		app.clients[projectId] = make(map[*wsClient]bool)
	}
	app.clients[projectId][client] = true
	app.mutex.Unlock()

	app.logger.Info(fmt.Sprintf("New WebSocket client registered for project: %s", projectId))

	defer func() {
		app.mutex.Lock()
		delete(app.clients[projectId], client)
		if len(app.clients[projectId]) == 0 {
			delete(app.clients, projectId)
		}
		app.mutex.Unlock()
		conn.Close()
		app.logger.Info(fmt.Sprintf("WebSocket client disconnected from project: %s", projectId))
	}()

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			app.logger.Info(fmt.Sprintf("Error reading message: %v", err))
			break
		}

		// Hier können Sie die empfangene Nachricht verarbeiten.
		// Zum Beispiel: Echo der Nachricht an alle Clients senden
		app.sendMessageToProjectClients(projectId, message)
	}
}

func (app *application) sendMessageToProjectClients(projectId string, message []byte) {
	app.mutex.Lock()
	defer app.mutex.Unlock()

	for client := range app.clients[projectId] {
		err := client.conn.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			app.logger.Info(fmt.Sprintf("Error sending message to WebSocket client: %v", err))
			client.conn.Close()
			delete(app.clients[projectId], client)
		}
	}
}
