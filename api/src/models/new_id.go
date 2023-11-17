package models

import (
	"crypto/rand"
	"math/big"
	"strings"
)

// NewID generates a random base-58 ID with optional prefixes.
func NewID(prefixes ...string) string {
	alphabet := "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz" // base58
	size := 11

	// Concatenate all prefixes if provided
	prefix := strings.Join(prefixes, "")

	id := make([]byte, size)
	for i := range id {
		randomInt, _ := rand.Int(rand.Reader, big.NewInt(int64(len(alphabet))))
		id[i] = alphabet[randomInt.Int64()]
	}

	return prefix + string(id)
}
