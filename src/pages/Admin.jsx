import { useEffect, useMemo, useState } from 'react'
import { EVENT_INFO } from '../constants'
import { clearEntries, getAdminPassword, getClosingDate, getEntries, setClosingDate, setAdminPassword } from '../storage'
import { downloadCsv, makeCsv, formatReadableDate, isEntryOpen } from '../utils'
import './Admin.css'

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [password, setPassword] = useState('')
  const [entries, setEntries] = useState([])
  const [filterEvent, setFilterEvent] = useState('')
  const [filterAge, setFilterAge] = useState('')
  const [closingDate, setClosingDateState] = useState(getClosingDate())
  const [adminPassword, setAdminPasswordState] = useState(getAdminPassword())
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (loggedIn) {
      setEntries(getEntries())
    }
  }, [loggedIn])

  const filtered = useMemo(() => {
    let list = entries
    if (filterEvent) {
      list = list.filter((e) => e.events.includes(filterEvent))
    }
    if (filterAge) {
      list = list.filter((e) => e.ageCategory === filterAge)
    }
    return list
  }, [entries, filterEvent, filterAge])

  const stats = useMemo(() => {
    const total = entries.length
    const byEvent = {}
    const byAge = {}
    entries.forEach((e) => {
      e.events.forEach((ev) => {
        byEvent[ev] = (byEvent[ev] ?? 0) + 1
      })
      byAge[e.ageCategory] = (byAge[e.ageCategory] ?? 0) + 1
    })
    return { total, byEvent, byAge }
  }, [entries])

  function handleLogin(e) {
    e.preventDefault()
    if (password === getAdminPassword()) {
      setLoggedIn(true)
      setPassword('')
      setNotice('')
      setEntries(getEntries())
      return
    }
    setNotice('Invalid password')
  }

  function handleLogout() {
    setLoggedIn(false)
  }

  function toLocalDateTimeInput(date) {
    const dt = new Date(date)
    const offset = dt.getTimezoneOffset()
    const local = new Date(dt.getTime() - offset * 60000)
    return local.toISOString().slice(0, 16)
  }

  function onCloseDateChange(value) {
    setClosingDateState(new Date(value))
    setClosingDate(value)
    setNotice('Closing date updated')
    setTimeout(() => setNotice(''), 3000)
  }

  function onPasswordSave() {
    setAdminPassword(password)
    setAdminPasswordState(password)
    setPassword('')
    setNotice('Admin password updated')
    setTimeout(() => setNotice(''), 3000)
  }

  function onExport() {
    const csv = makeCsv(filtered)
    downloadCsv('sportify-entries.csv', csv)
  }

  function onClearEntries() {
    if (!window.confirm('Delete all entries permanently?')) return
    clearEntries()
    setEntries([])
    setNotice('All entries deleted')
    setTimeout(() => setNotice(''), 3000)
  }

  const entryOpen = isEntryOpen(closingDate)

  if (!loggedIn) {
    return (
      <div className="admin">
        <div className="card">
          <h1>Admin login</h1>
          <p>Use the administrator password to view entries and manage settings.</p>
          <form onSubmit={handleLogin} className="adminForm">
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {notice ? <div className="notice">{notice}</div> : null}
            <div className="adminActions">
              <button type="submit" className="button">
                Sign in
              </button>
              <button type="button" className="button secondary" onClick={() => setPassword('')}>
                Clear
              </button>
            </div>
          </form>
          <p className="hint">
            Default password: <code>{EVENT_INFO.defaultAdminPassword}</code>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin">
      <div className="adminTop">
        <div className="card">
          <h1>Admin panel</h1>
          <p>
            Total registrations: <strong>{stats.total}</strong>.
          </p>
          <div className="adminButtons">
            <button className="button" onClick={handleLogout}>
              Logout
            </button>
            <button className="button secondary" onClick={onClearEntries}>
              Clear all entries
            </button>
          </div>
        </div>

        <div className="card">
          <h2>Registration status</h2>
          <p>
            Current: <strong>{entryOpen ? 'Open' : 'Closed'}</strong>
          </p>
          <label>
            Closing date & time
            <input
              type="datetime-local"
              value={toLocalDateTimeInput(closingDate)}
              onChange={(e) => onCloseDateChange(e.target.value)}
            />
          </label>
          <div className="adminHelper">
            <p>
              Participants will be blocked if the current time is after the closing date.
            </p>
          </div>
        </div>

        <div className="card">
          <h2>Admin settings</h2>
          <label>
            Change admin password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
            />
          </label>
          <button className="button" onClick={onPasswordSave} disabled={!password.trim()}>
            Save password
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Filters</h2>
        <div className="filters">
          <label>
            Event
            <select value={filterEvent} onChange={(e) => setFilterEvent(e.target.value)}>
              <option value="">All events</option>
              {EVENT_INFO.events.map((ev) => (
                <option key={ev} value={ev}>
                  {ev}
                </option>
              ))}
            </select>
          </label>
          <label>
            Age category
            <select value={filterAge} onChange={(e) => setFilterAge(e.target.value)}>
              <option value="">All age groups</option>
              {EVENT_INFO.ageCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>
          <button className="button" onClick={onExport}>
            Download CSV ({filtered.length})
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Registrations</h2>
        <div className="tableWrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Events</th>
                <th>Age</th>
                <th>Mobile</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '18px' }}>
                    No entries match the filters.
                  </td>
                </tr>
              ) : (
                filtered.map((entry) => (
                  <tr key={entry.entryId}>
                    <td>{entry.entryId}</td>
                    <td>{entry.fullName}</td>
                    <td>{entry.events.join(', ')}</td>
                    <td>{entry.ageCategory}</td>
                    <td>{entry.mobile}</td>
                    <td>{formatReadableDate(entry.submittedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {notice ? <div className="notice">{notice}</div> : null}
    </div>
  )
}
