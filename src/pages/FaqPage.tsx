import { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/FaqPage.css';

interface Faq {
  q: string;
  a: string;
}

/**
 * Questions are held as data, not JSX — the copy is maintained by people who
 * edit wording, not markup, and an accordion needs no component per entry.
 */
const FAQS: Faq[] = [
  {
    q: 'Who can use ACVR?',
    a: 'ACVR is intended for authorized organizations, such as employers, universities, education evaluation agencies, and other eligible institutions that require academic credential verification for legitimate purposes. Access is subject to the platform\'s registration and authorization requirements.',
  },
  {
    q: 'Do organizations need to register before using ACVR?',
    a: 'Yes. Organizations are expected to register and obtain the required authorization before accessing restricted verification services. This helps ensure that verification requests are associated with identifiable organizations and legitimate purposes.',
  },
  {
    q: 'Why is an organization account required?',
    a: 'An organization account helps ACVR identify the requesting organization, manage access permissions, and maintain records of verification requests for accountability and audit purposes.',
  },
  {
    q: 'Does ACVR award degrees or issue academic qualifications?',
    a: 'No. Academic qualifications are awarded by the relevant educational institutions or authorized awarding bodies. ACVR is intended to support credential verification and registry services; it does not replace the authority of the original issuing institution.',
  },
  {
    q: 'What information is required to submit a verification request?',
    a: 'The information required depends on the credential type and the applicable procedure. Requesting organizations may need to provide identifying details about the credential holder, qualification, issuing institution, and purpose of verification, together with any required supporting documents or authorization.',
  },
  {
    q: 'Can ACVR verify a credential if the original certificate is unavailable?',
    a: 'Verification may still be possible if sufficient information is available in the relevant institutional records. However, the outcome depends on record availability and the applicable verification procedure.',
  },
  {
    q: 'Does an ACVR verification result guarantee the authenticity of every document submitted?',
    a: 'ACVR verification results are based on graduate records entered and maintained by the respective universities\' Registrar Departments and the checks completed under the applicable verification procedures. ACVR confirms whether the submitted information corresponds with the available institutional records and provides assurance regarding the verification findings within the scope of the checks performed.',
  },
  {
    q: 'Is my personal and academic data secure on ACVR?',
    a: 'Yes. ACVR utilizes robust security measures, strict access controls, and encrypted databases. Only necessary public validation details are displayed, ensuring that confidential student records and personal information remain protected.',
  },
  {
    q: 'What types of academic credentials can ACVR verify?',
    a: 'ACVR is intended to support the verification of eligible academic and professional credentials, including university degrees and other educational qualifications, subject to participating institutions, available records, and the scope of the service.',
  },
  {
    q: 'How long does the verification process take?',
    a: 'Verification typically takes 2–5 business days, depending on the availability of academic records, the response time of the issuing institution, and the verification procedures required. Please note that Saturdays, Sundays, and public holidays are excluded from the processing period and may extend the overall waiting time.',
  },
];

const FaqPage = () => {
  // Reached from the footer of a long page — start at the top.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="faq-page">
      <Header />

      <main className="faq-main">
        <div className="faq-hero">
          <div className="faq-hero-inner">
            <h1 className="faq-title">Frequently Asked Questions</h1>
            <p className="faq-lead">
              Common questions about access, verification and how ACVR handles
              academic records.
            </p>
          </div>
        </div>

        <div className="faq-body">
          <div className="faq-list">
            {FAQS.map(item => (
              <details className="faq-item" key={item.q}>
                <summary className="faq-question">
                  <span>{item.q}</span>
                  <span className="faq-chevron" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </summary>
                <p className="faq-answer">{item.a}</p>
              </details>
            ))}
          </div>

          <p className="faq-footnote">
            Still need help? Email us at{' '}
            <a href="mailto:support@acvr.edu.mm">support@acvr.edu.mm</a>.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FaqPage;
