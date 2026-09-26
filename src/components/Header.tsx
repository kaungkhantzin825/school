import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="maver-header">

      {/* ── Main Navbar ── */}
      <div className="maver-navbar">

        {/* Logo */}
        <a className="maver-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="/logo-3.png" alt="MAVER Logo" className="maver-logo-img" />
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
                onClick={() => navigate('/coming-soon', { state: { title: 'About MAVER' } })}
                style={{ cursor: 'pointer' }}
              >
                About MAVER
              </a>
            </li>
          </ul>
        </nav>

        {/* Auth Buttons */}
        <div className="maver-auth-btns">
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
          <a
            className="maver-subnav-link"
            onClick={() => navigate('/coming-soon', { state: { title: 'News & Announcement' } })}
            style={{ cursor: 'pointer' }}
          >
            News &amp; Announcement
          </a>
        </div>
      </div>

    </header>
  );
};

export default Header;
