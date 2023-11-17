package models

import (
	"strings"
	"testing"
)

// TestNewID tests the NewID function.
func TestNewID(t *testing.T) {
	tests := []struct {
		name      string
		prefixes  []string
		wantLen   int
		wantStart string
	}{
		{"NoPrefix", []string{}, 11, ""},
		{"SinglePrefix", []string{"abc-"}, 15, "abc-"},
		{"MultiplePrefixes", []string{"abc-", "123-", "xyz-"}, 23, "abc-123-xyz-"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := NewID(tt.prefixes...)

			if len(got) != tt.wantLen {
				t.Errorf("NewID() = %v, want length %v", got, tt.wantLen)
			}

			if !strings.HasPrefix(got, tt.wantStart) {
				t.Errorf("NewID() = %v, want prefix %v", got, tt.wantStart)
			}
		})
	}
}
