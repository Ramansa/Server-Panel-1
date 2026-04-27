import { useEffect, useState } from 'react'
import {
  createFileItem,
  createFtpAccount,
  deleteFileItem,
  deleteFtpAccount,
  downloadFile,
  getDatabases,
  getDnsRecords,
  getDomains,
  getFileItem,
  getFiles,
  getFtpAccounts,
  getMailboxes,
  getServices,
  updateFileItem,
  updateFtpAccount,
  updateFtpPassword
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
  const [ftpPasswordForm, setFtpPasswordForm] = useState({ username: '', password: '' })
  const [ftpStatus, setFtpStatus] = useState('')

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
          <ul>
            {data.dnsRecords.map((r) => (
              <li key={r.id}>{r.type} {r.name} → {r.value} (TTL {r.ttl})</li>
            ))}
          </ul>
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
