import { useEffect, useState } from 'react'
import {
  createMailbox,
  createDnsRecord,
  createFileItem,
  createFtpAccount,
  deleteMailbox,
  deleteDnsRecord,
  deleteFileItem,
  deleteFtpAccount,
  downloadFile,
  getDatabases,
  getDnsRecords,
  getDnsZoneFile,
  getDomains,
  getFileItem,
  getFiles,
  getFtpAccounts,
  getMailboxes,
  getServices,
  updateMailbox,
  updateMailboxPassword,
  updateFileItem,
  updateFtpAccount, updateFtpPassword
} from '../api/client'
import { Card } from '../components/Card'

const CPANEL_FEATURE_GROUPS = [
  {
    title: 'Domains',
    features: [
      'Domains',
      'Subdomains',
      'Aliases',
      'Redirects',
      'Zone Editor',
      'Dynamic DNS'
    ]
  },
  {
    title: 'Email',
    features: [
      'Email Accounts',
      'Forwarders',
      'Autoresponders',
      'Email Routing',
      'Global Email Filters',
      'Track Delivery',
      'Spam Filters'
    ]
  },
  {
    title: 'Files',
    features: [
      'File Manager',
      'Disk Usage',
      'Directory Privacy',
      'FTP Accounts',
      'Git Version Control',
      'Backup Wizard'
    ]
  },
  {
    title: 'Databases',
    features: [
      'MySQL Databases',
      'phpMyAdmin',
      'Remote MySQL',
      'PostgreSQL Databases'
    ]
  },
  {
    title: 'Software',
    features: [
      'MultiPHP Manager',
      'MultiPHP INI Editor',
      'Application Manager',
      'Optimize Website',
      'Select PHP Version'
    ]
  },
  {
    title: 'Security',
    features: [
      'SSL/TLS Status',
      'IP Blocker',
      'Hotlink Protection',
      'Two-Factor Authentication',
      'SSH Access',
      'ModSecurity'
    ]
  },
  {
    title: 'Advanced',
    features: [
      'Cron Jobs',
      'Indexes',
      'MIME Types',
      'Error Pages',
      'API Tokens',
      'Terminal'
    ]
  },
  {
    title: 'Metrics',
    features: [
      'AWStats',
      'Visitors',
      'Bandwidth',
      'Errors',
      'Resource Usage'
    ]
  },
  {
    title: 'Preferences',
    features: [
      'Password & Security',
      'User Manager',
      'Contact Information',
      'Locale',
      'Change Style'
    ]
  }
]

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
  const [fileForm, setFileForm] = useState({ path: '', kind: 'file', content: '' })
  const [selectedFilePath, setSelectedFilePath] = useState('')
  const [editorContent, setEditorContent] = useState('')
  const [renamePath, setRenamePath] = useState('')
  const [fileStatus, setFileStatus] = useState('')
  const [ftpForm, setFtpForm] = useState({ username: '', password: '', home_dir: '/home/', quota_mb: 1024 })
  const [mailboxForm, setMailboxForm] = useState({ address: '', password: '', quota_mb: 1024 })
  const [mailboxPasswordForm, setMailboxPasswordForm] = useState({ address: '', password: '' })
  const [mailStatus, setMailStatus] = useState('')
  const [ftpPasswordForm, setFtpPasswordForm] = useState({ username: '', password: '' })
  const [ftpStatus, setFtpStatus] = useState('')
  const [dnsFilterZone, setDnsFilterZone] = useState('')
  const [dnsForm, setDnsForm] = useState({ zone: 'example.com', type: 'A', name: '@', value: '', ttl: 3600, priority: 10 })
  const [dnsStatus, setDnsStatus] = useState('')
  const [zonefileOutput, setZonefileOutput] = useState('')

  const loadAll = () =>
    Promise.all([
      getDomains(),
      getDatabases(),
      getMailboxes(),
      getFtpAccounts(),
      getDnsRecords(),
      getFiles(),
      getServices()
    ]).then(([domains, databases, mailboxes, ftpAccounts, dnsRecords, fileItems, services]) =>
      setData({ domains, databases, mailboxes, ftpAccounts, dnsRecords, fileItems, services })
    )

  useEffect(() => {
    loadAll().catch((error) => console.error(error))
  }, [])

  const refreshFiles = () =>
    getFiles()
      .then((fileItems) => setData((prev) => ({ ...prev, fileItems })))
      .catch((error) => setFileStatus(error.message))

  const refreshFtp = () =>
    getFtpAccounts()
      .then((ftpAccounts) => setData((prev) => ({ ...prev, ftpAccounts })))
      .catch((error) => setFtpStatus(error.message))

  const refreshMailboxes = () =>
    getMailboxes()
      .then((mailboxes) => setData((prev) => ({ ...prev, mailboxes })))
      .catch((error) => setMailStatus(error.message))

  const refreshDns = () =>
    getDnsRecords(dnsFilterZone)
      .then((dnsRecords) => setData((prev) => ({ ...prev, dnsRecords })))
      .catch((error) => setDnsStatus(error.message))

  const submitNewItem = (event) => {
    event.preventDefault()
    setFileStatus('Saving...')
    createFileItem(fileForm)
      .then(() => {
        setFileStatus('Created.')
        setFileForm({ path: '', kind: 'file', content: '' })
        return refreshFiles()
      })
      .catch((error) => setFileStatus(error.message))
  }

  const openFile = (filePath) => {
    setFileStatus('Loading...')
    getFileItem(filePath)
      .then((item) => {
        setSelectedFilePath(item.path)
        setRenamePath(item.path)
        setEditorContent(item.content || '')
        setFileStatus(`Loaded ${item.path}`)
      })
      .catch((error) => setFileStatus(error.message))
  }

  const saveFile = () => {
    if (!selectedFilePath) return
    setFileStatus('Saving...')
    updateFileItem(selectedFilePath, { content: editorContent })
      .then((updated) => {
        setSelectedFilePath(updated.path)
        setRenamePath(updated.path)
        setFileStatus('Saved.')
        return refreshFiles()
      })
      .catch((error) => setFileStatus(error.message))
  }

  const renameItem = () => {
    if (!selectedFilePath || !renamePath) return
    setFileStatus('Renaming...')
    updateFileItem(selectedFilePath, { path: renamePath })
      .then((updated) => {
        setSelectedFilePath(updated.path)
        setRenamePath(updated.path)
        setFileStatus('Renamed.')
        return refreshFiles()
      })
      .catch((error) => setFileStatus(error.message))
  }

  const removeItem = (filePath) => {
    setFileStatus('Deleting...')
    deleteFileItem(filePath)
      .then(() => {
        if (selectedFilePath === filePath) {
          setSelectedFilePath('')
          setEditorContent('')
          setRenamePath('')
        }
        setFileStatus('Deleted.')
        return refreshFiles()
      })
      .catch((error) => setFileStatus(error.message))
  }

  const submitFtpAccount = (event) => {
    event.preventDefault()
    setFtpStatus('Creating FTP account...')
    createFtpAccount({ ...ftpForm, quota_mb: Number(ftpForm.quota_mb) })
      .then(() => {
        setFtpStatus('FTP account created.')
        setFtpForm({ username: '', password: '', home_dir: '/home/', quota_mb: 1024 })
        return refreshFtp()
      })
      .catch((error) => setFtpStatus(error.message))
  }

  const submitMailbox = (event) => {
    event.preventDefault()
    setMailStatus('Creating mailbox...')
    createMailbox({ ...mailboxForm, quota_mb: Number(mailboxForm.quota_mb) })
      .then(() => {
        setMailStatus('Mailbox created.')
        setMailboxForm({ address: '', password: '', quota_mb: 1024 })
        return refreshMailboxes()
      })
      .catch((error) => setMailStatus(error.message))
  }

  const toggleMailboxEnabled = (mailbox) => {
    setMailStatus(`Updating ${mailbox.address}...`)
    updateMailbox(mailbox.address, { enabled: !mailbox.enabled })
      .then(() => {
        setMailStatus('Mailbox updated.')
        return refreshMailboxes()
      })
      .catch((error) => setMailStatus(error.message))
  }

  const removeMailbox = (address) => {
    setMailStatus(`Deleting ${address}...`)
    deleteMailbox(address)
      .then(() => {
        setMailStatus('Mailbox deleted.')
        return refreshMailboxes()
      })
      .catch((error) => setMailStatus(error.message))
  }

  const submitMailboxPassword = (event) => {
    event.preventDefault()
    if (!mailboxPasswordForm.address) return
    setMailStatus(`Rotating password for ${mailboxPasswordForm.address}...`)
    updateMailboxPassword(mailboxPasswordForm.address, { password: mailboxPasswordForm.password })
      .then(() => {
        setMailStatus('Mailbox password rotated.')
        setMailboxPasswordForm({ address: '', password: '' })
        return refreshMailboxes()
      })
      .catch((error) => setMailStatus(error.message))
  }

  const toggleFtpEnabled = (account) => {
    setFtpStatus(`Updating ${account.username}...`)
    updateFtpAccount(account.username, { enabled: !account.enabled })
      .then(() => {
        setFtpStatus('FTP account updated.')
        return refreshFtp()
      })
      .catch((error) => setFtpStatus(error.message))
  }

  const removeFtp = (username) => {
    setFtpStatus(`Deleting ${username}...`)
    deleteFtpAccount(username)
      .then(() => {
        setFtpStatus('FTP account deleted.')
        return refreshFtp()
      })
      .catch((error) => setFtpStatus(error.message))
  }

  const submitFtpPassword = (event) => {
    event.preventDefault()
    if (!ftpPasswordForm.username) return
    setFtpStatus(`Rotating password for ${ftpPasswordForm.username}...`)
    updateFtpPassword(ftpPasswordForm.username, { password: ftpPasswordForm.password })
      .then(() => {
        setFtpStatus('FTP password rotated.')
        setFtpPasswordForm({ username: '', password: '' })
        return refreshFtp()
      })
      .catch((error) => setFtpStatus(error.message))
  }

  const downloadSelected = () => {
    if (!selectedFilePath) return
    setFileStatus('Downloading...')
    downloadFile(selectedFilePath)
      .then((payload) => {
        const blob = new Blob([payload.content || ''], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = payload.path.split('/').pop() || 'download.txt'
        anchor.click()
        URL.revokeObjectURL(url)
        setFileStatus('Downloaded.')
      })
      .catch((error) => setFileStatus(error.message))
  }

  const submitDnsRecord = (event) => {
    event.preventDefault()
    setDnsStatus('Saving DNS record...')
    const payload = {
      ...dnsForm,
      ttl: Number(dnsForm.ttl),
      priority: ['MX', 'SRV'].includes(dnsForm.type) ? Number(dnsForm.priority) : undefined
    }
    createDnsRecord(payload)
      .then(() => {
        setDnsStatus('DNS record created.')
        setDnsForm((prev) => ({ ...prev, name: '@', value: '' }))
        return refreshDns()
      })
      .catch((error) => setDnsStatus(error.message))
  }

  const removeDnsRecord = (id) => {
    setDnsStatus(`Deleting DNS record #${id}...`)
    deleteDnsRecord(id)
      .then(() => {
        setDnsStatus('DNS record deleted.')
        return refreshDns()
      })
      .catch((error) => setDnsStatus(error.message))
  }

  const loadZonefile = () => {
    const zone = dnsFilterZone || dnsForm.zone
    if (!zone) return
    setDnsStatus(`Rendering zone file for ${zone}...`)
    getDnsZoneFile(zone)
      .then((payload) => {
        setZonefileOutput(payload.zonefile || '')
        setDnsStatus(`Zone file rendered for ${payload.zone}.`)
      })
      .catch((error) => setDnsStatus(error.message))
  }

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
          <form onSubmit={submitMailbox} style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
            <input
              placeholder="user@example.com"
              value={mailboxForm.address}
              onChange={(event) => setMailboxForm((prev) => ({ ...prev, address: event.target.value }))}
            />
            <input
              type="password"
              placeholder="password"
              value={mailboxForm.password}
              onChange={(event) => setMailboxForm((prev) => ({ ...prev, password: event.target.value }))}
            />
            <input
              type="number"
              min={1}
              placeholder="quota (MB)"
              value={mailboxForm.quota_mb}
              onChange={(event) => setMailboxForm((prev) => ({ ...prev, quota_mb: event.target.value }))}
            />
            <button type="submit">Create Mailbox</button>
          </form>
          <form onSubmit={submitMailboxPassword} style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
            <input
              placeholder="mailbox for password reset"
              value={mailboxPasswordForm.address}
              onChange={(event) => setMailboxPasswordForm((prev) => ({ ...prev, address: event.target.value }))}
            />
            <input
              type="password"
              placeholder="new mailbox password"
              value={mailboxPasswordForm.password}
              onChange={(event) => setMailboxPasswordForm((prev) => ({ ...prev, password: event.target.value }))}
            />
            <button type="submit">Reset Mailbox Password</button>
          </form>
          <ul>
            {data.mailboxes.map((m) => (
              <li key={m.id}>
                {m.address} - {m.quota_mb}MB [{m.enabled ? 'enabled' : 'disabled'}]
                {' '}
                <button type="button" onClick={() => toggleMailboxEnabled(m)}>
                  {m.enabled ? 'Disable' : 'Enable'}
                </button>
                {' '}
                <button type="button" onClick={() => removeMailbox(m.address)}>Delete</button>
              </li>
            ))}
          </ul>
          <p>{mailStatus}</p>
        </Card>

        <Card title="FTP Accounts">
          <form onSubmit={submitFtpAccount} style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
            <input
              placeholder="username"
              value={ftpForm.username}
              onChange={(event) => setFtpForm((prev) => ({ ...prev, username: event.target.value }))}
            />
            <input
              type="password"
              placeholder="password"
              value={ftpForm.password}
              onChange={(event) => setFtpForm((prev) => ({ ...prev, password: event.target.value }))}
            />
            <input
              placeholder="/home/account/public_html"
              value={ftpForm.home_dir}
              onChange={(event) => setFtpForm((prev) => ({ ...prev, home_dir: event.target.value }))}
            />
            <input
              type="number"
              min={1}
              placeholder="quota (MB)"
              value={ftpForm.quota_mb}
              onChange={(event) => setFtpForm((prev) => ({ ...prev, quota_mb: event.target.value }))}
            />
            <button type="submit">Create FTP User</button>
          </form>

          <form onSubmit={submitFtpPassword} style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
            <input
              placeholder="username for password reset"
              value={ftpPasswordForm.username}
              onChange={(event) => setFtpPasswordForm((prev) => ({ ...prev, username: event.target.value }))}
            />
            <input
              type="password"
              placeholder="new password"
              value={ftpPasswordForm.password}
              onChange={(event) => setFtpPasswordForm((prev) => ({ ...prev, password: event.target.value }))}
            />
            <button type="submit">Reset FTP Password</button>
          </form>

          <ul>
            {data.ftpAccounts.map((f) => (
              <li key={f.id}>
                {f.username} → {f.home_dir} ({f.quota_mb}MB) [{f.enabled ? 'enabled' : 'disabled'}]
                {' '}
                <button type="button" onClick={() => toggleFtpEnabled(f)}>
                  {f.enabled ? 'Disable' : 'Enable'}
                </button>
                {' '}
                <button type="button" onClick={() => removeFtp(f.username)}>Delete</button>
              </li>
            ))}
          </ul>
          <p>{ftpStatus}</p>
        </Card>

        <Card title="DNS Records">
          <form onSubmit={submitDnsRecord} style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
            <input
              placeholder="zone (example.com)"
              value={dnsForm.zone}
              onChange={(event) => setDnsForm((prev) => ({ ...prev, zone: event.target.value }))}
            />
            <select
              value={dnsForm.type}
              onChange={(event) => setDnsForm((prev) => ({ ...prev, type: event.target.value }))}
            >
              {['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SRV', 'CAA'].map((recordType) => (
                <option key={recordType} value={recordType}>{recordType}</option>
              ))}
            </select>
            <input
              placeholder="name (@, www, mail)"
              value={dnsForm.name}
              onChange={(event) => setDnsForm((prev) => ({ ...prev, name: event.target.value }))}
            />
            <input
              placeholder="value"
              value={dnsForm.value}
              onChange={(event) => setDnsForm((prev) => ({ ...prev, value: event.target.value }))}
            />
            <input
              type="number"
              min={60}
              max={604800}
              placeholder="ttl"
              value={dnsForm.ttl}
              onChange={(event) => setDnsForm((prev) => ({ ...prev, ttl: event.target.value }))}
            />
            {['MX', 'SRV'].includes(dnsForm.type) && (
              <input
                type="number"
                min={0}
                max={65535}
                placeholder="priority"
                value={dnsForm.priority}
                onChange={(event) => setDnsForm((prev) => ({ ...prev, priority: event.target.value }))}
              />
            )}
            <button type="submit">Create DNS Record</button>
          </form>
          <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
            <input
              placeholder="Filter zone (optional)"
              value={dnsFilterZone}
              onChange={(event) => setDnsFilterZone(event.target.value)}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={refreshDns}>Apply Filter</button>
              <button type="button" onClick={loadZonefile}>Generate Zone File</button>
            </div>
          </div>
          <ul>
            {data.dnsRecords.map((r) => (
              <li key={r.id}>
                [{r.zone}] {r.type} {r.name} → {r.value}
                {r.priority !== undefined && r.priority !== null ? ` (priority ${r.priority})` : ''}
                {' '}
                (TTL {r.ttl})
                {' '}
                <button type="button" onClick={() => removeDnsRecord(r.id)}>Delete</button>
              </li>
            ))}
          </ul>
          {zonefileOutput && <textarea rows={8} readOnly value={zonefileOutput} />}
          <p>{dnsStatus}</p>
        </Card>

        <Card title="File Manager">
          <form onSubmit={submitNewItem} style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
            <input
              placeholder="/home/example/public_html/new.txt"
              value={fileForm.path}
              onChange={(event) => setFileForm((prev) => ({ ...prev, path: event.target.value }))}
            />
            <select
              value={fileForm.kind}
              onChange={(event) => setFileForm((prev) => ({ ...prev, kind: event.target.value }))}
            >
              <option value="file">file</option>
              <option value="directory">directory</option>
            </select>
            {fileForm.kind === 'file' && (
              <textarea
                placeholder="Initial file content"
                value={fileForm.content}
                onChange={(event) => setFileForm((prev) => ({ ...prev, content: event.target.value }))}
              />
            )}
            <button type="submit">Create</button>
          </form>
          <ul>
            {data.fileItems.map((f) => (
              <li key={f.id}>
                {f.kind}: {f.path} ({f.size_kb}KB)
                {' '}
                <button type="button" onClick={() => openFile(f.path)} disabled={f.kind !== 'file'}>Edit</button>
                {' '}
                <button type="button" onClick={() => removeItem(f.path)}>Delete</button>
              </li>
            ))}
          </ul>
          <p>{fileStatus}</p>
          {selectedFilePath && (
            <div style={{ display: 'grid', gap: 8 }}>
              <input value={renamePath} onChange={(event) => setRenamePath(event.target.value)} />
              <button type="button" onClick={renameItem}>Rename / Move</button>
              <textarea rows={8} value={editorContent} onChange={(event) => setEditorContent(event.target.value)} />
              <button type="button" onClick={saveFile}>Save File</button>
              <button type="button" onClick={downloadSelected}>Download File</button>
            </div>
          )}
        </Card>

        <Card title="Services">
          <ul>
            {data.services.map((s) => (
              <li key={s.name}>{s.name}: {s.enabled ? 'enabled' : 'disabled'}</li>
            ))}
          </ul>
        </Card>
      </div>

      <section style={{ marginTop: 24 }}>
        <Card title="All cPanel Features (Catalog)">
          <p style={{ marginTop: 0 }}>Expanded feature map for future parity planning.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {CPANEL_FEATURE_GROUPS.map((group) => (
              <div key={group.title}>
                <h3 style={{ margin: '0 0 8px 0' }}>{group.title}</h3>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {group.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </main>
  )
}
