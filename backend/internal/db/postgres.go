package db

import (
	"context"
	"sync"

	"serverpanel/backend/internal/models"
)

type Store struct {
	mu        sync.RWMutex
	domains   []models.Domain
	databases []models.Database
	mailboxes []models.Mailbox
	nextID    int64
}

func Connect(_ string) (*Store, error) {
	return &Store{
		domains:   []models.Domain{{ID: 1, Name: "example.com", DocRoot: "/home/example/public_html", PHPVersion: "8.2", Status: "active"}},
		databases: []models.Database{{ID: 2, Name: "example_app", Owner: "example", Encoding: "UTF8"}},
		mailboxes: []models.Mailbox{{ID: 3, Address: "admin@example.com", QuotaMB: 2048}},
		nextID:    4,
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
