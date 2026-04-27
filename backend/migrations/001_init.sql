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

INSERT INTO domains(name, doc_root, php_version, status)
VALUES ('example.com', '/home/example/public_html', '8.2', 'active')
ON CONFLICT DO NOTHING;

INSERT INTO managed_databases(name, owner_name, encoding)
VALUES ('example_app', 'example', 'UTF8')
ON CONFLICT DO NOTHING;

INSERT INTO mailboxes(address, quota_mb, password_hash)
VALUES ('admin@example.com', 2048, 'seed')
ON CONFLICT DO NOTHING;
