package src

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/auth0/go-jwt-middleware/v2/jwks"
	"github.com/auth0/go-jwt-middleware/v2/validator"
)

type CustomClaimOrg struct {
	OrgId string `json:"org_id"`
}

func (c *CustomClaimOrg) Validate(ctx context.Context) error {
	if c.OrgId == "" {
		return errors.New("org_id is required")
	}
	return nil
}

func (app *application) getClaims(r *http.Request) (*validator.ValidatedClaims, *CustomClaimOrg, error) {
	tokenString := r.Header.Get("Authorization")
	if tokenString == "" {
		return nil, nil, fmt.Errorf("authorization header is missing")
	}

	tokenString = strings.TrimPrefix(tokenString, "Bearer ")

	token, err := app.jwtValidator.ValidateToken(context.Background(), tokenString)
	if err != nil {
		return nil, nil, err
	}

	claims, ok := token.(*validator.ValidatedClaims)

	if !ok {
		return nil, nil, fmt.Errorf("token does not contain validated claims")
	}

	customClaims, ok := claims.CustomClaims.(*CustomClaimOrg)
	if !ok {
		return nil, nil, fmt.Errorf("could not cast custom claims to specific type")
	}

	return claims, customClaims, nil
}

func setupJWTValidator() *validator.Validator {
	issuerURL, err := url.Parse("https://" + os.Getenv("AUTH0_DOMAIN") + "/")
	if err != nil {
		log.Fatalf("Failed to parse the issuer URL: %v", err)
	}
	provider := jwks.NewCachingProvider(issuerURL, 5*time.Minute)
	customClaims := func() validator.CustomClaims {
		return &CustomClaimOrg{}
	}
	jwtValidator, err := validator.New(
		provider.KeyFunc,
		validator.RS256,
		issuerURL.String(),
		[]string{os.Getenv("AUTH0_AUDIENCE")},
		validator.WithCustomClaims(customClaims),
	)
	if err != nil {
		log.Fatalf("Failed to set up the validator: %v", err)
	}
	return jwtValidator
}
