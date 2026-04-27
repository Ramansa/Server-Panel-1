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

type ServiceToggle struct {
	Name    string `json:"name"`
	Enabled bool   `json:"enabled"`
}
