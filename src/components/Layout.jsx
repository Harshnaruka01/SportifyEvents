import { NavLink, useLocation } from 'react-router-dom'
import './Layout.css'

export default function Layout({ children }) {
  const location = useLocation()

  return (
    <div className="app">
      <header className="appHeader">
        <div className="brand">
          <span>Sportify Events</span>
          <span className="sub">Athletics Championship 2026</span>
        </div>
        <nav className="nav">
          <NavLink end to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
            Home
          </NavLink>
          <NavLink to="/register" className={({ isActive }) => (isActive ? 'active' : '')}>
            Register
          </NavLink>
          <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : '')}>
            Admin
          </NavLink>
        </nav>
      </header>
      <main className="page" data-page={location.pathname}>
        {children}
      </main>
      <footer className="footer">
        <small>
          © {new Date().getFullYear()} Yuvrani Athletics Samiti, Alwar. Contact: 9414317686
        </small>
      </footer>
    </div>
  )
}
