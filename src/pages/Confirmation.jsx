import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { EVENT_INFO } from '../constants'
import { getEntries } from '../storage'
import { buildConfirmationMessage, formatReadableDate } from '../utils'
import './Confirmation.css'

export default function Confirmation() {
  const { entryId } = useParams()
  const [entry, setEntry] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const all = getEntries()
    const found = all.find((e) => e.entryId === entryId)
    if (!found) {
      navigate('/')
      return
    }
    setEntry(found)
  }, [entryId, navigate])

  const messageText = useMemo(() => {
    if (!entry) return ''
    return buildConfirmationMessage(entry)
  }, [entry])

  if (!entry) {
    return null
  }

  const waNumber = entry.whatsapp?.replace(/\D/g, '') || entry.mobile.replace(/\D/g, '')
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(messageText)}`
  const mailto = `mailto:${entry.email}?subject=${encodeURIComponent(
    `${EVENT_INFO.name} Registration Confirmation`,
  )}&body=${encodeURIComponent(messageText)}`

  return (
    <div className="confirmation">
      <header className="confirmationHeader">
        <h1>Registration Confirmed</h1>
        <p>
          Thank you <strong>{entry.fullName}</strong>. Your entry has been recorded.
        </p>
      </header>

      <section className="card slip">
        <h2>Entry Confirmation Slip</h2>
        <div className="slipGrid">
          <div>
            <strong>Entry ID</strong>
            <p>{entry.entryId}</p>
          </div>
          <div>
            <strong>Name</strong>
            <p>{entry.fullName}</p>
          </div>
          <div>
            <strong>Events</strong>
            <p>{entry.events.join(', ')}</p>
          </div>
          <div>
            <strong>Venue</strong>
            <p>{EVENT_INFO.venue}</p>
          </div>
          <div>
            <strong>Date</strong>
            <p>{EVENT_INFO.date}</p>
          </div>
          <div>
            <strong>Reporting time</strong>
            <p>{EVENT_INFO.reportingTime}</p>
          </div>
          <div>
            <strong>Submitted at</strong>
            <p>{formatReadableDate(entry.submittedAt)}</p>
          </div>
        </div>
        <div className="slipActions">
          <a href={waUrl} target="_blank" rel="noreferrer" className="button">
            Send WhatsApp confirmation
          </a>
          <a href={mailto} className="button secondary">
            Send Email confirmation
          </a>
          <button type="button" className="button secondary" onClick={() => window.print()}>
            Print slip
          </button>
        </div>
      </section>

      <section className="card">
        <h2>Next steps</h2>
        <ul>
          <li>Save this confirmation slip for reporting.</li>
          <li>Carry the original Aadhar card on the event day.</li>
          <li>Arrive at the venue at or before the reporting time.</li>
        </ul>
      </section>
    </div>
  )
}
