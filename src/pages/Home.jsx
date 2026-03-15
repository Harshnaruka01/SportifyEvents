import { Link } from 'react-router-dom'
import { EVENT_INFO } from '../constants'
import './Home.css'

export default function Home() {
  return (
    <div className="home">
      <header className="hero">
        <div className="hero__content">
          <h1>{EVENT_INFO.name}</h1>
          <p className="hero__subtitle">
            Organized by {EVENT_INFO.organizer} • {EVENT_INFO.venue} • {EVENT_INFO.date}
          </p>
          <p className="hero__cta">
            <strong>Entry Fee:</strong> ₹{EVENT_INFO.entryFee} / participant
          </p>
          <Link to="/register" className="button">
            Register Now
          </Link>
        </div>
        <div className="hero__meta">
          <div>
            <strong>Contact</strong>
            <p>{EVENT_INFO.contact}</p>
          </div>
          <div>
            <strong>Reporting Time</strong>
            <p>{EVENT_INFO.reportingTime}</p>
          </div>
        </div>
      </header>

      <section className="card">
        <h2>Rules & Regulations</h2>
        <ol>
          <li>The decision of the organizing committee will be final.</li>
          <li>Any misconduct or indiscipline will lead to disqualification.</li>
          <li>Entry fee once paid will not be refunded.</li>
          <li>Athletes must report on time for their events.</li>
          <li>Any protest must be submitted to the organizing committee within the given time.</li>
        </ol>
      </section>

      <section className="card">
        <h2>Instructions for Participants</h2>
        <ol>
          <li>Athlete must fill correct personal details.</li>
          <li>Entry form must be filled individually for each participant.</li>
          <li>Upload a clear photograph and Aadhar card copy.</li>
          <li>Carry original Aadhar card during reporting.</li>
          <li>Entry fee must be paid before submitting the form.</li>
          <li>Payment screenshot must be uploaded in the form.</li>
          <li>Incomplete forms will not be accepted.</li>
        </ol>
      </section>

      <section className="card">
        <h2>What We Provide</h2>
        <ul>
          <li>Participation Certificate</li>
          <li>Medal</li>
          <li>First Aid Facility</li>
          <li>Drinking Water</li>
          <li>Proper Ground & Equipment</li>
          <li>Stay and accommodation</li>
          <li>Food</li>
        </ul>
      </section>
    </div>
  )
}
