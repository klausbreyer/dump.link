package src

import (
	"fmt"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// Achten Sie auf Sicherheitsaspekte bezüglich der Herkunftsüberprüfung!
	CheckOrigin: func(r *http.Request) bool { return true },
}

func (app *application) WebSocketHandler(conn *websocket.Conn) {
	app.mutex.Lock()
	app.clients[conn] = true
	app.mutex.Unlock()

	defer func() {
		app.mutex.Lock()
		delete(app.clients, conn)
		app.mutex.Unlock()
		conn.Close()
	}()

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			app.logger.Info(fmt.Sprintf("Error reading message: %v", err))
			break
		}

		// Hier können Sie die empfangene Nachricht verarbeiten.
		// Zum Beispiel: Echo der Nachricht an alle Clients senden
		app.sendMessageToAllClients(message)
	}
}

func (app *application) sendMessageToAllClients(message []byte) {
	app.mutex.Lock()
	defer app.mutex.Unlock()

	for client := range app.clients {
		err := client.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			app.logger.Info(fmt.Sprintf("Error sending message to WebSocket client: %v", err))
			client.Close()
			delete(app.clients, client)
		}
	}
}
