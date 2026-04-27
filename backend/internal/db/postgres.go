package db

import (
	"context"
	"errors"
	"fmt"
	"path"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	"serverpanel/backend/internal/models"
)

type Store struct {
	mu              sync.RWMutex
	domains         []models.Domain
	databases       []models.Database
	mailboxes       []models.Mailbox
	mailCredentials map[string]string
	ftpAccounts     []models.FTPAccount
	ftpCredentials  map[string]string
	dnsRecords      []models.DNSRecord
	fileItems       []models.FileItem
	nextID          int64
}

func Connect(_ string) (*Store, error) {
	return &Store{
		domains:   []models.Domain{{ID: 1, Name: "example.com", DocRoot: "/home/example/public_html", PHPVersion: "8.2", Status: "active"}},
		databases: []models.Database{{ID: 2, Name: "example_app", Owner: "example", Encoding: "UTF8"}},
		mailboxes: []models.Mailbox{{
			ID:               3,
			Address:          "admin@example.com",
			QuotaMB:          2048,
			PasswordMasked:   true,
			Enabled:          true,
			LastPasswordSync: "2026-04-20T09:00:00Z",
		}},
		mailCredentials: map[string]string{"admin@example.com": "seed-password"},
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
			{ID: 5, Zone: "example.com", Type: "A", Name: "@", Value: "203.0.113.10", TTL: 3600},
			{ID: 6, Zone: "example.com", Type: "MX", Name: "@", Value: "mail.example.com", TTL: 3600, Priority: ptrInt(10)},
		},
		fileItems: []models.FileItem{
			{ID: 7, Path: "/home/example/public_html/index.php", Kind: "file", SizeKB: 12, Modified: "2026-04-20T09:00:00Z"},
			{ID: 8, Path: "/home/example/public_html/uploads", Kind: "directory", SizeKB: 0, Modified: "2026-04-24T16:30:00Z"},
		},
		nextID: 9,
	}, nil
}

func ptrInt(v int) *int { return &v }

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
	for _, domain := range s.domains {
		if strings.EqualFold(domain.Name, input.Name) {
			return models.Domain{}, errors.New("domain already exists")
		}
	}
	input.ID = s.nextID
	s.nextID++
	s.domains = append(s.domains, input)
	return input, nil
}

func (s *Store) UpdateDomain(_ context.Context, name string, input models.UpdateDomainInput) (models.Domain, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	cleanName := strings.ToLower(strings.TrimSpace(name))
	if cleanName == "" {
		return models.Domain{}, errors.New("domain name is required")
	}
	for i, domain := range s.domains {
		if domain.Name != cleanName {
			continue
		}
		if strings.TrimSpace(input.DocRoot) != "" {
			domain.DocRoot = strings.TrimSpace(input.DocRoot)
		}
		if strings.TrimSpace(input.PHPVersion) != "" {
			domain.PHPVersion = strings.TrimSpace(input.PHPVersion)
		}
		if strings.TrimSpace(input.Status) != "" {
			domain.Status = strings.TrimSpace(strings.ToLower(input.Status))
		}
		s.domains[i] = domain
		return domain, nil
	}
	return models.Domain{}, errors.New("domain not found")
}

func (s *Store) DeleteDomain(_ context.Context, name string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	cleanName := strings.ToLower(strings.TrimSpace(name))
	if cleanName == "" {
		return errors.New("domain name is required")
	}
	for i, domain := range s.domains {
		if domain.Name == cleanName {
			s.domains = append(s.domains[:i], s.domains[i+1:]...)
			return nil
		}
	}
	return errors.New("domain not found")
}

func (s *Store) ListDatabases(_ context.Context) ([]models.Database, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]models.Database, len(s.databases))
	copy(out, s.databases)
	return out, nil
}

func (s *Store) CreateDatabase(_ context.Context, input models.CreateDatabaseInput) (models.Database, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	name := strings.ToLower(strings.TrimSpace(input.Name))
	owner := strings.ToLower(strings.TrimSpace(input.Owner))
	if name == "" || owner == "" {
		return models.Database{}, errors.New("name and owner are required")
	}
	encoding := strings.ToUpper(strings.TrimSpace(input.Encoding))
	if encoding == "" {
		encoding = "UTF8"
	}
	for _, database := range s.databases {
		if database.Name == name {
			return models.Database{}, errors.New("database already exists")
		}
	}
	created := models.Database{
		ID:       s.nextID,
		Name:     name,
		Owner:    owner,
		Encoding: encoding,
	}
	s.nextID++
	s.databases = append(s.databases, created)
	return created, nil
}

func (s *Store) UpdateDatabase(_ context.Context, name string, input models.UpdateDatabaseInput) (models.Database, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	cleanName := strings.ToLower(strings.TrimSpace(name))
	if cleanName == "" {
		return models.Database{}, errors.New("database name is required")
	}
	for i, database := range s.databases {
		if database.Name != cleanName {
			continue
		}
		if strings.TrimSpace(input.Owner) != "" {
			database.Owner = strings.ToLower(strings.TrimSpace(input.Owner))
		}
		if strings.TrimSpace(input.Encoding) != "" {
			database.Encoding = strings.ToUpper(strings.TrimSpace(input.Encoding))
		}
		s.databases[i] = database
		return database, nil
	}
	return models.Database{}, errors.New("database not found")
}

func (s *Store) DeleteDatabase(_ context.Context, name string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	cleanName := strings.ToLower(strings.TrimSpace(name))
	if cleanName == "" {
		return errors.New("database name is required")
	}
	for i, database := range s.databases {
		if database.Name == cleanName {
			s.databases = append(s.databases[:i], s.databases[i+1:]...)
			return nil
		}
	}
	return errors.New("database not found")
}

func (s *Store) ListMailboxes(_ context.Context) ([]models.Mailbox, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]models.Mailbox, len(s.mailboxes))
	copy(out, s.mailboxes)
	return out, nil
}

func normalizeEmailAddress(raw string) (string, error) {
	clean := strings.TrimSpace(strings.ToLower(raw))
	matched, _ := regexp.MatchString(`^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$`, clean)
	if !matched {
		return "", errors.New("invalid email address")
	}
	return clean, nil
}

func (s *Store) CreateMailbox(_ context.Context, input models.CreateMailboxInput) (models.Mailbox, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	address, err := normalizeEmailAddress(input.Address)
	if err != nil {
		return models.Mailbox{}, err
	}
	if err := validateFTPPassword(input.Password); err != nil {
		return models.Mailbox{}, err
	}
	if input.QuotaMB <= 0 {
		return models.Mailbox{}, errors.New("quota_mb must be > 0")
	}
	for _, mailbox := range s.mailboxes {
		if mailbox.Address == address {
			return models.Mailbox{}, errors.New("mailbox already exists")
		}
	}

	created := models.Mailbox{
		ID:               s.nextID,
		Address:          address,
		QuotaMB:          input.QuotaMB,
		PasswordMasked:   true,
		Enabled:          true,
		LastPasswordSync: time.Now().UTC().Format(time.RFC3339),
	}
	s.nextID++
	s.mailboxes = append(s.mailboxes, created)
	s.mailCredentials[address] = input.Password
	return created, nil
}

func (s *Store) UpdateMailbox(_ context.Context, address string, input models.UpdateMailboxInput) (models.Mailbox, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	cleanAddress, err := normalizeEmailAddress(address)
	if err != nil {
		return models.Mailbox{}, err
	}

	index := -1
	for i, mailbox := range s.mailboxes {
		if mailbox.Address == cleanAddress {
			index = i
			break
		}
	}
	if index == -1 {
		return models.Mailbox{}, errors.New("mailbox not found")
	}

	mailbox := s.mailboxes[index]
	if input.QuotaMB != 0 {
		if input.QuotaMB < 0 {
			return models.Mailbox{}, errors.New("quota_mb must be > 0")
		}
		mailbox.QuotaMB = input.QuotaMB
	}
	if input.Enabled != nil {
		mailbox.Enabled = *input.Enabled
	}
	s.mailboxes[index] = mailbox
	return mailbox, nil
}

func (s *Store) UpdateMailboxPassword(_ context.Context, address string, input models.UpdateMailboxPasswordInput) (models.Mailbox, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	cleanAddress, err := normalizeEmailAddress(address)
	if err != nil {
		return models.Mailbox{}, err
	}
	if err := validateFTPPassword(input.Password); err != nil {
		return models.Mailbox{}, err
	}

	index := -1
	for i, mailbox := range s.mailboxes {
		if mailbox.Address == cleanAddress {
			index = i
			break
		}
	}
	if index == -1 {
		return models.Mailbox{}, errors.New("mailbox not found")
	}

	s.mailCredentials[cleanAddress] = input.Password
	mailbox := s.mailboxes[index]
	mailbox.PasswordMasked = true
	mailbox.LastPasswordSync = time.Now().UTC().Format(time.RFC3339)
	s.mailboxes[index] = mailbox
	return mailbox, nil
}

func (s *Store) DeleteMailbox(_ context.Context, address string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	cleanAddress, err := normalizeEmailAddress(address)
	if err != nil {
		return err
	}

	for i, mailbox := range s.mailboxes {
		if mailbox.Address == cleanAddress {
			s.mailboxes = append(s.mailboxes[:i], s.mailboxes[i+1:]...)
			delete(s.mailCredentials, cleanAddress)
			return nil
		}
	}
	return errors.New("mailbox not found")
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

func normalizeZone(zone string) (string, error) {
	clean := strings.Trim(strings.ToLower(strings.TrimSpace(zone)), ".")
	matched, _ := regexp.MatchString(`^[a-z0-9][a-z0-9.-]{1,251}[a-z0-9]$`, clean)
	if !matched || !strings.Contains(clean, ".") {
		return "", errors.New("invalid zone")
	}
	return clean, nil
}

func normalizeDNSName(name string) (string, error) {
	clean := strings.TrimSpace(strings.ToLower(name))
	if clean == "" {
		return "", errors.New("record name is required")
	}
	if clean == "@" {
		return clean, nil
	}
	if strings.HasSuffix(clean, ".") {
		clean = strings.TrimSuffix(clean, ".")
	}
	matched, _ := regexp.MatchString(`^[a-z0-9*][a-z0-9*._-]{0,251}$`, clean)
	if !matched {
		return "", errors.New("invalid record name")
	}
	return clean, nil
}

func normalizeDNSType(recordType string) (string, error) {
	kind := strings.ToUpper(strings.TrimSpace(recordType))
	switch kind {
	case "A", "AAAA", "CNAME", "MX", "TXT", "NS", "SRV", "CAA":
		return kind, nil
	default:
		return "", errors.New("unsupported DNS type")
	}
}

func normalizeTTL(ttl int) (int, error) {
	if ttl == 0 {
		return 3600, nil
	}
	if ttl < 60 || ttl > 604800 {
		return 0, errors.New("ttl must be between 60 and 604800")
	}
	return ttl, nil
}

func normalizePriority(recordType string, priority *int) (*int, error) {
	if recordType != "MX" && recordType != "SRV" {
		return nil, nil
	}
	if priority == nil {
		return ptrInt(10), nil
	}
	if *priority < 0 || *priority > 65535 {
		return nil, errors.New("priority must be between 0 and 65535")
	}
	return priority, nil
}

func normalizeDNSValue(value string) (string, error) {
	clean := strings.TrimSpace(value)
	if clean == "" {
		return "", errors.New("record value is required")
	}
	return clean, nil
}

func (s *Store) CreateDNSRecord(_ context.Context, input models.CreateDNSRecordInput) (models.DNSRecord, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	zone, err := normalizeZone(input.Zone)
	if err != nil {
		return models.DNSRecord{}, err
	}
	recordType, err := normalizeDNSType(input.Type)
	if err != nil {
		return models.DNSRecord{}, err
	}
	name, err := normalizeDNSName(input.Name)
	if err != nil {
		return models.DNSRecord{}, err
	}
	value, err := normalizeDNSValue(input.Value)
	if err != nil {
		return models.DNSRecord{}, err
	}
	ttl, err := normalizeTTL(input.TTL)
	if err != nil {
		return models.DNSRecord{}, err
	}
	priority, err := normalizePriority(recordType, input.Priority)
	if err != nil {
		return models.DNSRecord{}, err
	}

	for _, existing := range s.dnsRecords {
		if existing.Zone == zone && existing.Type == recordType && existing.Name == name && existing.Value == value {
			return models.DNSRecord{}, errors.New("dns record already exists")
		}
	}

	created := models.DNSRecord{
		ID:       s.nextID,
		Zone:     zone,
		Type:     recordType,
		Name:     name,
		Value:    value,
		TTL:      ttl,
		Priority: priority,
	}
	s.nextID++
	s.dnsRecords = append(s.dnsRecords, created)
	return created, nil
}

func (s *Store) UpdateDNSRecord(_ context.Context, id int64, input models.UpdateDNSRecordInput) (models.DNSRecord, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	index := -1
	for i, record := range s.dnsRecords {
		if record.ID == id {
			index = i
			break
		}
	}
	if index == -1 {
		return models.DNSRecord{}, errors.New("dns record not found")
	}

	updated := s.dnsRecords[index]
	if strings.TrimSpace(input.Zone) != "" {
		zone, err := normalizeZone(input.Zone)
		if err != nil {
			return models.DNSRecord{}, err
		}
		updated.Zone = zone
	}
	if strings.TrimSpace(input.Type) != "" {
		recordType, err := normalizeDNSType(input.Type)
		if err != nil {
			return models.DNSRecord{}, err
		}
		updated.Type = recordType
	}
	if strings.TrimSpace(input.Name) != "" {
		name, err := normalizeDNSName(input.Name)
		if err != nil {
			return models.DNSRecord{}, err
		}
		updated.Name = name
	}
	if strings.TrimSpace(input.Value) != "" {
		value, err := normalizeDNSValue(input.Value)
		if err != nil {
			return models.DNSRecord{}, err
		}
		updated.Value = value
	}
	if input.TTL != 0 {
		ttl, err := normalizeTTL(input.TTL)
		if err != nil {
			return models.DNSRecord{}, err
		}
		updated.TTL = ttl
	}
	priority, err := normalizePriority(updated.Type, input.Priority)
	if err != nil {
		return models.DNSRecord{}, err
	}
	updated.Priority = priority

	s.dnsRecords[index] = updated
	return updated, nil
}

func (s *Store) DeleteDNSRecord(_ context.Context, id int64) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	for i, record := range s.dnsRecords {
		if record.ID == id {
			s.dnsRecords = append(s.dnsRecords[:i], s.dnsRecords[i+1:]...)
			return nil
		}
	}
	return errors.New("dns record not found")
}

func (s *Store) RenderZoneFile(_ context.Context, zone string) (string, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	cleanZone, err := normalizeZone(zone)
	if err != nil {
		return "", err
	}

	var zoneRecords []models.DNSRecord
	for _, record := range s.dnsRecords {
		if record.Zone == cleanZone {
			zoneRecords = append(zoneRecords, record)
		}
	}
	if len(zoneRecords) == 0 {
		return "", errors.New("zone has no records")
	}

	sort.Slice(zoneRecords, func(i, j int) bool {
		if zoneRecords[i].Name == zoneRecords[j].Name {
			return zoneRecords[i].Type < zoneRecords[j].Type
		}
		return zoneRecords[i].Name < zoneRecords[j].Name
	})

	now := time.Now().UTC().Format("2006010201")
	var builder strings.Builder
	builder.WriteString(fmt.Sprintf("$TTL 3600\n@ IN SOA ns1.%s. hostmaster.%s. (\n", cleanZone, cleanZone))
	builder.WriteString(fmt.Sprintf("    %s ; serial\n", now))
	builder.WriteString("    3600 ; refresh\n    900 ; retry\n    1209600 ; expire\n    300 ; minimum\n)\n")

	for _, record := range zoneRecords {
		name := record.Name
		if name == "@" {
			name = "@"
		}
		line := fmt.Sprintf("%s %d IN %s ", name, record.TTL, record.Type)
		if record.Priority != nil && (record.Type == "MX" || record.Type == "SRV") {
			line += strconv.Itoa(*record.Priority) + " "
		}
		line += record.Value
		builder.WriteString(line + "\n")
	}

	return builder.String(), nil
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
