package config

import (
	"fmt"
	"os"
)

type Config struct {
	Port        string
	DatabaseURL string
}

func Load() Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		databaseURL = "postgres://postgres:postgres@localhost:5432/server_panel?sslmode=disable"
	}

	return Config{Port: port, DatabaseURL: databaseURL}
}

func (c Config) Addr() string {
	return fmt.Sprintf(":%s", c.Port)
}
