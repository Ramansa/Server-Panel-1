package handlers

import (
	"encoding/json"
	"net/http"

	"serverpanel/backend/internal/db"
	"serverpanel/backend/internal/models"
)

type API struct {
	Store *db.Store
}

func New(store *db.Store) *API {
	return &API{Store: store}
}

func (a *API) Register(mux *http.ServeMux) {
	mux.HandleFunc("/healthz", a.health)
	mux.HandleFunc("/api/domains", a.domains)
	mux.HandleFunc("/api/databases", a.databases)
	mux.HandleFunc("/api/mailboxes", a.mailboxes)
	mux.HandleFunc("/api/ftp-accounts", a.ftpAccounts)
	mux.HandleFunc("/api/dns-records", a.dnsRecords)
	mux.HandleFunc("/api/files", a.files)
	mux.HandleFunc("/api/services", a.services)
}

func (a *API) health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (a *API) domains(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		items, err := a.Store.ListDomains(r.Context())
		if err != nil {
			writeError(w, http.StatusInternalServerError, err)
			return
		}
		writeJSON(w, http.StatusOK, items)
	case http.MethodPost:
		var input models.Domain
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			writeError(w, http.StatusBadRequest, err)
			return
		}
		if input.Status == "" {
			input.Status = "active"
		}
		created, err := a.Store.CreateDomain(r.Context(), input)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err)
			return
		}
		writeJSON(w, http.StatusCreated, created)
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func (a *API) databases(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	items, err := a.Store.ListDatabases(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	writeJSON(w, http.StatusOK, items)
}

func (a *API) mailboxes(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	items, err := a.Store.ListMailboxes(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	writeJSON(w, http.StatusOK, items)
}

func (a *API) ftpAccounts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	items, err := a.Store.ListFTPAccounts(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	writeJSON(w, http.StatusOK, items)
}

func (a *API) dnsRecords(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	items, err := a.Store.ListDNSRecords(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	writeJSON(w, http.StatusOK, items)
}

func (a *API) files(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	items, err := a.Store.ListFileItems(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	writeJSON(w, http.StatusOK, items)
}

func (a *API) services(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	writeJSON(w, http.StatusOK, []models.ServiceToggle{
		{Name: "nginx", Enabled: true},
		{Name: "php-fpm", Enabled: true},
		{Name: "vsftpd", Enabled: true},
		{Name: "named", Enabled: true},
		{Name: "postfix", Enabled: true},
		{Name: "dovecot", Enabled: true},
		{Name: "fail2ban", Enabled: true},
	})
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeError(w http.ResponseWriter, status int, err error) {
	writeJSON(w, status, map[string]string{"error": err.Error()})
}
