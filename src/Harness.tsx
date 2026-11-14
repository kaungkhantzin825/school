import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VerificationFormPage from './pages/VerificationFormPage';
import { setSession } from './utils/auth';

/**
 * Temporary harness: mounts the verification form with a seeded university
 * and a fake session so the layout can be screenshotted without a backend.
 */
const Harness = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(
      'fake-token-for-layout-preview',
      { id: 1, name: 'Test Verifier', email: 'test@example.com', role: 'verifier' },
      false,
    );
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <Router>
      <Routes>
        <Route
          path="/verification-form"
          element={
            <VerificationFormPage
              key="harness"
              {...({
                location: {
                  state: {
                    university: {
                      id: 1,
                      name: 'University of Co-operative Management, Thanlyin (UCMT)',
                      location: 'Thanlyin, Yangon',
                      logo_url: null,
                      description: '',
                      verification_notice: '',
                    },
                  },
                },
                navigate: () => {},
              } as any)}
            />
          }
        />
      </Routes>
    </Router>
  );
};

export default Harness;
