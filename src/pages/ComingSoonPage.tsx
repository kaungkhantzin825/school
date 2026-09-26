import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/ComingSoonPage.css';

const ComingSoonPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve the page title from router state, defaulting to 'This page' if none is provided
  const pageTitle = location.state?.title || 'This page';

  return (
    <div className="coming-soon-page">
      <Header />
      
      <main className="coming-soon-main">
        <div className="coming-soon-card">
          <h1 className="coming-soon-title">Coming Soon</h1>
          <p className="coming-soon-subtitle">
            <span className="coming-soon-highlight">{pageTitle}</span> is under construction.
          </p>
          <button className="coming-soon-btn" onClick={() => navigate('/')}>
            &larr; Back to Home
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ComingSoonPage;
