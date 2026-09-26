import { useNavigate } from 'react-router-dom';
import '../styles/Footer.css';

const Footer = () => {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <footer className="maver-footer">

      {/* ── Footer Body ── */}
      <div className="maver-footer-body">

        {/* Support Column */}
        <div className="maver-footer-col">
          <h4 className="maver-footer-col-title">Support</h4>
          <ul>
            <li>
              <a
                onClick={() => navigate('/coming-soon', { state: { title: 'FAQs' } })}
                style={{ cursor: 'pointer' }}
              >
                FAQs
              </a>
            </li>
            <li>
              <a
                onClick={() => navigate('/coming-soon', { state: { title: 'User guide' } })}
                style={{ cursor: 'pointer' }}
              >
                User guide
              </a>
            </li>
          </ul>
        </div>

        {/* Legal Column */}
        <div className="maver-footer-col">
          <h4 className="maver-footer-col-title">Legal</h4>
          <ul>
            <li>
              <a
                onClick={() => navigate('/coming-soon', { state: { title: 'Term of use' } })}
                style={{ cursor: 'pointer' }}
              >
                Term of use
              </a>
            </li>
            <li>
              <a
                onClick={() => navigate('/coming-soon', { state: { title: 'Privacy policy' } })}
                style={{ cursor: 'pointer' }}
              >
                Privacy policy
              </a>
            </li>
            <li>
              <a
                onClick={() => navigate('/coming-soon', { state: { title: 'Terms and conditions' } })}
                style={{ cursor: 'pointer' }}
              >
                Terms and conditions
              </a>
            </li>
          </ul>
        </div>

        {/* Right: Copyright + Social Icons */}
        <div className="maver-footer-right">
          <span className="maver-footer-copyright">
            copyright © {year} maver
          </span>
          <div className="maver-social-icons">
            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="maver-social-btn facebook"
              aria-label="Facebook"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="maver-social-btn linkedin"
              aria-label="LinkedIn"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                <rect x="2" y="9" width="4" height="12"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
            </a>

            {/* YouTube */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="maver-social-btn youtube"
              aria-label="YouTube"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
                <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#ff0000"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* ── Footer Bottom ── */}
      <div className="maver-footer-bottom">
        <p className="maver-footer-bottom-text">
          Myanmar Academic Verification &amp; Educational Registry · Ministry of Education
        </p>
      </div>

    </footer>
  );
};

export default Footer;
