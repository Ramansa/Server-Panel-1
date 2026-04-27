package db

import (
	"context"
	"sync"

	"serverpanel/backend/internal/models"
)

type Store struct {
	mu          sync.RWMutex
	domains     []models.Domain
	databases   []models.Database
	mailboxes   []models.Mailbox
	ftpAccounts []models.FTPAccount
	dnsRecords  []models.DNSRecord
	fileItems   []models.FileItem
	nextID      int64
}

func Connect(_ string) (*Store, error) {
	return &Store{
		domains:     []models.Domain{{ID: 1, Name: "example.com", DocRoot: "/home/example/public_html", PHPVersion: "8.2", Status: "active"}},
		databases:   []models.Database{{ID: 2, Name: "example_app", Owner: "example", Encoding: "UTF8"}},
		mailboxes:   []models.Mailbox{{ID: 3, Address: "admin@example.com", QuotaMB: 2048}},
		ftpAccounts: []models.FTPAccount{{ID: 4, Username: "exampleftp", HomeDir: "/home/example/public_html", QuotaMB: 1024}},
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

func (s *Store) ListFTPAccounts(_ context.Context) ([]models.FTPAccount, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]models.FTPAccount, len(s.ftpAccounts))
	copy(out, s.ftpAccounts)
	return out, nil
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
	copy(out, s.fileItems)
	return out, nil
}
