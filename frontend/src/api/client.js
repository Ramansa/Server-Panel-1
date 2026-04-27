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
export const getServices = () => request('/api/services')
