package db

import (
	"context"
	"errors"
	"path"
	"regexp"
	"strings"
	"sync"
	"time"

	"serverpanel/backend/internal/models"
)

type Store struct {
	mu             sync.RWMutex
	domains        []models.Domain
	databases      []models.Database
	mailboxes      []models.Mailbox
	ftpAccounts    []models.FTPAccount
	ftpCredentials map[string]string
	dnsRecords     []models.DNSRecord
	fileItems      []models.FileItem
	nextID         int64
}

func Connect(_ string) (*Store, error) {
	return &Store{
		domains:   []models.Domain{{ID: 1, Name: "example.com", DocRoot: "/home/example/public_html", PHPVersion: "8.2", Status: "active"}},
		databases: []models.Database{{ID: 2, Name: "example_app", Owner: "example", Encoding: "UTF8"}},
		mailboxes: []models.Mailbox{{ID: 3, Address: "admin@example.com", QuotaMB: 2048}},
		ftpAccounts: []models.FTPAccount{{
			ID:               4,
			Username:         "exampleftp",
			HomeDir:          "/home/example/public_html",
			QuotaMB:          1024,
			PasswordMasked:   true,
			Enabled:          true,
			LastPasswordSync: "2026-04-20T09:00:00Z",
		}},
		ftpCredentials: map[string]string{"exampleftp": "seed-password"},
		dnsRecords: []models.DNSRecord{
			{ID: 5, Type: "A", Name: "@", Value: "203.0.113.10", TTL: 3600},
			{ID: 6, Type: "MX", Name: "@", Value: "mail.example.com", TTL: 3600},
		},
		fileItems: []models.FileItem{
			{ID: 7, Path: "/home/example/public_html/index.php", Kind: "file", SizeKB: 12, Modified: "2026-04-20T09:00:00Z"},
			{ID: 8, Path: "/home/example/public_html/uploads", Kind: "directory", SizeKB: 0, Modified: "2026-04-24T16:30:00Z"},
		},
		nextID: 9,
	}, nil
}

func (s *Store) Close() error { return nil }

func (s *Store) ListDomains(_ context.Context) ([]models.Domain, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]models.Domain, len(s.domains))
	copy(out, s.domains)
	return out, nil
}

func (s *Store) CreateDomain(_ context.Context, input models.Domain) (models.Domain, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	input.ID = s.nextID
	s.nextID++
	s.domains = append(s.domains, input)
	return input, nil
}

func (s *Store) ListDatabases(_ context.Context) ([]models.Database, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]models.Database, len(s.databases))
	copy(out, s.databases)
	return out, nil
}

func (s *Store) ListMailboxes(_ context.Context) ([]models.Mailbox, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]models.Mailbox, len(s.mailboxes))
	copy(out, s.mailboxes)
	return out, nil
}

func normalizeFTPUsername(raw string) (string, error) {
	clean := strings.TrimSpace(strings.ToLower(raw))
	matched, _ := regexp.MatchString(`^[a-z0-9][a-z0-9._-]{2,31}$`, clean)
	if !matched {
		return "", errors.New("invalid username: use 3-32 chars [a-z0-9._-]")
	}
	return clean, nil
}

func normalizeHomeDir(raw string) (string, error) {
	clean := path.Clean(strings.TrimSpace(raw))
	if clean == "." || clean == "/" || clean == "" {
		return "", errors.New("invalid home_dir")
	}
	if !strings.HasPrefix(clean, "/home/") {
		return "", errors.New("home_dir must be under /home")
	}
	return clean, nil
}

func validateFTPPassword(password string) error {
	if len(strings.TrimSpace(password)) < 8 {
		return errors.New("password must be at least 8 characters")
	}
	return nil
}

func (s *Store) ListFTPAccounts(_ context.Context) ([]models.FTPAccount, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]models.FTPAccount, len(s.ftpAccounts))
	copy(out, s.ftpAccounts)
	return out, nil
}

func (s *Store) CreateFTPAccount(_ context.Context, input models.CreateFTPAccountInput) (models.FTPAccount, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	username, err := normalizeFTPUsername(input.Username)
	if err != nil {
		return models.FTPAccount{}, err
	}
	if err := validateFTPPassword(input.Password); err != nil {
		return models.FTPAccount{}, err
	}
	homeDir, err := normalizeHomeDir(input.HomeDir)
	if err != nil {
		return models.FTPAccount{}, err
	}
	if input.QuotaMB <= 0 {
		return models.FTPAccount{}, errors.New("quota_mb must be > 0")
	}
	for _, account := range s.ftpAccounts {
		if account.Username == username {
			return models.FTPAccount{}, errors.New("ftp username already exists")
		}
	}

	created := models.FTPAccount{
		ID:               s.nextID,
		Username:         username,
		HomeDir:          homeDir,
		QuotaMB:          input.QuotaMB,
		PasswordMasked:   true,
		Enabled:          true,
		LastPasswordSync: time.Now().UTC().Format(time.RFC3339),
	}
	s.nextID++
	s.ftpAccounts = append(s.ftpAccounts, created)
	s.ftpCredentials[username] = input.Password

	return created, nil
}

func (s *Store) UpdateFTPAccount(_ context.Context, username string, input models.UpdateFTPAccountInput) (models.FTPAccount, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	cleanUsername, err := normalizeFTPUsername(username)
	if err != nil {
		return models.FTPAccount{}, err
	}

	index := -1
	for i, account := range s.ftpAccounts {
		if account.Username == cleanUsername {
			index = i
			break
		}
	}
	if index == -1 {
		return models.FTPAccount{}, errors.New("ftp account not found")
	}

	account := s.ftpAccounts[index]
	if strings.TrimSpace(input.HomeDir) != "" {
		homeDir, err := normalizeHomeDir(input.HomeDir)
		if err != nil {
			return models.FTPAccount{}, err
		}
		account.HomeDir = homeDir
	}
	if input.QuotaMB != 0 {
		if input.QuotaMB < 0 {
			return models.FTPAccount{}, errors.New("quota_mb must be > 0")
		}
		account.QuotaMB = input.QuotaMB
	}
	if input.Enabled != nil {
		account.Enabled = *input.Enabled
	}

	s.ftpAccounts[index] = account
	return account, nil
}

func (s *Store) UpdateFTPPassword(_ context.Context, username string, input models.UpdateFTPPasswordInput) (models.FTPAccount, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	cleanUsername, err := normalizeFTPUsername(username)
	if err != nil {
		return models.FTPAccount{}, err
	}
	if err := validateFTPPassword(input.Password); err != nil {
		return models.FTPAccount{}, err
	}

	index := -1
	for i, account := range s.ftpAccounts {
		if account.Username == cleanUsername {
			index = i
			break
		}
	}
	if index == -1 {
		return models.FTPAccount{}, errors.New("ftp account not found")
	}

	s.ftpCredentials[cleanUsername] = input.Password
	account := s.ftpAccounts[index]
	account.LastPasswordSync = time.Now().UTC().Format(time.RFC3339)
	account.PasswordMasked = true
	s.ftpAccounts[index] = account
	return account, nil
}

func (s *Store) DeleteFTPAccount(_ context.Context, username string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	cleanUsername, err := normalizeFTPUsername(username)
	if err != nil {
		return err
	}

	for i, account := range s.ftpAccounts {
		if account.Username == cleanUsername {
			s.ftpAccounts = append(s.ftpAccounts[:i], s.ftpAccounts[i+1:]...)
			delete(s.ftpCredentials, cleanUsername)
			return nil
		}
	}

	return errors.New("ftp account not found")
}

func (s *Store) ListDNSRecords(_ context.Context) ([]models.DNSRecord, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]models.DNSRecord, len(s.dnsRecords))
	copy(out, s.dnsRecords)
	return out, nil
}

func (s *Store) ListFileItems(_ context.Context) ([]models.FileItem, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]models.FileItem, len(s.fileItems))
	for i, item := range s.fileItems {
		item.Content = ""
		out[i] = item
	}
	return out, nil
}

func normalizeFilePath(input string) (string, error) {
	clean := path.Clean(strings.TrimSpace(input))
	if clean == "." || clean == "/" || clean == "" {
		return "", errors.New("invalid path")
	}
	if !strings.HasPrefix(clean, "/") {
		clean = "/" + clean
	}
	return clean, nil
}

func (s *Store) CreateFileItem(_ context.Context, input models.CreateFileItemInput) (models.FileItem, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	cleanPath, err := normalizeFilePath(input.Path)
	if err != nil {
		return models.FileItem{}, err
	}
	kind := strings.ToLower(strings.TrimSpace(input.Kind))
	if kind != "file" && kind != "directory" {
		return models.FileItem{}, errors.New("kind must be file or directory")
	}
	for _, item := range s.fileItems {
		if item.Path == cleanPath {
			return models.FileItem{}, errors.New("path already exists")
		}
	}

	created := models.FileItem{
		ID:       s.nextID,
		Path:     cleanPath,
		Kind:     kind,
		SizeKB:   0,
		Modified: time.Now().UTC().Format(time.RFC3339),
		Content:  "",
	}
	if kind == "file" {
		created.Content = input.Content
		created.SizeKB = len(created.Content) / 1024
		if len(created.Content)%1024 > 0 {
			created.SizeKB++
		}
	}
	s.nextID++
	s.fileItems = append(s.fileItems, created)

	created.Content = ""
	return created, nil
}

func (s *Store) GetFileItem(_ context.Context, itemPath string) (models.FileItem, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	cleanPath, err := normalizeFilePath(itemPath)
	if err != nil {
		return models.FileItem{}, err
	}
	for _, item := range s.fileItems {
		if item.Path == cleanPath {
			return item, nil
		}
	}
	return models.FileItem{}, errors.New("file item not found")
}

func (s *Store) UpdateFileItem(_ context.Context, currentPath string, input models.UpdateFileItemInput) (models.FileItem, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	cleanCurrent, err := normalizeFilePath(currentPath)
	if err != nil {
		return models.FileItem{}, err
	}

	targetPath := cleanCurrent
	if strings.TrimSpace(input.Path) != "" {
		targetPath, err = normalizeFilePath(input.Path)
		if err != nil {
			return models.FileItem{}, err
		}
	}

	index := -1
	for i, item := range s.fileItems {
		if item.Path == cleanCurrent {
			index = i
			break
		}
	}
	if index == -1 {
		return models.FileItem{}, errors.New("file item not found")
	}

	if targetPath != cleanCurrent {
		for _, item := range s.fileItems {
			if item.Path == targetPath {
				return models.FileItem{}, errors.New("target path already exists")
			}
		}
	}

	item := s.fileItems[index]
	item.Path = targetPath
	if item.Kind == "file" && strings.TrimSpace(input.Content) != "" {
		item.Content = input.Content
		item.SizeKB = len(item.Content) / 1024
		if len(item.Content)%1024 > 0 {
			item.SizeKB++
		}
	}
	item.Modified = time.Now().UTC().Format(time.RFC3339)
	s.fileItems[index] = item

	item.Content = ""
	return item, nil
}

func (s *Store) DeleteFileItem(_ context.Context, itemPath string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	cleanPath, err := normalizeFilePath(itemPath)
	if err != nil {
		return err
	}

	for i, item := range s.fileItems {
		if item.Path == cleanPath {
			s.fileItems = append(s.fileItems[:i], s.fileItems[i+1:]...)
			return nil
		}
	}
	return errors.New("file item not found")
}
