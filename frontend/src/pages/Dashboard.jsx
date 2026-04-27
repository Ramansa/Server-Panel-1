import { useEffect, useState } from 'react'
import {
  getDatabases,
  getDnsRecords,
  getDomains,
  getFiles,
  getFtpAccounts,
  getMailboxes,
  getServices
} from '../api/client'
import { Card } from '../components/Card'

export function Dashboard() {
  const [data, setData] = useState({
    domains: [],
    databases: [],
    mailboxes: [],
    ftpAccounts: [],
    dnsRecords: [],
    fileItems: [],
    services: []
  })

  useEffect(() => {
    Promise.all([
      getDomains(),
      getDatabases(),
      getMailboxes(),
      getFtpAccounts(),
      getDnsRecords(),
      getFiles(),
      getServices()
    ])
      .then(([domains, databases, mailboxes, ftpAccounts, dnsRecords, fileItems, services]) =>
        setData({ domains, databases, mailboxes, ftpAccounts, dnsRecords, fileItems, services })
      )
      .catch((error) => console.error(error))
  }, [])

  return (
    <main style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <h1>Server Panel (cPanel-style)</h1>
      <p>Domains, databases, mail, FTP, DNS, files, and core service visibility in one dashboard.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        <Card title="Domains">
          <ul>
            {data.domains.map((d) => (
              <li key={d.id}>{d.name} → {d.doc_root} ({d.php_version})</li>
            ))}
          </ul>
        </Card>

        <Card title="Databases">
          <ul>
            {data.databases.map((db) => (
              <li key={db.id}>{db.name} ({db.owner})</li>
            ))}
          </ul>
        </Card>

        <Card title="Mailboxes">
          <ul>
            {data.mailboxes.map((m) => (
              <li key={m.id}>{m.address} - {m.quota_mb}MB</li>
            ))}
          </ul>
        </Card>

        <Card title="FTP Accounts">
          <ul>
            {data.ftpAccounts.map((f) => (
              <li key={f.id}>{f.username} → {f.home_dir} ({f.quota_mb}MB)</li>
            ))}
          </ul>
        </Card>

        <Card title="DNS Records">
          <ul>
            {data.dnsRecords.map((r) => (
              <li key={r.id}>{r.type} {r.name} → {r.value} (TTL {r.ttl})</li>
            ))}
          </ul>
        </Card>

        <Card title="File Manager">
          <ul>
            {data.fileItems.map((f) => (
              <li key={f.id}>{f.kind}: {f.path} ({f.size_kb}KB)</li>
            ))}
          </ul>
        </Card>

        <Card title="Services">
          <ul>
            {data.services.map((s) => (
              <li key={s.name}>{s.name}: {s.enabled ? 'enabled' : 'disabled'}</li>
            ))}
          </ul>
        </Card>
      </div>
    </main>
  )
}
