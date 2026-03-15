import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EVENT_INFO } from '../constants'
import { addEntry, getClosingDate, setClosingDate } from '../storage'
import { dataURLFromFile, generateEntryId, isEntryOpen } from '../utils'
import './Register.css'

const initialForm = {
  fullName: '',
  fatherName: '',
  state: '',
  district: '',
  dob: '',
  ageCategory: '',
  gender: '',
  mobile: '',
  whatsapp: '',
  email: '',
  address: '',
  events: [],
  photo: null,
  aadhar: null,
  paymentScreenshot: null,
}

export default function Register() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [closingDate, setClosingDateState] = useState(getClosingDate())
  const navigate = useNavigate()

  const isClosed = !isEntryOpen(closingDate)

  useEffect(() => {
    setClosingDateState(getClosingDate())
  }, [])

  const remainingSlots = useMemo(() => {
    const current = new Date()
    const diff = closingDate - current
    if (diff <= 0) return 'Registration closed'
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
    const minutes = Math.floor((diff / (1000 * 60)) % 60)
    return `${days}d ${hours}h ${minutes}m remaining`
  }, [closingDate])

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function toggleEvent(eventName) {
    setForm((prev) => {
      const next = new Set(prev.events)
      if (next.has(eventName)) {
        next.delete(eventName)
      } else {
        next.add(eventName)
      }
      return { ...prev, events: Array.from(next) }
    })
  }

  function validate() {
    const errs = {}
    if (!form.fullName.trim()) errs.fullName = 'Required'
    if (!form.fatherName.trim()) errs.fatherName = 'Required'
    if (!form.state.trim()) errs.state = 'Required'
    if (!form.district.trim()) errs.district = 'Required'
    if (!form.dob) errs.dob = 'Required'
    if (!form.ageCategory) errs.ageCategory = 'Required'
    if (!form.gender) errs.gender = 'Required'
    if (!form.mobile.trim()) errs.mobile = 'Required'
    if (!form.email.trim()) errs.email = 'Required'
    if (!form.address.trim()) errs.address = 'Required'
    if (form.events.length < EVENT_INFO.minEvents) {
      errs.events = `Select at least ${EVENT_INFO.minEvents} events.`
    }
    if (form.events.length > EVENT_INFO.maxEvents) {
      errs.events = `Select at most ${EVENT_INFO.maxEvents} events.`
    }
    if (!form.photo) errs.photo = 'Upload photo'
    if (!form.aadhar) errs.aadhar = 'Upload Aadhar / age proof'
    if (!form.paymentScreenshot) errs.paymentScreenshot = 'Upload payment screenshot'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (isClosed) return

    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return

    setSubmitting(true)
    try {
      const photoData = await dataURLFromFile(form.photo)
      const aadharData = await dataURLFromFile(form.aadhar)
      const paymentData = await dataURLFromFile(form.paymentScreenshot)

      const entry = {
        entryId: generateEntryId(),
        submittedAt: new Date().toISOString(),
        ...form,
        photo: photoData,
        aadhar: aadharData,
        paymentScreenshot: paymentData,
      }

      addEntry(entry)
      navigate(`/confirmation/${entry.entryId}`)
    } catch (err) {
      console.error(err)
      setErrors({ form: 'Unable to save the form. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="register">
      <header className="registerHeader">
        <div>
          <h1>Online Registration</h1>
          <p>
            Fill out the form below to register for <strong>{EVENT_INFO.name}</strong>.
          </p>
        </div>
        <div className="registerMeta">
          <p>
            <strong>Entry Fee:</strong> ₹{EVENT_INFO.entryFee}
          </p>
          <p>
            <strong>Registration status:</strong> {isClosed ? 'Closed' : 'Open'}
          </p>
          <p>{remainingSlots}</p>
        </div>
      </header>

      {isClosed ? (
        <div className="notice">
          <strong>Registration closed.</strong> Please contact the organizers for updates.
        </div>
      ) : null}

      <form className="registerForm" onSubmit={handleSubmit} noValidate>
        {errors.form ? <div className="error">{errors.form}</div> : null}

        <fieldset>
          <legend>Personal details</legend>
          <div className="grid">
            <label>
              Full name
              <input
                value={form.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                disabled={isClosed}
              />
              {errors.fullName ? <span className="fieldError">{errors.fullName}</span> : null}
            </label>
            <label>
              Father name
              <input
                value={form.fatherName}
                onChange={(e) => updateField('fatherName', e.target.value)}
                disabled={isClosed}
              />
              {errors.fatherName ? <span className="fieldError">{errors.fatherName}</span> : null}
            </label>
            <label>
              State
              <input
                value={form.state}
                onChange={(e) => updateField('state', e.target.value)}
                disabled={isClosed}
              />
              {errors.state ? <span className="fieldError">{errors.state}</span> : null}
            </label>
            <label>
              District
              <input
                value={form.district}
                onChange={(e) => updateField('district', e.target.value)}
                disabled={isClosed}
              />
              {errors.district ? <span className="fieldError">{errors.district}</span> : null}
            </label>
            <label>
              Date of birth
              <input
                type="date"
                value={form.dob}
                onChange={(e) => updateField('dob', e.target.value)}
                disabled={isClosed}
              />
              {errors.dob ? <span className="fieldError">{errors.dob}</span> : null}
            </label>
            <label>
              Age category
              <select
                value={form.ageCategory}
                onChange={(e) => updateField('ageCategory', e.target.value)}
                disabled={isClosed}
              >
                <option value="">Select</option>
                {EVENT_INFO.ageCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.ageCategory ? <span className="fieldError">{errors.ageCategory}</span> : null}
            </label>
            <label>
              Gender
              <select
                value={form.gender}
                onChange={(e) => updateField('gender', e.target.value)}
                disabled={isClosed}
              >
                <option value="">Select</option>
                {EVENT_INFO.genders.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              {errors.gender ? <span className="fieldError">{errors.gender}</span> : null}
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Contacts</legend>
          <div className="grid">
            <label>
              Mobile number
              <input
                value={form.mobile}
                onChange={(e) => updateField('mobile', e.target.value)}
                disabled={isClosed}
              />
              {errors.mobile ? <span className="fieldError">{errors.mobile}</span> : null}
            </label>
            <label>
              WhatsApp number
              <input
                value={form.whatsapp}
                onChange={(e) => updateField('whatsapp', e.target.value)}
                disabled={isClosed}
              />
            </label>
            <label>
              Email address
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                disabled={isClosed}
              />
              {errors.email ? <span className="fieldError">{errors.email}</span> : null}
            </label>
            <label className="full">
              Address
              <textarea
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
                disabled={isClosed}
              />
              {errors.address ? <span className="fieldError">{errors.address}</span> : null}
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Event selection (choose 2–3)</legend>
          <div className="events">
            {EVENT_INFO.events.map((ev) => (
              <label key={ev} className="chip">
                <input
                  type="checkbox"
                  checked={form.events.includes(ev)}
                  onChange={() => toggleEvent(ev)}
                  disabled={isClosed}
                />
                {ev}
              </label>
            ))}
          </div>
          {errors.events ? <div className="fieldError">{errors.events}</div> : null}
        </fieldset>

        <fieldset>
          <legend>Document uploads</legend>
          <div className="grid">
            <label>
              Player photo
              <input
                type="file"
                accept="image/*"
                onChange={(e) => updateField('photo', e.target.files?.[0] ?? null)}
                disabled={isClosed}
              />
              {errors.photo ? <span className="fieldError">{errors.photo}</span> : null}
            </label>
            <label>
              Aadhar / age proof
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => updateField('aadhar', e.target.files?.[0] ?? null)}
                disabled={isClosed}
              />
              {errors.aadhar ? <span className="fieldError">{errors.aadhar}</span> : null}
            </label>
            <label>
              Payment screenshot
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => updateField('paymentScreenshot', e.target.files?.[0] ?? null)}
                disabled={isClosed}
              />
              {errors.paymentScreenshot ? <span className="fieldError">{errors.paymentScreenshot}</span> : null}
            </label>
          </div>
        </fieldset>

        <div className="formFooter">
          <button type="submit" className="button" disabled={submitting || isClosed}>
            {submitting ? 'Submitting…' : 'Submit Registration'}
          </button>
          <p className="hint">
            After successful submission, you will receive a confirmation slip and a message with details.
          </p>
        </div>
      </form>

      <section className="card">
        <h2>Payment instructions</h2>
        <p>Pay entry fee of ₹{EVENT_INFO.entryFee} via UPI and upload the payment screenshot.</p>
        <p>
          <strong>UPI ID:</strong> <code>yuvrani@upi</code> (example)
        </p>
        <p>
          Make sure your UPI transaction includes your full name in the note for verification.
        </p>
      </section>
    </div>
  )
}
