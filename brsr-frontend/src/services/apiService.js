const API_BASE = 'http://localhost:8000'

export const apiService = {
  async getHealth() {
    const response = await fetch(`${API_BASE}/health`)
    if (!response.ok) throw new Error('API not healthy')
    return response.json()
  },

  async getDocuments() {
    const response = await fetch(`${API_BASE}/documents`)
    if (!response.ok) throw new Error('Failed to fetch documents')
    return response.json()
  },

  async uploadPDF(file, companyName, reportingYear) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('company_name', companyName)
    formData.append('reporting_year', reportingYear)

    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) throw new Error('Upload failed')
    return response.json()
  },

  async searchDocuments(query) {
    const response = await fetch(`${API_BASE}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    })

    if (!response.ok) throw new Error('Search failed')
    return response.json()
  }
}
