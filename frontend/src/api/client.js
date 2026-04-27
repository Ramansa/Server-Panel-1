const API_URL = import.meta.env.VITE_API_URL || ''

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  })
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }
  return response.json()
}

export const getDomains = () => request('/api/domains')
export const getDatabases = () => request('/api/databases')
export const getMailboxes = () => request('/api/mailboxes')
export const getFtpAccounts = () => request('/api/ftp-accounts')
export const createFtpAccount = (payload) => request('/api/ftp-accounts', { method: 'POST', body: JSON.stringify(payload) })
export const updateFtpAccount = (username, payload) =>
  request(`/api/ftp-accounts/item?username=${encodeURIComponent(username)}`, { method: 'PUT', body: JSON.stringify(payload) })
export const updateFtpPassword = (username, payload) =>
  request(`/api/ftp-accounts/password?username=${encodeURIComponent(username)}`, { method: 'PUT', body: JSON.stringify(payload) })
export const deleteFtpAccount = (username) =>
  request(`/api/ftp-accounts/item?username=${encodeURIComponent(username)}`, { method: 'DELETE' })
export const getDnsRecords = (zone = '') =>
  request(zone ? `/api/dns-records?zone=${encodeURIComponent(zone)}` : '/api/dns-records')
export const createDnsRecord = (payload) => request('/api/dns-records', { method: 'POST', body: JSON.stringify(payload) })
export const updateDnsRecord = (id, payload) =>
  request(`/api/dns-records/item?id=${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(payload) })
export const deleteDnsRecord = (id) =>
  request(`/api/dns-records/item?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
export const getDnsZoneFile = (zone) => request(`/api/dns-records/zonefile?zone=${encodeURIComponent(zone)}`)
export const getFiles = () => request('/api/files')
export const createFileItem = (payload) => request('/api/files', { method: 'POST', body: JSON.stringify(payload) })
export const getFileItem = (filePath) => request(`/api/files/item?path=${encodeURIComponent(filePath)}`)
export const updateFileItem = (filePath, payload) =>
  request(`/api/files/item?path=${encodeURIComponent(filePath)}`, { method: 'PUT', body: JSON.stringify(payload) })
export const deleteFileItem = (filePath) =>
  request(`/api/files/item?path=${encodeURIComponent(filePath)}`, { method: 'DELETE' })
export const downloadFile = (filePath) => request(`/api/files/download?path=${encodeURIComponent(filePath)}`)
export const getServices = () => request('/api/services')
