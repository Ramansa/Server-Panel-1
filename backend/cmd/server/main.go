package main

import (
	"crypto/tls"
	"errors"
	"log"
	"net/http"
	"time"

	"serverpanel/backend/internal/config"
	"serverpanel/backend/internal/db"
	"serverpanel/backend/internal/handlers"

	"golang.org/x/crypto/acme/autocert"
)

func main() {
	cfg := config.Load()

	store, err := db.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("database connection failed: %v", err)
	}
	defer store.Close()

	mux := http.NewServeMux()
	api := handlers.New(store)
	api.Register(mux)

	srv := &http.Server{
		Addr:         cfg.Addr(),
		Handler:      cors(mux),
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	if cfg.TLS.Enabled {
		if err := serveTLS(cfg, srv); err != nil {
			log.Fatal(err)
		}
		return
	}

	log.Printf("server panel backend listening on http://0.0.0.0%s", cfg.Addr())
	if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatal(err)
	}
}

func serveTLS(cfg config.Config, srv *http.Server) error {
	switch cfg.TLS.Mode {
	case "files":
		if cfg.TLS.CertFile == "" || cfg.TLS.KeyFile == "" {
			return errors.New("TLS_MODE=files requires TLS_CERT_FILE and TLS_KEY_FILE")
		}
		log.Printf("server panel backend listening on https://0.0.0.0%s (manual certificate files)", cfg.Addr())
		return srv.ListenAndServeTLS(cfg.TLS.CertFile, cfg.TLS.KeyFile)
	case "acme":
		if cfg.TLS.Domain == "" {
			return errors.New("TLS_MODE=acme requires TLS_DOMAIN")
		}

		manager := &autocert.Manager{
			Prompt:     autocert.AcceptTOS,
			HostPolicy: autocert.HostWhitelist(cfg.TLS.Domain),
			Email:      cfg.TLS.Email,
		}
		if cfg.TLS.CacheDir != "" {
			manager.Cache = autocert.DirCache(cfg.TLS.CacheDir)
		}

		srv.TLSConfig = &tls.Config{
			GetCertificate: manager.GetCertificate,
			MinVersion:     tls.VersionTLS12,
		}

		httpChallengeSrv := &http.Server{
			Addr:         ":" + cfg.TLS.HTTPPort,
			Handler:      manager.HTTPHandler(nil),
			ReadTimeout:  10 * time.Second,
			WriteTimeout: 10 * time.Second,
		}

		go func() {
			log.Printf("acme challenge server listening on http://0.0.0.0:%s", cfg.TLS.HTTPPort)
			if err := httpChallengeSrv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
				log.Fatalf("acme challenge server failed: %v", err)
			}
		}()

		log.Printf("server panel backend listening on https://%s%s (acme)", cfg.TLS.Domain, cfg.Addr())
		return srv.ListenAndServeTLS("", "")
	default:
		return errors.New("unsupported TLS_MODE, expected 'acme' or 'files'")
	}
}

func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
