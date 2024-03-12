package models

type User struct {
	Picture string `json:"picture"`
	Name    string `json:"name"`
	Email   string `json:"email"`
	UserID  string `json:"user_id"`
}
