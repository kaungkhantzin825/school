import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SearchPage.css';
import { universityAPI } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface University {
  id: number;
  name: string;
  location: string;
  logo_url?: string;
  description?: string;
  verification_notice?: string;
}

const SearchPage = () => {
  const [searchTerm, setSearchTerm]           = useState('');
  const [suggestions, setSuggestions]         = useState<University[]>([]);
  const [loading, setLoading]                 = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [brokenLogos, setBrokenLogos] = useState<Set<number>>(new Set());
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

      {/* ── MAVER Header ── */}
      <Header />

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
                    {uni.logo_url && !brokenLogos.has(uni.id) ? (
                      <img
                        src={uni.logo_url}
                        alt="Logo"
                        className="gov-suggestion-logo"
                        onError={() => setBrokenLogos(prev => new Set(prev).add(uni.id))}
                      />
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

      {/* ── MAVER Footer ── */}
      <Footer />
    </div>
  );
};

export default SearchPage;
