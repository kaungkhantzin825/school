import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SearchPage.css';
import { universityAPI } from '../services/api';

interface University {
  id: number;
  name: string;
  location: string;
  logo_url?: string;
}

const SearchPage = () => {
  const [searchTerm, setSearchTerm]           = useState('');
  const [suggestions, setSuggestions]         = useState<University[]>([]);
  const [loading, setLoading]                 = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.trim().length < 2) {
        setSuggestions([]); setShowSuggestions(false); return;
      }
      setLoading(true);
      try {
        const response = await universityAPI.search(searchTerm);
        setSuggestions(response.data);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSelectUniversity = (uni: University) => {
    setSearchTerm(uni.name);
    setShowSuggestions(false);
    navigate('/university-info', { state: { university: uni } });
  };

  return (
    <div className="gov-page" onClick={() => setShowSuggestions(false)}>

      {/* ── Top Official Bar ── */}
      <div className="gov-top-bar">
        <span className="gov-top-bar-brand">Academic Credential Verification System</span>
        <span className="gov-top-bar-right">Ministry of Education</span>
      </div>

      {/* ── Header ── */}
      <header className="gov-header">
        <div className="gov-header-inner">
          <div className="gov-seal">🎓</div>
          <div className="gov-header-text">
            <h1 className="gov-title">Degree Verification Portal</h1>
            <p className="gov-subtitle">Official academic credential verification · Ministry of Education</p>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="gov-main">
        <div className="gov-card" onClick={(e) => e.stopPropagation()}>

          <div className="gov-card-header">
            <span className="gov-card-badge">PUBLIC SERVICE</span>
            <h2 className="gov-card-title">Verify Academic Qualifications</h2>
            <p className="gov-card-desc">
              Please enter the name of the university or college to begin the official verification process.
              This system is intended for authorized verification purposes only and is not for use by
              students or graduates to verify their own academic awards.
            </p>
          </div>

          {/* Search */}
          <div className="gov-search-wrap">
            <label className="gov-search-label" htmlFor="university-search">
              University / Institution Name
            </label>
            <div className="gov-search-box">
              <span className="gov-search-icon">🔍</span>
              <input
                ref={inputRef}
                id="university-search"
                type="text"
                className="gov-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Search by university name or location..."
                autoComplete="off"
              />
              <button className="gov-search-btn">Search</button>
            </div>

            {loading && (
              <div className="gov-loading">
                <div className="gov-spinner" />
                <span>Searching registered institutions...</span>
              </div>
            )}

            {showSuggestions && suggestions.length > 0 && (
              <ul className="gov-suggestions">
                {suggestions.map((uni) => (
                  <li key={uni.id} className="gov-suggestion-item" onClick={() => handleSelectUniversity(uni)}>
                    {uni.logo_url ? (
                      <img src={uni.logo_url} alt="Logo" className="gov-suggestion-logo" />
                    ) : (
                      <span className="gov-suggestion-logo-placeholder">🏛️</span>
                    )}
                    <div className="gov-suggestion-info">
                      <strong>{uni.name}</strong>
                      <span>📍 {uni.location}</span>
                    </div>
                    <span className="gov-suggestion-arrow">›</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Notice */}
          <div className="gov-notice">
            <span className="gov-notice-icon">ℹ️</span>
            <p>
              Verification results are generated based on official data records submitted by accredited
              and registered government universities and colleges in Myanmar. In case of any dispute or
              clarification, please contact <a href="mailto:example@email.com" style={{ color: '#163172', fontWeight: 600 }}>example@email.com</a>.
            </p>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="gov-footer">
        <div className="gov-footer-inner">
          <span>© {new Date().getFullYear()} Ministry of Education · All rights reserved</span>
        </div>
      </footer>
    </div>
  );
};

export default SearchPage;
