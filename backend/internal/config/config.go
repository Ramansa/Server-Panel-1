package config

import (
	"fmt"
	"os"
	"strings"
)

type Config struct {
	Port        string
	DatabaseURL string
	TLS         TLSConfig
}

type TLSConfig struct {
	Mode     string
	Domain   string
	Email    string
	CacheDir string
	CertFile string
	KeyFile  string
	HTTPPort string
	Enabled  bool
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

	tlsMode := strings.ToLower(os.Getenv("TLS_MODE"))
	if tlsMode == "" {
		tlsMode = "acme"
	}

	tlsDomain := os.Getenv("TLS_DOMAIN")

	httpPort := os.Getenv("HTTP_PORT")
	if httpPort == "" {
		httpPort = "80"
	}

	tlsCfg := TLSConfig{
		Mode:     tlsMode,
		Domain:   tlsDomain,
		Email:    os.Getenv("TLS_ACME_EMAIL"),
		CacheDir: os.Getenv("TLS_ACME_CACHE_DIR"),
		CertFile: os.Getenv("TLS_CERT_FILE"),
		KeyFile:  os.Getenv("TLS_KEY_FILE"),
		HTTPPort: httpPort,
		Enabled:  tlsDomain != "" || (tlsMode == "files" && os.Getenv("TLS_CERT_FILE") != "" && os.Getenv("TLS_KEY_FILE") != ""),
	}

	return Config{Port: port, DatabaseURL: databaseURL, TLS: tlsCfg}
}

func (c Config) Addr() string {
	return fmt.Sprintf(":%s", c.Port)
}
