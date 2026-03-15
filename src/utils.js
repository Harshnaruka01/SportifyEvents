import { EVENT_INFO } from './constants'

export function generateEntryId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().split('-')[0].toUpperCase()
  }
  return `E${Date.now().toString().slice(-6)}`
}

export function formatReadableDate(date) {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function buildConfirmationMessage(entry) {
  return `Hello ${entry.fullName},\n\nYour registration for ${EVENT_INFO.name} is confirmed.\n\nEntry ID: ${entry.entryId}\nEvents: ${entry.events.join(', ')}\nVenue: ${EVENT_INFO.venue} (${EVENT_INFO.date})\nReporting Time: ${EVENT_INFO.reportingTime}\n\nPlease keep this message for your records.\n` 
}

export function makeCsv(entries) {
  const headers = [
    'Entry ID',
    'Full Name',
    'Father Name',
    'State',
    'District',
    'DOB',
    'Age Category',
    'Gender',
    'Mobile',
    'Whatsapp',
    'Email',
    'Events',
    'Submitted At',
  ]

  const rows = entries.map((entry) => [
    entry.entryId,
    entry.fullName,
    entry.fatherName,
    entry.state,
    entry.district,
    entry.dob,
    entry.ageCategory,
    entry.gender,
    entry.mobile,
    entry.whatsapp,
    entry.email,
    entry.events.join(' | '),
    entry.submittedAt,
  ])

  const lines = [headers, ...rows].map((row) =>
    row
      .map((value) => {
        const safe = String(value ?? '').replace(/"/g, '""')
        return `"${safe}"`
      })
      .join(','),
  )

  return lines.join('\n')
}

export function downloadCsv(filename, content) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function dataURLFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Unable to read file'))
    reader.readAsDataURL(file)
  })
}

export function isEntryOpen(closingDate) {
  const now = new Date()
  return now <= new Date(closingDate)
}
