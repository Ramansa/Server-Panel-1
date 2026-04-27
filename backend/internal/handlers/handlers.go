package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/url"
	"strings"

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
	mux.HandleFunc("/api/ftp-accounts/item", a.ftpAccountItem)
	mux.HandleFunc("/api/ftp-accounts/password", a.ftpPassword)
	mux.HandleFunc("/api/dns-records", a.dnsRecords)
	mux.HandleFunc("/api/files", a.files)
	mux.HandleFunc("/api/files/item", a.fileItem)
	mux.HandleFunc("/api/files/download", a.downloadFileItem)
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
	switch r.Method {
	case http.MethodGet:
		items, err := a.Store.ListFTPAccounts(r.Context())
		if err != nil {
			writeError(w, http.StatusInternalServerError, err)
			return
		}
		writeJSON(w, http.StatusOK, items)
	case http.MethodPost:
		var input models.CreateFTPAccountInput
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			writeError(w, http.StatusBadRequest, err)
			return
		}
		created, err := a.Store.CreateFTPAccount(r.Context(), input)
		if err != nil {
			writeError(w, http.StatusBadRequest, err)
			return
		}
		writeJSON(w, http.StatusCreated, created)
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func ftpUsernameFromQuery(r *http.Request) (string, error) {
	rawUsername := strings.TrimSpace(r.URL.Query().Get("username"))
	if rawUsername == "" {
		return "", errors.New("missing query parameter: username")
	}
	decoded, err := url.QueryUnescape(rawUsername)
	if err != nil {
		return "", errors.New("invalid username")
	}
	return decoded, nil
}

func (a *API) ftpAccountItem(w http.ResponseWriter, r *http.Request) {
	username, err := ftpUsernameFromQuery(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}

	switch r.Method {
	case http.MethodPut:
		var input models.UpdateFTPAccountInput
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			writeError(w, http.StatusBadRequest, err)
			return
		}
		updated, err := a.Store.UpdateFTPAccount(r.Context(), username, input)
		if err != nil {
			writeError(w, http.StatusBadRequest, err)
			return
		}
		writeJSON(w, http.StatusOK, updated)
	case http.MethodDelete:
		if err := a.Store.DeleteFTPAccount(r.Context(), username); err != nil {
			writeError(w, http.StatusNotFound, err)
			return
		}
		writeJSON(w, http.StatusOK, map[string]string{"status": "deleted"})
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func (a *API) ftpPassword(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	username, err := ftpUsernameFromQuery(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}
	var input models.UpdateFTPPasswordInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}
	updated, err := a.Store.UpdateFTPPassword(r.Context(), username, input)
	if err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}
	writeJSON(w, http.StatusOK, updated)
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
	switch r.Method {
	case http.MethodGet:
		items, err := a.Store.ListFileItems(r.Context())
		if err != nil {
			writeError(w, http.StatusInternalServerError, err)
			return
		}
		writeJSON(w, http.StatusOK, items)
	case http.MethodPost:
		var input models.CreateFileItemInput
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			writeError(w, http.StatusBadRequest, err)
			return
		}
		created, err := a.Store.CreateFileItem(r.Context(), input)
		if err != nil {
			writeError(w, http.StatusBadRequest, err)
			return
		}
		writeJSON(w, http.StatusCreated, created)
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func filePathFromQuery(r *http.Request) (string, error) {
	rawPath := r.URL.Query().Get("path")
	if rawPath == "" {
		return "", errors.New("missing query parameter: path")
	}
	decoded, err := url.QueryUnescape(rawPath)
	if err != nil {
		return "", errors.New("invalid path")
	}
	return decoded, nil
}

func (a *API) fileItem(w http.ResponseWriter, r *http.Request) {
	itemPath, err := filePathFromQuery(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}

	switch r.Method {
	case http.MethodGet:
		item, err := a.Store.GetFileItem(r.Context(), itemPath)
		if err != nil {
			writeError(w, http.StatusNotFound, err)
			return
		}
		writeJSON(w, http.StatusOK, item)
	case http.MethodPut:
		var input models.UpdateFileItemInput
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			writeError(w, http.StatusBadRequest, err)
			return
		}
		updated, err := a.Store.UpdateFileItem(r.Context(), itemPath, input)
		if err != nil {
			writeError(w, http.StatusBadRequest, err)
			return
		}
		writeJSON(w, http.StatusOK, updated)
	case http.MethodDelete:
		if err := a.Store.DeleteFileItem(r.Context(), itemPath); err != nil {
			writeError(w, http.StatusNotFound, err)
			return
		}
		writeJSON(w, http.StatusOK, map[string]string{"status": "deleted"})
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func (a *API) downloadFileItem(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	itemPath, err := filePathFromQuery(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}
	item, err := a.Store.GetFileItem(r.Context(), itemPath)
	if err != nil {
		writeError(w, http.StatusNotFound, err)
		return
	}
	if item.Kind != "file" {
		writeError(w, http.StatusBadRequest, errors.New("only files can be downloaded"))
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{
		"path":    item.Path,
		"content": item.Content,
	})
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
