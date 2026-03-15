import { EVENT_INFO } from './constants'

export function getClosingDate() {
  const stored = localStorage.getItem(EVENT_INFO.closingDateKey)
  if (stored) return new Date(stored)
  return new Date(EVENT_INFO.defaultClosingDate)
}

export function setClosingDate(value) {
  localStorage.setItem(EVENT_INFO.closingDateKey, value)
}

export function getAdminPassword() {
  return localStorage.getItem(EVENT_INFO.adminPasswordKey) ?? EVENT_INFO.defaultAdminPassword
}

export function setAdminPassword(password) {
  localStorage.setItem(EVENT_INFO.adminPasswordKey, password)
}

export function getEntries() {
  try {
    const raw = localStorage.getItem(EVENT_INFO.entriesKey)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveEntries(entries) {
  localStorage.setItem(EVENT_INFO.entriesKey, JSON.stringify(entries))
}

export function addEntry(entry) {
  const entries = getEntries()
  entries.push(entry)
  saveEntries(entries)
}

export function clearEntries() {
  localStorage.removeItem(EVENT_INFO.entriesKey)
}
