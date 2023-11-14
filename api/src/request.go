package src

import (
	"time"

	"github.com/google/uuid"
)

// GenerateUUID generates a new UUID v5 using the current time and returns it as a string.
func GenerateUUID() string {
	// Get the current time as a string
	t := time.Now().String()

	// Generate a UUID from the string
	id := uuid.NewSHA1(uuid.NameSpaceDNS, []byte(t))

	return id.String()
}
