CREATE TABLE IF NOT EXISTS domains (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  doc_root TEXT NOT NULL,
  php_version TEXT NOT NULL DEFAULT '8.2',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS managed_databases (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  owner_name TEXT NOT NULL,
  encoding TEXT NOT NULL DEFAULT 'UTF8',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mailboxes (
  id BIGSERIAL PRIMARY KEY,
  address TEXT NOT NULL UNIQUE,
  quota_mb INT NOT NULL DEFAULT 1024,
  password_hash TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ftp_accounts (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  home_dir TEXT NOT NULL,
  quota_mb INT NOT NULL DEFAULT 1024,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dns_records (
  id BIGSERIAL PRIMARY KEY,
  record_type TEXT NOT NULL,
  record_name TEXT NOT NULL,
  record_value TEXT NOT NULL,
  ttl_seconds INT NOT NULL DEFAULT 3600,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS file_inventory (
  id BIGSERIAL PRIMARY KEY,
  file_path TEXT NOT NULL,
  kind TEXT NOT NULL,
  size_kb INT NOT NULL DEFAULT 0,
  modified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO domains(name, doc_root, php_version, status)
VALUES ('example.com', '/home/example/public_html', '8.2', 'active')
ON CONFLICT DO NOTHING;

INSERT INTO managed_databases(name, owner_name, encoding)
VALUES ('example_app', 'example', 'UTF8')
ON CONFLICT DO NOTHING;

INSERT INTO mailboxes(address, quota_mb, password_hash)
VALUES ('admin@example.com', 2048, 'seed')
ON CONFLICT DO NOTHING;

INSERT INTO ftp_accounts(username, home_dir, quota_mb)
VALUES ('exampleftp', '/home/example/public_html', 1024)
ON CONFLICT DO NOTHING;

INSERT INTO dns_records(record_type, record_name, record_value, ttl_seconds)
VALUES
  ('A', '@', '203.0.113.10', 3600),
  ('MX', '@', 'mail.example.com', 3600)
ON CONFLICT DO NOTHING;

INSERT INTO file_inventory(file_path, kind, size_kb, modified_at)
VALUES
  ('/home/example/public_html/index.php', 'file', 12, '2026-04-20T09:00:00Z'),
  ('/home/example/public_html/uploads', 'directory', 0, '2026-04-24T16:30:00Z')
ON CONFLICT DO NOTHING;
