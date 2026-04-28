import { useEffect, useState } from 'react'
import {
  createDatabase,
  createDomain,
  createMailbox,
  createDnsRecord,
  createFileItem,
  createFtpAccount,
  deleteDatabase,
  deleteDomain,
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
  updateDatabase,
  updateDomain,
  updateMailbox,
  updateMailboxPassword,
  updateFileItem,
  updateFtpAccount, updateFtpPassword
} from '../api/client'
import { Card } from '../components/Card'

const FEATURE_GROUPS = [
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
  const [domainForm, setDomainForm] = useState({ name: '', doc_root: '', php_version: '8.2', status: 'active' })
  const [subdomainForm, setSubdomainForm] = useState({ label: '', parent_domain: 'example.com', doc_root: '', php_version: '8.2' })
  const [parkingForm, setParkingForm] = useState({ name: '', target_domain: 'example.com' })
  const [databaseForm, setDatabaseForm] = useState({ name: '', owner: '', encoding: 'UTF8' })
  const [accountStatus, setAccountStatus] = useState('')
  const [hostingAccountForm, setHostingAccountForm] = useState({
    account: '',
    domain: '',
    owner: '',
    password: '',
    php_version: '8.2',
    mailbox_quota_mb: 2048,
    ftp_quota_mb: 4096
  })
  const [hostingAccountStatus, setHostingAccountStatus] = useState('')
  const [activeMenus, setActiveMenus] = useState({
    account: 'quick',
    domains: 'create',
    databases: 'create',
    mailboxes: 'create',
    ftp: 'create',
    dns: 'create',
    files: 'create'
  })

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

  const refreshDomains = () =>
    getDomains()
      .then((domains) => setData((prev) => ({ ...prev, domains })))
      .catch((error) => setAccountStatus(error.message))

  const refreshDatabases = () =>
    getDatabases()
      .then((databases) => setData((prev) => ({ ...prev, databases })))
      .catch((error) => setAccountStatus(error.message))

  const submitDomain = (event) => {
    event.preventDefault()
    setAccountStatus('Creating domain...')
    createDomain({ ...domainForm, type: 'domain' })
      .then(() => {
        setDomainForm({ name: '', doc_root: '', php_version: '8.2', status: 'active' })
        setAccountStatus('Domain created.')
        return refreshDomains()
      })
      .catch((error) => setAccountStatus(error.message))
  }

  const submitSubdomain = (event) => {
    event.preventDefault()
    const label = subdomainForm.label.trim().toLowerCase()
    const parentDomain = subdomainForm.parent_domain.trim().toLowerCase()
    if (!label || !parentDomain) {
      setAccountStatus('Subdomain label and parent domain are required.')
      return
    }
    setAccountStatus('Creating subdomain...')
    createDomain({
      name: `${label}.${parentDomain}`,
      type: 'subdomain',
      parent_domain: parentDomain,
      doc_root: subdomainForm.doc_root,
      php_version: subdomainForm.php_version,
      status: 'active'
    })
      .then(() => {
        setSubdomainForm({ label: '', parent_domain: parentDomain, doc_root: '', php_version: '8.2' })
        setAccountStatus('Subdomain created.')
        return refreshDomains()
      })
      .catch((error) => setAccountStatus(error.message))
  }

  const submitParkingDomain = (event) => {
    event.preventDefault()
    setAccountStatus('Creating parking domain...')
    createDomain({
      name: parkingForm.name,
      type: 'parking',
      target_domain: parkingForm.target_domain,
      status: 'active'
    })
      .then(() => {
        setParkingForm((prev) => ({ ...prev, name: '' }))
        setAccountStatus('Parking domain created.')
        return refreshDomains()
      })
      .catch((error) => setAccountStatus(error.message))
  }

  const updateDomainStatus = (domain) => {
    const nextStatus = domain.status === 'active' ? 'suspended' : 'active'
    setAccountStatus(`Updating ${domain.name}...`)
    updateDomain(domain.name, { status: nextStatus })
      .then(() => {
        setAccountStatus('Domain updated.')
        return refreshDomains()
      })
      .catch((error) => setAccountStatus(error.message))
  }

  const removeDomain = (name) => {
    setAccountStatus(`Deleting ${name}...`)
    deleteDomain(name)
      .then(() => {
        setAccountStatus('Domain deleted.')
        return refreshDomains()
      })
      .catch((error) => setAccountStatus(error.message))
  }

  const retargetParkingDomain = (domain) => {
    if (domain.type !== 'parking') return
    const target = window.prompt(`Target domain for ${domain.name}`, domain.target_domain || '')
    if (!target) return
    setAccountStatus(`Updating ${domain.name} target...`)
    updateDomain(domain.name, { target_domain: target })
      .then(() => {
        setAccountStatus('Parking domain updated.')
        return refreshDomains()
      })
      .catch((error) => setAccountStatus(error.message))
  }

  const submitDatabase = (event) => {
    event.preventDefault()
    setAccountStatus('Creating database...')
    createDatabase(databaseForm)
      .then(() => {
        setDatabaseForm({ name: '', owner: '', encoding: 'UTF8' })
        setAccountStatus('Database created.')
        return refreshDatabases()
      })
      .catch((error) => setAccountStatus(error.message))
  }

  const reassignDatabaseOwner = (database) => {
    const owner = window.prompt(`New owner for ${database.name}`, database.owner)
    if (!owner) return
    setAccountStatus(`Updating ${database.name} owner...`)
    updateDatabase(database.name, { owner })
      .then(() => {
        setAccountStatus('Database updated.')
        return refreshDatabases()
      })
      .catch((error) => setAccountStatus(error.message))
  }

  const removeDatabase = (name) => {
    setAccountStatus(`Deleting ${name}...`)
    deleteDatabase(name)
      .then(() => {
        setAccountStatus('Database deleted.')
        return refreshDatabases()
      })
      .catch((error) => setAccountStatus(error.message))
  }

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
        setMenu('files', 'editor')
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

  const submitHostingAccount = (event) => {
    event.preventDefault()
    const account = hostingAccountForm.account.trim().toLowerCase()
    const domain = hostingAccountForm.domain.trim().toLowerCase()
    const owner = hostingAccountForm.owner.trim().toLowerCase()
    const password = hostingAccountForm.password

    if (!account || !domain || !owner || !password) {
      setHostingAccountStatus('Account, domain, owner, and password are required.')
      return
    }

    const mailboxAddress = `${account}@${domain}`
    const ftpUsername = account
    const databaseName = `${account}_db`
    const docRoot = `/home/${account}/public_html`

    setHostingAccountStatus(`Provisioning ${account}...`)

    Promise.all([
      createDomain({
        name: domain,
        type: 'domain',
        doc_root: docRoot,
        php_version: hostingAccountForm.php_version,
        status: 'active'
      }),
      createMailbox({
        address: mailboxAddress,
        password,
        quota_mb: Number(hostingAccountForm.mailbox_quota_mb),
        enabled: true
      }),
      createFtpAccount({
        username: ftpUsername,
        password,
        home_dir: docRoot,
        quota_mb: Number(hostingAccountForm.ftp_quota_mb),
        enabled: true
      }),
      createDatabase({
        name: databaseName,
        owner,
        encoding: 'UTF8'
      })
    ])
      .then(() => {
        setHostingAccountStatus(`Hosting account ${account} provisioned. Domain, mailbox, FTP, and database are ready.`)
        setHostingAccountForm({
          account: '',
          domain: '',
          owner,
          password: '',
          php_version: '8.2',
          mailbox_quota_mb: 2048,
          ftp_quota_mb: 4096
        })
        return loadAll()
      })
      .catch((error) => setHostingAccountStatus(error.message))
  }

  const rootDomains = data.domains.filter((domain) => domain.type === 'domain')
  const subdomains = data.domains.filter((domain) => domain.type === 'subdomain')
  const parkingDomains = data.domains.filter((domain) => domain.type === 'parking')
  const parkingTargets = data.domains.filter((domain) => domain.type !== 'parking')
  const setMenu = (card, tab) => setActiveMenus((prev) => ({ ...prev, [card]: tab }))

  return (
    <main className="dashboard-shell">
      <section className="hero">
        <h1>Server Panel</h1>
        <p>Modern card-driven workspace with quick sub-menus for account provisioning and core hosting resources.</p>
      </section>
      <div className="dashboard-grid">
        <Card title="Account Provisioning" subtitle="Provision full hosting bundles from one card.">
          <div className="submenu">
            <button type="button" className={activeMenus.account === 'quick' ? 'active' : ''} onClick={() => setMenu('account', 'quick')}>Quick Provision</button>
            <button type="button" className={activeMenus.account === 'credentials' ? 'active' : ''} onClick={() => setMenu('account', 'credentials')}>Credentials</button>
            <button type="button" className={activeMenus.account === 'usage' ? 'active' : ''} onClick={() => setMenu('account', 'usage')}>Usage Summary</button>
          </div>
          {activeMenus.account === 'quick' && (
            <>
              <p>Create a hosting account and automatically provision domain, email, FTP, and database from one guided flow.</p>
              <form onSubmit={submitHostingAccount} style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
                <input
                  placeholder="account username (e.g. acme)"
                  value={hostingAccountForm.account}
                  onChange={(event) => setHostingAccountForm((prev) => ({ ...prev, account: event.target.value }))}
                />
                <input
                  placeholder="primary domain (e.g. acme.com)"
                  value={hostingAccountForm.domain}
                  onChange={(event) => setHostingAccountForm((prev) => ({ ...prev, domain: event.target.value }))}
                />
                <input
                  placeholder="database owner"
                  value={hostingAccountForm.owner}
                  onChange={(event) => setHostingAccountForm((prev) => ({ ...prev, owner: event.target.value }))}
                />
                <input
                  type="password"
                  placeholder="account password"
                  value={hostingAccountForm.password}
                  onChange={(event) => setHostingAccountForm((prev) => ({ ...prev, password: event.target.value }))}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  <input
                    placeholder="PHP version"
                    value={hostingAccountForm.php_version}
                    onChange={(event) => setHostingAccountForm((prev) => ({ ...prev, php_version: event.target.value }))}
                  />
                  <input
                    type="number"
                    min={128}
                    placeholder="mailbox quota MB"
                    value={hostingAccountForm.mailbox_quota_mb}
                    onChange={(event) => setHostingAccountForm((prev) => ({ ...prev, mailbox_quota_mb: event.target.value }))}
                  />
                  <input
                    type="number"
                    min={256}
                    placeholder="FTP quota MB"
                    value={hostingAccountForm.ftp_quota_mb}
                    onChange={(event) => setHostingAccountForm((prev) => ({ ...prev, ftp_quota_mb: event.target.value }))}
                  />
                </div>
                <button type="submit">Provision Full Account</button>
              </form>
            </>
          )}
          {activeMenus.account === 'credentials' && (
            <ul className="compact-list">
              <li>Domain: {hostingAccountForm.domain || '—'}</li>
              <li>Mailbox: {hostingAccountForm.account && hostingAccountForm.domain ? `${hostingAccountForm.account}@${hostingAccountForm.domain}` : '—'}</li>
              <li>FTP username: {hostingAccountForm.account || '—'}</li>
              <li>Database: {hostingAccountForm.account ? `${hostingAccountForm.account}_db` : '—'}</li>
            </ul>
          )}
          {activeMenus.account === 'usage' && (
            <ul className="compact-list">
              <li>Total domains: {data.domains.length}</li>
              <li>Total mailboxes: {data.mailboxes.length}</li>
              <li>Total FTP users: {data.ftpAccounts.length}</li>
              <li>Total databases: {data.databases.length}</li>
            </ul>
          )}
          <p className="status-text">{hostingAccountStatus}</p>
        </Card>

        <Card title="Domains" subtitle="Domain, subdomain, and parked domain controls.">
          <div className="submenu">
            <button type="button" className={activeMenus.domains === 'create' ? 'active' : ''} onClick={() => setMenu('domains', 'create')}>Create</button>
            <button type="button" className={activeMenus.domains === 'subdomains' ? 'active' : ''} onClick={() => setMenu('domains', 'subdomains')}>Subdomains</button>
            <button type="button" className={activeMenus.domains === 'manage' ? 'active' : ''} onClick={() => setMenu('domains', 'manage')}>Manage</button>
          </div>
          {activeMenus.domains === 'create' && (
            <>
              <strong>Add Domain</strong>
              <form onSubmit={submitDomain} style={{ display: 'grid', gap: 8, marginTop: 8, marginBottom: 12 }}>
                <input
                  placeholder="example.com"
                  value={domainForm.name}
                  onChange={(event) => setDomainForm((prev) => ({ ...prev, name: event.target.value }))}
                />
                <input
                  placeholder="/home/account/public_html (optional)"
                  value={domainForm.doc_root}
                  onChange={(event) => setDomainForm((prev) => ({ ...prev, doc_root: event.target.value }))}
                />
                <input
                  placeholder="8.2"
                  value={domainForm.php_version}
                  onChange={(event) => setDomainForm((prev) => ({ ...prev, php_version: event.target.value }))}
                />
                <button type="submit">Create Domain</button>
              </form>
            </>
          )}
          {activeMenus.domains === 'subdomains' && (
            <>
              <strong>Add Subdomain</strong>
              <form onSubmit={submitSubdomain} style={{ display: 'grid', gap: 8, marginTop: 8, marginBottom: 12 }}>
                <input
                  placeholder="blog"
                  value={subdomainForm.label}
                  onChange={(event) => setSubdomainForm((prev) => ({ ...prev, label: event.target.value }))}
                />
                <select
                  value={subdomainForm.parent_domain}
                  onChange={(event) => setSubdomainForm((prev) => ({ ...prev, parent_domain: event.target.value }))}
                >
                  {rootDomains.map((domain) => (
                    <option key={domain.id} value={domain.name}>{domain.name}</option>
                  ))}
                </select>
                <input
                  placeholder="/home/account/public_html/blog (optional)"
                  value={subdomainForm.doc_root}
                  onChange={(event) => setSubdomainForm((prev) => ({ ...prev, doc_root: event.target.value }))}
                />
                <button type="submit">Create Subdomain</button>
              </form>
              <strong>Subdomains</strong>
              <ul className="compact-list">
                {subdomains.map((d) => (
                  <li key={d.id}>
                    {d.name} (parent: {d.parent_domain}) → {d.doc_root} [{d.status}]
                    {' '}
                    <button type="button" onClick={() => updateDomainStatus(d)}>
                      {d.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                    {' '}
                    <button type="button" onClick={() => removeDomain(d.name)}>Delete</button>
                  </li>
                ))}
              </ul>
            </>
          )}
          {activeMenus.domains === 'manage' && (
            <>
              <strong>Add Parking Domain</strong>
              <form onSubmit={submitParkingDomain} style={{ display: 'grid', gap: 8, marginTop: 8, marginBottom: 12 }}>
                <input
                  placeholder="example.net"
                  value={parkingForm.name}
                  onChange={(event) => setParkingForm((prev) => ({ ...prev, name: event.target.value }))}
                />
                <select
                  value={parkingForm.target_domain}
                  onChange={(event) => setParkingForm((prev) => ({ ...prev, target_domain: event.target.value }))}
                >
                  {parkingTargets.map((domain) => (
                    <option key={domain.id} value={domain.name}>{domain.name}</option>
                  ))}
                </select>
                <button type="submit">Create Parking Domain</button>
              </form>
              <strong>Domains</strong>
              <ul className="compact-list">
                {rootDomains.map((d) => (
                  <li key={d.id}>
                    {d.name} → {d.doc_root} ({d.php_version}) [{d.status}]
                    {' '}
                    <button type="button" onClick={() => updateDomainStatus(d)}>
                      {d.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                    {' '}
                    <button type="button" onClick={() => removeDomain(d.name)}>Delete</button>
                  </li>
                ))}
              </ul>

              <strong>Parking Domains</strong>
              <ul className="compact-list">
                {parkingDomains.map((d) => (
                  <li key={d.id}>
                    {d.name} parked on {d.target_domain} [{d.status}]
                    {' '}
                    <button type="button" onClick={() => retargetParkingDomain(d)}>Retarget</button>
                    {' '}
                    <button type="button" onClick={() => updateDomainStatus(d)}>
                      {d.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                    {' '}
                    <button type="button" onClick={() => removeDomain(d.name)}>Delete</button>
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="status-text">{accountStatus}</p>
        </Card>

        <Card title="Databases" subtitle="Provision and maintain SQL databases.">
          <div className="submenu">
            <button type="button" className={activeMenus.databases === 'create' ? 'active' : ''} onClick={() => setMenu('databases', 'create')}>Create</button>
            <button type="button" className={activeMenus.databases === 'ownership' ? 'active' : ''} onClick={() => setMenu('databases', 'ownership')}>Ownership</button>
            <button type="button" className={activeMenus.databases === 'cleanup' ? 'active' : ''} onClick={() => setMenu('databases', 'cleanup')}>Cleanup</button>
          </div>
          {activeMenus.databases === 'create' && (
            <form onSubmit={submitDatabase} style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
              <input
                placeholder="app_db"
                value={databaseForm.name}
                onChange={(event) => setDatabaseForm((prev) => ({ ...prev, name: event.target.value }))}
              />
              <input
                placeholder="owner"
                value={databaseForm.owner}
                onChange={(event) => setDatabaseForm((prev) => ({ ...prev, owner: event.target.value }))}
              />
              <input
                placeholder="UTF8"
                value={databaseForm.encoding}
                onChange={(event) => setDatabaseForm((prev) => ({ ...prev, encoding: event.target.value }))}
              />
              <button type="submit">Create Database</button>
            </form>
          )}
          {activeMenus.databases === 'ownership' && (
            <ul className="compact-list">
              {data.databases.map((db) => (
                <li key={db.id}>
                  {db.name} ({db.owner}) [{db.encoding}]
                  {' '}
                  <button type="button" onClick={() => reassignDatabaseOwner(db)}>Change Owner</button>
                </li>
              ))}
            </ul>
          )}
          {activeMenus.databases === 'cleanup' && (
            <ul className="compact-list">
              {data.databases.map((db) => (
                <li key={db.id}>
                  {db.name}
                  {' '}
                  <button type="button" onClick={() => removeDatabase(db.name)}>Delete</button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Mailboxes" subtitle="Mailbox lifecycle and password operations.">
          <div className="submenu">
            <button type="button" className={activeMenus.mailboxes === 'create' ? 'active' : ''} onClick={() => setMenu('mailboxes', 'create')}>Create</button>
            <button type="button" className={activeMenus.mailboxes === 'passwords' ? 'active' : ''} onClick={() => setMenu('mailboxes', 'passwords')}>Passwords</button>
            <button type="button" className={activeMenus.mailboxes === 'status' ? 'active' : ''} onClick={() => setMenu('mailboxes', 'status')}>Status</button>
          </div>
          {activeMenus.mailboxes === 'create' && (
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
          )}
          {activeMenus.mailboxes === 'passwords' && (
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
          )}
          {activeMenus.mailboxes === 'status' && (
            <ul className="compact-list">
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
          )}
          <p className="status-text">{mailStatus}</p>
        </Card>

        <Card title="FTP Accounts">
          <div className="submenu">
            <button type="button" className={activeMenus.ftp === 'create' ? 'active' : ''} onClick={() => setMenu('ftp', 'create')}>Create</button>
            <button type="button" className={activeMenus.ftp === 'passwords' ? 'active' : ''} onClick={() => setMenu('ftp', 'passwords')}>Passwords</button>
            <button type="button" className={activeMenus.ftp === 'status' ? 'active' : ''} onClick={() => setMenu('ftp', 'status')}>Status</button>
          </div>
          {activeMenus.ftp === 'create' && (
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
          )}

          {activeMenus.ftp === 'passwords' && (
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
          )}

          {activeMenus.ftp === 'status' && (
            <ul className="compact-list">
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
          )}
          <p className="status-text">{ftpStatus}</p>
        </Card>

        <Card title="DNS Records">
          <div className="submenu">
            <button type="button" className={activeMenus.dns === 'create' ? 'active' : ''} onClick={() => setMenu('dns', 'create')}>Create</button>
            <button type="button" className={activeMenus.dns === 'zone' ? 'active' : ''} onClick={() => setMenu('dns', 'zone')}>Zone Tools</button>
            <button type="button" className={activeMenus.dns === 'records' ? 'active' : ''} onClick={() => setMenu('dns', 'records')}>Records</button>
          </div>
          {activeMenus.dns === 'create' && (
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
          )}
          {activeMenus.dns === 'zone' && (
            <>
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
              {zonefileOutput && <textarea rows={8} readOnly value={zonefileOutput} />}
            </>
          )}
          {activeMenus.dns === 'records' && (
            <ul className="compact-list">
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
          )}
          <p className="status-text">{dnsStatus}</p>
        </Card>

        <Card title="File Manager">
          <div className="submenu">
            <button type="button" className={activeMenus.files === 'create' ? 'active' : ''} onClick={() => setMenu('files', 'create')}>Create</button>
            <button type="button" className={activeMenus.files === 'browse' ? 'active' : ''} onClick={() => setMenu('files', 'browse')}>Browse</button>
            <button type="button" className={activeMenus.files === 'editor' ? 'active' : ''} onClick={() => setMenu('files', 'editor')}>Editor</button>
          </div>
          {activeMenus.files === 'create' && (
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
          )}
          {activeMenus.files === 'browse' && (
            <ul className="compact-list">
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
          )}
          {activeMenus.files === 'editor' && selectedFilePath && (
            <div style={{ display: 'grid', gap: 8 }}>
              <input value={renamePath} onChange={(event) => setRenamePath(event.target.value)} />
              <button type="button" onClick={renameItem}>Rename / Move</button>
              <textarea rows={8} value={editorContent} onChange={(event) => setEditorContent(event.target.value)} />
              <button type="button" onClick={saveFile}>Save File</button>
              <button type="button" onClick={downloadSelected}>Download File</button>
            </div>
          )}
          {activeMenus.files === 'editor' && !selectedFilePath && (
            <p className="status-text">Open a file from Browse to use the editor.</p>
          )}
          <p className="status-text">{fileStatus}</p>
        </Card>

        <Card title="Services">
          <ul className="compact-list">
            {data.services.map((s) => (
              <li key={s.name}>{s.name}: {s.enabled ? 'enabled' : 'disabled'}</li>
            ))}
          </ul>
        </Card>
      </div>

      <section style={{ marginTop: 24 }}>
        <Card title="All Hosting Features (Catalog)">
          <p style={{ marginTop: 0 }}>Expanded feature map for future parity planning.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {FEATURE_GROUPS.map((group) => (
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
