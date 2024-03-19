package auth0client

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sync"
	"time"

	"dump.link/src/models"
)

const cacheDuration = time.Minute

type Auth0Client struct {
	Domain          string
	M2MClientID     string
	M2MClientSecret string
	M2MAudience     string
	httpClient      *http.Client

	mu          sync.Mutex
	accessToken string
	expiry      time.Time
	orgCache    map[string]cachedResult // Hinzugefügt für Caching
}

type tokenResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int    `json:"expires_in"`
	Scope       string `json:"scope"`
}

type cachedResult struct {
	Members []models.User
	Time    time.Time
}

func NewAuth0Client(domain, m2mClientID, m2mClientSecret, m2mAudience string) *Auth0Client {
	return &Auth0Client{
		Domain:          domain,
		M2MClientID:     m2mClientID,
		M2MClientSecret: m2mClientSecret,
		M2MAudience:     m2mAudience,
		httpClient:      &http.Client{Timeout: 10 * time.Second},
		orgCache:        make(map[string]cachedResult),
	}
}

func (client *Auth0Client) GetOrganizationMembers(orgId string) ([]models.User, error) {
	client.mu.Lock()
	cached, exists := client.orgCache[orgId]
	client.mu.Unlock()
	if exists && time.Since(cached.Time) < cacheDuration {
		return cached.Members, nil
	}

	token, err := client.getToken()
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("GET", fmt.Sprintf("https://%s/api/v2/organizations/%s/members", client.Domain, orgId), nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", token)

	resp, err := client.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("failed to get organization members: %s", body)
	}

	var users []models.User
	if err := json.NewDecoder(resp.Body).Decode(&users); err != nil {
		return nil, err
	}

	client.mu.Lock()
	client.orgCache[orgId] = cachedResult{Members: users, Time: time.Now()}
	client.mu.Unlock()

	return users, nil
}

func (client *Auth0Client) getToken() (string, error) {
	client.mu.Lock()
	defer client.mu.Unlock()

	if time.Now().Before(client.expiry) {
		return fmt.Sprintf("%s %s", "Bearer", client.accessToken), nil
	}

	fmt.Println("Getting new token")

	payload := map[string]string{
		"client_id":     client.M2MClientID,
		"client_secret": client.M2MClientSecret,
		"audience":      client.M2MAudience,
		"grant_type":    "client_credentials",
	}
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", fmt.Sprintf("https://%s/oauth/token", client.Domain), bytes.NewBuffer(payloadBytes))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.httpClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	if resp.StatusCode != 200 {
		return "", fmt.Errorf("failed to get token: %s", body)
	}

	var tokenResp tokenResponse
	if err := json.Unmarshal(body, &tokenResp); err != nil {
		return "", err
	}

	client.accessToken = tokenResp.AccessToken
	client.expiry = time.Now().Add(time.Duration(tokenResp.ExpiresIn) * time.Second)

	return fmt.Sprintf("%s %s", tokenResp.TokenType, client.accessToken), nil
}
