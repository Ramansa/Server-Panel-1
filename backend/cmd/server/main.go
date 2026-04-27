package main

import (
	"log"
	"net/http"
	"time"

	"serverpanel/backend/internal/config"
	"serverpanel/backend/internal/db"
	"serverpanel/backend/internal/handlers"
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

	log.Printf("server panel backend listening on %s", cfg.Addr())
	if err := srv.ListenAndServe(); err != nil {
		log.Fatal(err)
	}
}

func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
