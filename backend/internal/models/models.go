package models

type Domain struct {
	ID         int64  `json:"id"`
	Name       string `json:"name"`
	DocRoot    string `json:"doc_root"`
	PHPVersion string `json:"php_version"`
	Status     string `json:"status"`
}

type Database struct {
	ID       int64  `json:"id"`
	Name     string `json:"name"`
	Owner    string `json:"owner"`
	Encoding string `json:"encoding"`
}

type Mailbox struct {
	ID       int64  `json:"id"`
	Address  string `json:"address"`
	QuotaMB  int    `json:"quota_mb"`
	Password string `json:"password,omitempty"`
}

type FTPAccount struct {
	ID               int64  `json:"id"`
	Username         string `json:"username"`
	HomeDir          string `json:"home_dir"`
	QuotaMB          int    `json:"quota_mb"`
	PasswordMasked   bool   `json:"password_masked"`
	Enabled          bool   `json:"enabled"`
	LastPasswordSync string `json:"last_password_sync,omitempty"`
}

type CreateFTPAccountInput struct {
	Username string `json:"username"`
	Password string `json:"password"`
	HomeDir  string `json:"home_dir"`
	QuotaMB  int    `json:"quota_mb"`
}

type UpdateFTPAccountInput struct {
	HomeDir string `json:"home_dir"`
	QuotaMB int    `json:"quota_mb"`
	Enabled *bool  `json:"enabled,omitempty"`
}

type UpdateFTPPasswordInput struct {
	Password string `json:"password"`
}

type DNSRecord struct {
	ID       int64  `json:"id"`
	Zone     string `json:"zone"`
	Type     string `json:"type"`
	Name     string `json:"name"`
	Value    string `json:"value"`
	TTL      int    `json:"ttl"`
	Priority *int   `json:"priority,omitempty"`
}

type CreateDNSRecordInput struct {
	Zone     string `json:"zone"`
	Type     string `json:"type"`
	Name     string `json:"name"`
	Value    string `json:"value"`
	TTL      int    `json:"ttl"`
	Priority *int   `json:"priority,omitempty"`
}

type UpdateDNSRecordInput struct {
	Zone     string `json:"zone,omitempty"`
	Type     string `json:"type,omitempty"`
	Name     string `json:"name,omitempty"`
	Value    string `json:"value,omitempty"`
	TTL      int    `json:"ttl,omitempty"`
	Priority *int   `json:"priority"`
}

type FileItem struct {
	ID       int64  `json:"id"`
	Path     string `json:"path"`
	Kind     string `json:"kind"`
	SizeKB   int    `json:"size_kb"`
	Modified string `json:"modified"`
	Content  string `json:"content,omitempty"`
}

type CreateFileItemInput struct {
	Path    string `json:"path"`
	Kind    string `json:"kind"`
	Content string `json:"content,omitempty"`
}

type UpdateFileItemInput struct {
	Path    string `json:"path"`
	Content string `json:"content,omitempty"`
}

type ServiceToggle struct {
	Name    string `json:"name"`
	Enabled bool   `json:"enabled"`
}
