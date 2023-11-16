package models

import (
	"crypto/rand"
	"math/big"
)

// NewID generates a random base-58 ID.
func NewID() string {
	alphabet := "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz" // base58
	size := 11

	id := make([]byte, size)
	for i := range id {
		randomInt, _ := rand.Int(rand.Reader, big.NewInt(int64(len(alphabet))))
		id[i] = alphabet[randomInt.Int64()]
	}

	return string(id)
}
