import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EVENT_INFO } from '../constants'
import { addEntry, getClosingDate } from '../storage'
import { dataURLFromFile, generateEntryId, isEntryOpen } from '../utils'
import Toast from '../components/Toast'
import QRCode from 'qrcode'
import './Register.css'

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

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
  paymentMethod: 'upi', // 'upi' or 'online'
  paymentScreenshot: null,
  paymentId: null, // For online payment
  paymentStatus: 'pending', // 'pending', 'completed', 'failed'
}

const steps = [
  { id: 1, label: 'Personal' },
  { id: 2, label: 'Events' },
  { id: 3, label: 'Payment' },
  { id: 4, label: 'Uploads' },
  { id: 5, label: 'Review' },
]

export default function Register() {
  const [form, setForm] = useState(initialForm)
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [closingDate, setClosingDateState] = useState(getClosingDate())
  const [toast, setToast] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const navigate = useNavigate()

  const isClosed = !isEntryOpen(closingDate)

  useEffect(() => {
    setClosingDateState(getClosingDate())
  }, [])

  useEffect(() => {
    // Generate QR code when payment step is reached and UPI is selected
    if (step === 3 && form.paymentMethod === 'upi') {
      generateQRCode()
    }
  }, [step, form.paymentMethod])

  const generateQRCode = async () => {
    try {
      const upiUrl = `upi://pay?pa=yuvrani@upi&pn=${encodeURIComponent(form.fullName || 'Player')}&am=${EVENT_INFO.entryFee}&cu=INR&tn=${encodeURIComponent(EVENT_INFO.name)}`
      const qrDataUrl = await QRCode.toDataURL(upiUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#6755ff',
          light: '#ffffff'
        }
      })
      setQrCodeUrl(qrDataUrl)
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

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

  function validate(onlyStep = false) {
    const errs = {}
    if (step === 1 || !onlyStep) {
      if (!form.fullName.trim()) errs.fullName = 'Required'
      if (!form.fatherName.trim()) errs.fatherName = 'Required'
      if (!form.state.trim()) errs.state = 'Required'
      if (!form.district.trim()) errs.district = 'Required'
      if (!form.dob) errs.dob = 'Required'
      if (!form.ageCategory) errs.ageCategory = 'Required'
      if (!form.gender) errs.gender = 'Required'
    }
    if (step === 2 || !onlyStep) {
      if (!form.mobile.trim()) errs.mobile = 'Required'
      if (!form.email.trim()) errs.email = 'Required'
      if (!form.address.trim()) errs.address = 'Required'
      if (form.events.length < EVENT_INFO.minEvents) {
        errs.events = `Select at least ${EVENT_INFO.minEvents} events.`
      }
      if (form.events.length > EVENT_INFO.maxEvents) {
        errs.events = `Select at most ${EVENT_INFO.maxEvents} events.`
      }
    }
    if (step === 3 || !onlyStep) {
      if (!form.paymentMethod) errs.paymentMethod = 'Select payment method'
      if (form.paymentMethod === 'upi' && !form.paymentScreenshot) {
        errs.paymentScreenshot = 'Upload payment screenshot'
      }
      if (form.paymentMethod === 'online' && form.paymentStatus !== 'completed') {
        errs.paymentStatus = 'Complete online payment'
      }
    }
    if (step === 4 || !onlyStep) {
      if (!form.photo) errs.photo = 'Upload photo'
      if (!form.aadhar) errs.aadhar = 'Upload Aadhar / age proof'
    }
    return errs
  }

  function goNext() {
    const stepErrors = validate(true)
    setErrors(stepErrors)
    if (Object.keys(stepErrors).length) {
      setToast('Please fix errors on this step.')
      return
    }
    setStep((prev) => Math.min(prev + 1, steps.length))
  }

  function goBack() {
    setStep((prev) => Math.max(prev - 1, 1))
  }

  async function handleOnlinePayment() {
    setProcessingPayment(true)
    try {
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        setToast('Failed to load payment gateway. Please try again.')
        setProcessingPayment(false)
        return
      }

      const options = {
        key: 'rzp_test_1DP5mmOlF5G5ag', // Test key - replace with your live key
        amount: EVENT_INFO.entryFee * 100, // Amount in paise
        currency: 'INR',
        name: EVENT_INFO.name,
        description: `Registration for ${form.fullName}`,
        image: '',
        handler: function (response) {
          setForm((prev) => ({
            ...prev,
            paymentId: response.razorpay_payment_id,
            paymentStatus: 'completed',
          }))
          setToast('Payment successful!')
          setProcessingPayment(false)
        },
        prefill: {
          name: form.fullName,
          email: form.email,
          contact: form.mobile,
        },
        notes: {
          registration_type: 'sports_event',
          player_name: form.fullName,
        },
        theme: {
          color: '#6755ff',
        },
        modal: {
          ondismiss: function () {
            setProcessingPayment(false)
            setToast('Payment cancelled')
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error('Payment error:', error)
      setToast('Payment failed. Please try again.')
      setProcessingPayment(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (isClosed) return

    const errs = validate(false)
    setErrors(errs)
    if (Object.keys(errs).length) {
      setToast('Please complete all required fields.')
      return
    }

    setSubmitting(true)
    try {
      const photoData = await dataURLFromFile(form.photo)
      const aadharData = await dataURLFromFile(form.aadhar)
      let paymentData = null
      
      if (form.paymentMethod === 'upi' && form.paymentScreenshot) {
        paymentData = await dataURLFromFile(form.paymentScreenshot)
      }

      const entry = {
        entryId: generateEntryId(),
        submittedAt: new Date().toISOString(),
        ...form,
        photo: photoData,
        aadhar: aadharData,
        paymentScreenshot: paymentData,
      }

      addEntry(entry)
      setToast('Registration successful!')
      setTimeout(() => navigate(`/confirmation/${entry.entryId}`), 600)
    } catch (err) {
      console.error(err)
      setToast('Unable to save the form. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const previewUrl = useMemo(() => {
    if (!form.photo) return null
    return URL.createObjectURL(form.photo)
  }, [form.photo])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const currentStep = steps.find((s) => s.id === step)

  return (
    <div className="register">
      <Toast message={toast} onClose={() => setToast('')} />

      <header className="registerHeader">
        <div>
          <h1>Online Registration</h1>
          <p>
            Register for <strong>{EVENT_INFO.name}</strong> — choose your events and upload documents.
          </p>
        </div>
        <div className="registerMeta">
          <p>
            <strong>Entry Fee:</strong> ₹{EVENT_INFO.entryFee}
          </p>
          <p>
            <strong>Status:</strong> {isClosed ? 'Closed' : 'Open'}
          </p>
          <p>{remainingSlots}</p>
        </div>
      </header>

      <div className="stepper">
        {steps.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`step ${s.id === step ? 'active' : ''} ${s.id < step ? 'completed' : ''}`}
            onClick={() => setStep(s.id)}
          >
            <span className="stepNumber">{s.id}</span>
            <span className="stepLabel">{s.label}</span>
          </button>
        ))}
      </div>

      <form className="registerForm" onSubmit={handleSubmit} noValidate>
        {errors.form ? <div className="error">{errors.form}</div> : null}

        <section className={`stepSection ${step !== 1 ? 'hidden' : ''}`}>
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
        </section>

        <section className={`stepSection ${step !== 2 ? 'hidden' : ''}`}>
          <fieldset>
            <legend>Event selection</legend>
            <p className="helper">Select 2-3 events you wish to compete in.</p>
            <div className="events">
              {EVENT_INFO.events.map((ev) => (
                <label key={ev} className={`chip ${form.events.includes(ev) ? 'selected' : ''}`}>
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
            <legend>Contact details</legend>
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
        </section>

        <section className={`stepSection ${step !== 3 ? 'hidden' : ''}`}>
          <fieldset>
            <legend>Payment method</legend>
            <div className="paymentMethods">
              <label className={`paymentOption ${form.paymentMethod === 'upi' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={form.paymentMethod === 'upi'}
                  onChange={(e) => updateField('paymentMethod', e.target.value)}
                  disabled={isClosed}
                />
                <div className="paymentOptionContent">
                  <h4>UPI Payment</h4>
                  <p>Pay via UPI using QR code or UPI ID and upload payment screenshot</p>
                  <div className="upiDetails">
                    <p><strong>Amount:</strong> ₹{EVENT_INFO.entryFee}</p>
                    <p><strong>UPI ID:</strong> <code>yuvrani@upi</code> (example)</p>
                    <p className="helper">Include your full name in payment note</p>
                    
                    {form.paymentMethod === 'upi' && qrCodeUrl && (
                      <div className="qrCodeSection">
                        <p><strong>Or scan QR code:</strong></p>
                        <div className="qrCodeContainer">
                          <img src={qrCodeUrl} alt="UPI QR Code" className="qrCode" />
                          <div className="qrCodeInfo">
                            <p>Scan with any UPI app</p>
                            <button
                              type="button"
                              className="button qrDownloadBtn"
                              onClick={() => {
                                const link = document.createElement('a')
                                link.download = 'upi-qr-code.png'
                                link.href = qrCodeUrl
                                link.click()
                              }}
                            >
                              Download QR
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </label>
              
              <label className={`paymentOption ${form.paymentMethod === 'online' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={form.paymentMethod === 'online'}
                  onChange={(e) => updateField('paymentMethod', e.target.value)}
                  disabled={isClosed}
                />
                <div className="paymentOptionContent">
                  <h4>Online Payment</h4>
                  <p>Pay securely using credit/debit card, UPI, net banking</p>
                  <div className="onlinePaymentDetails">
                    <p><strong>Amount:</strong> ₹{EVENT_INFO.entryFee}</p>
                    <p><strong>Payment Gateway:</strong> Razorpay</p>
                    {form.paymentMethod === 'online' && (
                      <div className="paymentActions">
                        {form.paymentStatus === 'completed' ? (
                          <div className="paymentSuccess">
                            <span className="successIcon">✓</span>
                            Payment successful! ID: {form.paymentId}
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="button paymentButton"
                            onClick={handleOnlinePayment}
                            disabled={processingPayment || isClosed}
                          >
                            {processingPayment ? 'Processing...' : 'Pay Now'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </label>
            </div>
            
            {form.paymentMethod === 'upi' && (
              <div className="upiUploadSection">
                <label>
                  Payment screenshot
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => updateField('paymentScreenshot', e.target.files?.[0] ?? null)}
                    disabled={isClosed}
                  />
                  {errors.paymentScreenshot ? <span className="fieldError">{errors.paymentScreenshot}</span> : null}
                  {form.paymentScreenshot && (
                    <p className="fileSelected">File selected: {form.paymentScreenshot.name}</p>
                  )}
                </label>
              </div>
            )}
            
            {errors.paymentMethod && <div className="fieldError">{errors.paymentMethod}</div>}
            {errors.paymentStatus && <div className="fieldError">{errors.paymentStatus}</div>}
          </fieldset>
        </section>

        <section className={`stepSection ${step !== 4 ? 'hidden' : ''}`}>
          <fieldset>
            <legend>Uploads</legend>
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
                {previewUrl ? (
                  <div className="preview">
                    <img src={previewUrl} alt="Player" />
                    <span>Photo preview</span>
                  </div>
                ) : null}
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
            </div>
          </fieldset>
        </section>

        <section className={`stepSection ${step !== 5 ? 'hidden' : ''}`}>
          <fieldset>
            <legend>Review & submit</legend>
            <div className="review">
              <div className="reviewSection">
                <h3>Personal</h3>
                <p>
                  <strong>Name:</strong> {form.fullName}
                </p>
                <p>
                  <strong>Father:</strong> {form.fatherName}
                </p>
                <p>
                  <strong>Aged:</strong> {form.ageCategory}, {form.gender}
                </p>
                <p>
                  <strong>DOB:</strong> {form.dob}
                </p>
              </div>
              <div className="reviewSection">
                <h3>Contact</h3>
                <p>
                  <strong>Mobile:</strong> {form.mobile}
                </p>
                <p>
                  <strong>WhatsApp:</strong> {form.whatsapp || '—'}
                </p>
                <p>
                  <strong>Email:</strong> {form.email}
                </p>
                <p>
                  <strong>Address:</strong> {form.address}
                </p>
              </div>
              <div className="reviewSection">
                <h3>Events</h3>
                <p>{form.events.join(', ') || 'No events selected'}</p>
              </div>
              <div className="reviewSection">
                <h3>Payment</h3>
                <p>
                  <strong>Method:</strong> {form.paymentMethod === 'upi' ? 'UPI Payment' : 'Online Payment'}
                </p>
                <p>
                  <strong>Amount:</strong> ₹{EVENT_INFO.entryFee}
                </p>
                {form.paymentMethod === 'upi' ? (
                  <p>
                    <strong>Proof:</strong> {form.paymentScreenshot ? form.paymentScreenshot.name : 'Not uploaded'}
                  </p>
                ) : (
                  <p>
                    <strong>Status:</strong> {form.paymentStatus === 'completed' ? `Completed (ID: ${form.paymentId})` : 'Pending'}
                  </p>
                )}
              </div>
              <div className="reviewSection">
                <h3>Uploads</h3>
                <p>
                  <strong>Photo:</strong> {form.photo ? form.photo.name : 'Not attached'}
                </p>
                <p>
                  <strong>Aadhar:</strong> {form.aadhar ? form.aadhar.name : 'Not attached'}
                </p>
              </div>
            </div>
            <p className="hint">
              Verify that all details are correct before submitting. Once submitted, changes cannot be made.
            </p>
          </fieldset>
        </section>

        <div className="formFooter">
          <div className="navButtons">
            <button type="button" className="button secondary" disabled={step === 1} onClick={goBack}>
              Back
            </button>
            {step < steps.length ? (
              <button type="button" className="button" onClick={goNext}>
                Continue
              </button>
            ) : (
              <button type="submit" className="button" disabled={submitting || isClosed}>
                {submitting ? 'Submitting…' : 'Submit Registration'}
              </button>
            )}
          </div>
          <p className="hint">
            After submission, you will receive a confirmation slip with your entry ID.
          </p>
        </div>
      </form>
    </div>
  )
}
