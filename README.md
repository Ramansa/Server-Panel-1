# Server Panel (cPanel-inspired)

A Linux-focused hosting control panel skeleton with:
- **Backend:** Go HTTP API
- **Frontend:** React + Vite
- **System layer:** Bash automation scripts
- **Database:** PostgreSQL

## Feature Surface (cPanel-like)
- Domain management inventory (`/api/domains`)
- Database inventory (`/api/databases`)
- Mailbox inventory (`/api/mailboxes`)
- FTP account inventory (`/api/ftp-accounts`)
- DNS records inventory (`/api/dns-records`)
- File manager inventory (`/api/files`)
- Service state summary (`/api/services`)

## Local development (Linux)

### 1) Bootstrap PostgreSQL schema
```bash
./scripts/setup.sh
```

### 2) Run backend
```bash
cd backend
go mod tidy
go run ./cmd/server
```

### 3) Run frontend
```bash
cd frontend
npm install
npm run dev
```

Or run both:
```bash
./scripts/dev.sh
```

## API Endpoints
- `GET /healthz`
- `GET /api/domains`
- `POST /api/domains`
- `GET /api/databases`
- `GET /api/mailboxes`
- `GET /api/ftp-accounts`
- `GET /api/dns-records`
- `GET /api/files`
- `GET /api/services`

## Notes
This implementation is a production-grade starting point, not a full drop-in replacement for every cPanel feature (DNS cluster, WHM multi-tenant, backup transport plugins, etc.). It gives a clean architecture to expand those modules incrementally.
