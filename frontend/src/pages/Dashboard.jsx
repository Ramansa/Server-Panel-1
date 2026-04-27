import { useEffect, useState } from 'react'
import { getDatabases, getDomains, getMailboxes, getServices } from '../api/client'
import { Card } from '../components/Card'

export function Dashboard() {
  const [data, setData] = useState({ domains: [], databases: [], mailboxes: [], services: [] })

  useEffect(() => {
    Promise.all([getDomains(), getDatabases(), getMailboxes(), getServices()])
      .then(([domains, databases, mailboxes, services]) => setData({ domains, databases, mailboxes, services }))
      .catch((error) => console.error(error))
  }, [])

  return (
    <main style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <h1>Server Panel (cPanel-style)</h1>
      <p>Domain, database, mailbox, and service visibility from one dashboard.</p>
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
