import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import { getStoredUser, getToken, clearSession, homeRouteForRole } from '../utils/auth';
import '../styles/Header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Read once per mount. The header remounts on every route change, so it
  // picks up a sign-in that happened on another page.
  const [user, setUser] = useState(getStoredUser);
  const signedIn = !!user && !!getToken();

  const initials = (name?: string | null) =>
    (name || '')
      .split(' ')
      .filter(Boolean)
      .map(p => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';

  const handleSignOut = async () => {
    // Revoke the token server-side, but never block the sign-out on it —
    // a failed call must not leave the user stuck in a signed-in header.
    try {
      await authAPI.logout();
    } catch {
      /* already expired or offline */
    }
    clearSession();
    setUser(null);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="maver-header">

      {/* ── Main Navbar ── */}
      <div className="maver-navbar">

        {/* Logo */}
        <a className="maver-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="/acvr-logo.png" alt="ACVR — Academic Credential Verification &amp; Registry" className="maver-logo-img" />
        </a>

        {/* Nav Links */}
        <nav>
          <ul className="maver-nav-links">
            <li>
              <a
                onClick={() => navigate('/')}
                className={isActive('/') ? 'active' : ''}
                style={{ cursor: 'pointer' }}
              >
                Home
              </a>
            </li>
            <li>
              <a
                onClick={() => navigate('/about')}
                className={isActive('/about') ? 'active' : ''}
                style={{ cursor: 'pointer' }}
              >
                About ACVR
              </a>
            </li>
          </ul>
        </nav>

        {/* Auth area — signed-in users get their account, not a sign-in prompt */}
        <div className="maver-auth-btns">
          {signedIn ? (
            <>
              <button
                type="button"
                className="maver-account"
                onClick={() => navigate(homeRouteForRole(user?.role))}
                title="Go to my dashboard"
              >
                <span className="maver-account-avatar">{initials(user?.name)}</span>
                <span className="maver-account-text">
                  <strong>{user?.name}</strong>
                  <small>My Dashboard</small>
                </span>
              </button>
              <button type="button" className="maver-btn-signout" onClick={handleSignOut}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <a
                className="maver-btn-signup"
                onClick={() => navigate('/register')}
                style={{ cursor: 'pointer' }}
              >
                Sign up
              </a>
              <a
                className="maver-btn-signin"
                onClick={() => navigate('/login')}
                style={{ cursor: 'pointer' }}
              >
                Sign in
              </a>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button className="maver-hamburger" aria-label="Menu">
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* ── Sub Navigation ── */}
      <div className="maver-subnav">
        <div className="maver-subnav-inner">
          <a
            className={`maver-subnav-link ${isActive('/') ? 'active' : ''}`}
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          >
            University Search
          </a>
          {/* "News & Announcement" is hidden until the section exists — it
              only led to the Coming Soon placeholder. Restore the link here
              when there is real content to point at. */}
        </div>
      </div>

    </header>
  );
};

export default Header;
