package src

import (
	"fmt"
	"net/url"
	"os"
)

func GetHost() string {
	// prod="dump.link"
	// kitchen="kitchen.dump.link"
	env := os.Getenv("ENV")
	if env == "" {
		env = "0.0.0.0:8080"
	}

	return env
}

func GetUrl() *url.URL {
	scheme := "http"
	host := GetHost()

	fmt.Printf("host: %s\n", host)
	if os.Getenv("ENV") != "" {
		scheme = "https"
	}

	u := &url.URL{
		Scheme: scheme,
		Host:   host,
	}

	fmt.Printf("url: %+q\n", u)
	return u
}

func GetRedirectUrl() *url.URL {
	u := GetUrl()
	u.Path = "/callback"
	fmt.Printf("redirect: %+q\n", u)
	return u
}
