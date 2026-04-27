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
	ID       int64  `json:"id"`
	Username string `json:"username"`
	HomeDir  string `json:"home_dir"`
	QuotaMB  int    `json:"quota_mb"`
}

type DNSRecord struct {
	ID    int64  `json:"id"`
	Type  string `json:"type"`
	Name  string `json:"name"`
	Value string `json:"value"`
	TTL   int    `json:"ttl"`
}

type FileItem struct {
	ID       int64  `json:"id"`
	Path     string `json:"path"`
	Kind     string `json:"kind"`
	SizeKB   int    `json:"size_kb"`
	Modified string `json:"modified"`
}

type ServiceToggle struct {
	Name    string `json:"name"`
	Enabled bool   `json:"enabled"`
}
