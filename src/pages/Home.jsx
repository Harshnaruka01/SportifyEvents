import { Link } from 'react-router-dom'
import { EVENT_INFO } from '../constants'
import './Home.css'

export default function Home() {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="heroBackground">
          <div className="heroPattern"></div>
        </div>
        <div className="heroContent">
          <div className="heroBadge">
            <span className="badgeIcon">🏆</span>
            <span>National Athletics Championship</span>
          </div>
          <h1 className="heroTitle">
            {EVENT_INFO.name}
          </h1>
          <p className="heroSubtitle">
            Join India's premier athletics competition
          </p>
          <div className="heroMeta">
            <div className="metaItem">
              <span className="metaIcon">📍</span>
              <span>{EVENT_INFO.venue}</span>
            </div>
            <div className="metaItem">
              <span className="metaIcon">📅</span>
              <span>{EVENT_INFO.date}</span>
            </div>
            <div className="metaItem">
              <span className="metaIcon">🏛️</span>
              <span>{EVENT_INFO.organizer}</span>
            </div>
          </div>
          <div className="heroActions">
            <Link to="/register" className="button primary">
              <span>Register Now</span>
              <span className="buttonArrow">→</span>
            </Link>
            <div className="priceInfo">
              <span className="priceLabel">Entry Fee</span>
              <span className="priceAmount">₹{EVENT_INFO.entryFee}</span>
            </div>
          </div>
        </div>
        <div className="heroVisual">
          <div className="floatingCard">
            <div className="cardIcon">⚡</div>
            <div className="cardTitle">Track Events</div>
            <div className="cardDesc">100m, 200m, 400m, 800m, 1500m</div>
          </div>
          <div className="floatingCard">
            <div className="cardIcon">🏃</div>
            <div className="cardTitle">Field Events</div>
            <div className="cardDesc">Long Jump, High Jump, Shot Put, Javelin</div>
          </div>
          <div className="heroStats">
            <div className="stat">
              <div className="statNumber">{EVENT_INFO.events.length}</div>
              <div className="statLabel">Events</div>
            </div>
            <div className="stat">
              <div className="statNumber">{EVENT_INFO.ageCategories.length}</div>
              <div className="statLabel">Categories</div>
            </div>
            <div className="stat">
              <div className="statNumber">3</div>
              <div className="statLabel">Events/Person</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Info Cards */}
      <section className="quickInfo">
        <div className="infoCard">
          <div className="infoIcon">⏰</div>
          <div className="infoContent">
            <h3>Reporting Time</h3>
            <p>{EVENT_INFO.reportingTime}</p>
          </div>
        </div>
        <div className="infoCard">
          <div className="infoIcon">📞</div>
          <div className="infoContent">
            <h3>Contact</h3>
            <p>{EVENT_INFO.contact}</p>
          </div>
        </div>
        <div className="infoCard">
          <div className="infoIcon">🎯</div>
          <div className="infoContent">
            <h3>Participation</h3>
            <p>Open to all athletes</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features">
        <div className="sectionHeader">
          <h2>What We Provide</h2>
          <p>Everything you need for a championship experience</p>
        </div>
        <div className="featuresGrid">
          <div className="featureCard">
            <div className="featureIcon">🏅</div>
            <h3>Medals & Trophies</h3>
            <p>Prestigious awards for winners</p>
          </div>
          <div className="featureCard">
            <div className="featureIcon">📜</div>
            <h3>Certificate</h3>
            <p>Official participation certificate</p>
          </div>
          <div className="featureCard">
            <div className="featureIcon">🏥</div>
            <h3>First Aid</h3>
            <p>Medical facilities on site</p>
          </div>
          <div className="featureCard">
            <div className="featureIcon">💧</div>
            <h3>Refreshments</h3>
            <p>Drinking water & meals</p>
          </div>
          <div className="featureCard">
            <div className="featureIcon">🏨</div>
            <h3>Accommodation</h3>
            <p>Stay arrangements</p>
          </div>
          <div className="featureCard">
            <div className="featureIcon">🏟️</div>
            <h3>Professional Ground</h3>
            <p>Standard athletics facilities</p>
          </div>
        </div>
      </section>

      {/* Guidelines Section */}
      <section className="guidelines">
        <div className="guidelinesGrid">
          <div className="guidelineCard">
            <div className="cardHeader">
              <div className="cardIcon">📋</div>
              <h2>Rules & Regulations</h2>
            </div>
            <ul className="ruleList">
              <li>Organizing committee decisions are final</li>
              <li>Misconduct leads to disqualification</li>
              <li>Entry fees are non-refundable</li>
              <li>Athletes must report on time</li>
              <li>Protests within given time limit</li>
            </ul>
          </div>
          <div className="guidelineCard">
            <div className="cardHeader">
              <div className="cardIcon">📝</div>
              <h2>Instructions</h2>
            </div>
            <ul className="ruleList">
              <li>Fill correct personal details</li>
              <li>Individual form for each participant</li>
              <li>Upload clear photo & Aadhar</li>
              <li>Carry original Aadhar during reporting</li>
              <li>Payment required before submission</li>
              <li>Upload payment screenshot</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="ctaContent">
          <h2>Ready to Compete?</h2>
          <p>Join athletes from across India in this prestigious championship</p>
          <Link to="/register" className="button ctaButton">
            <span>Register for Championship</span>
            <span className="buttonArrow">→</span>
          </Link>
        </div>
        <div className="ctaVisual">
          <div className="ctaBadge">Limited Slots</div>
        </div>
      </section>
    </div>
  )
}
