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
- FTP account lifecycle management (create/list/update/disable/delete/password reset)
- DNS zone editor (list/create/update/delete records + zonefile rendering)
- File manager (list/create/read/update/delete/download)
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

### Backend TLS / SSL
The API can run over HTTPS with either ACME (Let's Encrypt) or certificate files.

#### ACME mode (default TLS provider)
Set at least `TLS_DOMAIN` and keep `TLS_MODE` unset (defaults to `acme`):

```bash
export TLS_DOMAIN=api.example.com
export TLS_ACME_EMAIL=admin@example.com            # optional but recommended
export TLS_ACME_CACHE_DIR=/var/lib/server-panel/acme-cache  # optional
export HTTP_PORT=80                                # optional, defaults to 80
cd backend
go run ./cmd/server
```

#### Certificate file mode
```bash
export TLS_MODE=files
export TLS_CERT_FILE=/etc/letsencrypt/live/api.example.com/fullchain.pem
export TLS_KEY_FILE=/etc/letsencrypt/live/api.example.com/privkey.pem
cd backend
go run ./cmd/server
```

If no TLS environment variables are set, the backend continues to run on plain HTTP as before.

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
- `PUT /api/domains/item?name=<domain>`
- `DELETE /api/domains/item?name=<domain>`
- `GET /api/databases`
- `POST /api/databases`
- `PUT /api/databases/item?name=<database>`
- `DELETE /api/databases/item?name=<database>`
- `GET /api/mailboxes`
- `POST /api/mailboxes`
- `PUT /api/mailboxes/item?address=<email>`
- `DELETE /api/mailboxes/item?address=<email>`
- `PUT /api/mailboxes/password?address=<email>`
- `GET /api/ftp-accounts`
- `POST /api/ftp-accounts`
- `PUT /api/ftp-accounts/item?username=<ftp-user>`
- `DELETE /api/ftp-accounts/item?username=<ftp-user>`
- `PUT /api/ftp-accounts/password?username=<ftp-user>`
- `GET /api/dns-records`
- `POST /api/dns-records`
- `PUT /api/dns-records/item?id=<dns-id>`
- `DELETE /api/dns-records/item?id=<dns-id>`
- `GET /api/dns-records/zonefile?zone=<domain>`
- `GET /api/files`
- `POST /api/files`
- `GET /api/files/item?path=<absolute-path>`
- `PUT /api/files/item?path=<absolute-path>`
- `DELETE /api/files/item?path=<absolute-path>`
- `GET /api/files/download?path=<absolute-path>`
- `GET /api/services`

## Notes
This implementation is a production-grade starting point, not a full drop-in replacement for every cPanel feature (DNS cluster, WHM multi-tenant, backup transport plugins, etc.). It gives a clean architecture to expand those modules incrementally.
