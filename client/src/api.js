const API_BASE = '/api'

export async function fetchPosts() {
  const res = await fetch(`${API_BASE}/posts`)
  return res.json()
}

export async function fetchPost(slug) {
  const res = await fetch(`${API_BASE}/posts/${encodeURIComponent(slug)}`)
  return res.json()
}

export async function createPost(data) {
  const res = await fetch(`${API_BASE}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}

export async function updatePost(slug, data) {
  const res = await fetch(`${API_BASE}/posts/${encodeURIComponent(slug)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}

export async function deletePost(slug) {
  const res = await fetch(`${API_BASE}/posts/${encodeURIComponent(slug)}`, {
    method: 'DELETE'
  })
  return res.json()
}

export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/categories`)
  return res.json()
}

export async function fetchTags() {
  const res = await fetch(`${API_BASE}/tags`)
  return res.json()
}

export async function deploySite() {
  const res = await fetch(`${API_BASE}/deploy`, { method: 'POST' })
  return res.json()
}

export async function syncSource() {
  const res = await fetch(`${API_BASE}/sync-source`, { method: 'POST' })
  return res.json()
}

export async function fullDeploy() {
  const res = await fetch(`${API_BASE}/full-deploy`, { method: 'POST' })
  return res.json()
}

export async function generateSite() {
  const res = await fetch(`${API_BASE}/generate`, { method: 'POST' })
  return res.json()
}

export async function previewSite() {
  const res = await fetch(`${API_BASE}/preview`, { method: 'POST' })
  return res.json()
}

export async function fetchHexoInfo() {
  const res = await fetch(`${API_BASE}/hexo-info`)
  return res.json()
}

export async function fetchThemeConfig() {
  const res = await fetch(`${API_BASE}/theme-config`)
  return res.json()
}

export async function updateThemeConfig(data) {
  const res = await fetch(`${API_BASE}/theme-config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}

export async function uploadProfileImage(formData) {
  const res = await fetch(`${API_BASE}/upload-profile-image`, {
    method: 'POST',
    body: formData
  })
  return res.json()
}

export async function updateHexoDir(dir) {
  const res = await fetch(`${API_BASE}/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hexoDir: dir })
  })
  return res.json()
}