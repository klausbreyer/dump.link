package src

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/julienschmidt/httprouter"
)

type ActionType string

const (
	ActionAddTask                ActionType = "ADD_TASK"
	ActionUpdateBucket           ActionType = "UPDATE_BUCKET"
	ActionUpdateProject          ActionType = "UPDATE_PROJECT"
	ActionResetBucketLayers      ActionType = "RESET_BUCKET_LAYER"
	ActionResetProjectLayers     ActionType = "RESET_PROJECT_LAYERS"
	ActionUpdateTask             ActionType = "UPDATE_TASK"
	ActionAddBucketDependency    ActionType = "ADD_BUCKET_DEPENDENCY"
	ActionRemoveBucketDependency ActionType = "REMOVE_BUCKET_DEPENDENCY"
	ActionUpdateActivities       ActionType = "UPDATE_ACTIVITIES"
	ActionDeleteTask             ActionType = "DELETE_TASK"

	//not for websocket
	ActionSetInitialState ActionType = "SET_INITIAL_STATE"

	// only in the backend.
	ActionCreateProject ActionType = "CREATE_PROJECT"
)

type wsEnvelope struct {
	Action ActionType  `json:"action"`
	Data   interface{} `json:"data"`
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		for _, allowedOrigin := range allowedOrigins {
			if origin == allowedOrigin {
				return true
			}
		}
		return false
	},
}

func (app *application) apiHandleWebSocket(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	projectId, valid := app.getAndValidateID(w, r, "projectId")
	if !valid {
		return
	}

	token := app.getTokenFromRequest(r)
	username := app.getUsernameFromRequest(r)

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		app.logger.Info(fmt.Sprintf("Failed to upgrade to websocket: %v", err))
		return
	}

	app.logger.Info(fmt.Sprintf("WebSocket connection established for project: %s", projectId))
	app.WebSocketHandler(conn, token, projectId, username)
}

func (app *application) WebSocketHandler(conn *websocket.Conn, token string, projectId string, username string) {
	client := &wsClient{
		conn:           conn,
		projectId:      projectId,
		clientToken:    token,
		clientUsername: username,
	}
	app.mutex.Lock()
	if app.clients[projectId] == nil {
		app.clients[projectId] = make(map[*wsClient]bool)
	}
	app.clients[projectId][client] = true
	app.mutex.Unlock()

	app.logger.Info(fmt.Sprintf("New WebSocket client registered for project: %s", projectId))
	app.logClientCount(projectId, username)

	defer func() {
		app.mutex.Lock()
		delete(app.clients[projectId], client)
		if len(app.clients[projectId]) == 0 {
			delete(app.clients, projectId)
		}
		app.mutex.Unlock()
		conn.Close()
		app.logger.Info(fmt.Sprintf("WebSocket client disconnected from project: %s", projectId))

		app.logClientCount(projectId, username)
	}()

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			app.logger.Info(fmt.Sprintf("Error reading message: %v", err))
			break
		}

		app.sendMessageToProjectClients(projectId, message)
	}
}

/**
 * Underlying sending method
 */
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

/**
 * Abstracted version, so we can send any data to any project.
 */
func (app *application) sendActionDataToProjectClients(projectId string, senderToken string, action ActionType, data interface{}) {
	wsData := wsEnvelope{
		Action: action,
		Data:   data,
	}

	messageJSON, err := json.Marshal(wsData)
	if err != nil {
		app.logger.Info(fmt.Sprintf("Error marshalling WebSocket data: %v", err))
		return
	}

	app.mutex.Lock()
	defer app.mutex.Unlock()

	for client := range app.clients[projectId] {
		if client.clientToken != senderToken {
			err := client.conn.WriteMessage(websocket.TextMessage, messageJSON)
			if err != nil {
				app.logger.Info(fmt.Sprintf("Error sending message to WebSocket client: %v", err))
				client.conn.Close()
				delete(app.clients[projectId], client)
			}
		}
	}
}

func (app *application) logClientCount(projectId string, username string) {
	app.mutex.Lock()
	defer app.mutex.Unlock()

	count := len(app.clients[projectId])

	app.logger.Info(fmt.Sprintf("Number of WebSocket clients for project '%s': %d", projectId, count))
	err := app.logSubscriptions.Insert(projectId, count, username)
	if err != nil {
		app.logger.Info(fmt.Sprintf("Error logging WebSocket client count: %v", err))
	}
}
