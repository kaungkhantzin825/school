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
  const [searchTerm, setSearchTerm]       = useState('');
  const [suggestions, setSuggestions]     = useState<University[]>([]);
  const [loading, setLoading]             = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
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

  const handleClickOutside = () => setShowSuggestions(false);

  return (
    <div className="search-page" onClick={handleClickOutside}>
      {/* Brand header */}
      <div className="search-brand">
        <div className="brand-icon-wrap">🎓</div>
        <h1 className="brand-title">Degree Verification Portal</h1>
        <p className="brand-subtitle">Official academic credential verification system</p>
      </div>

      {/* Search area */}
      <div className="search-container" onClick={(e) => e.stopPropagation()}>
        <label className="search-label">
          Enter the university or college name to begin verification
        </label>

        <div className="search-box">
          <input
            ref={inputRef}
            type="text"
            id="university-search"
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Search by university name or location..."
            autoComplete="off"
          />
          <button className="search-button">
            🔍 Search
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="search-loading">
            <div className="search-spinner" />
            <span>Searching universities...</span>
          </div>
        )}

        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="suggestions-list">
            {suggestions.map((uni) => (
              <div
                key={uni.id}
                className="suggestion-item"
                onClick={() => handleSelectUniversity(uni)}
              >
                {uni.logo_url ? (
                  <img src={uni.logo_url} alt="Logo" className="suggestion-icon" style={{ borderRadius: '6px', objectFit: 'contain', background: '#fff' }} />
                ) : (
                  <span className="suggestion-icon">🏛️</span>
                )}
                <div className="suggestion-info">
                  <strong>{uni.name}</strong>
                  <span>📍 {uni.location}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
