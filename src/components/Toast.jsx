import { useEffect } from 'react'
import './Toast.css'

export default function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(onClose, 4500)
    return () => window.clearTimeout(timer)
  }, [message, onClose])

  if (!message) return null

  return (
    <div className={`toast toast-${type}`} onClick={onClose} role="status">
      <span>{message}</span>
    </div>
  )
}
