import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/ContentPage.css';

/* ─────────────────────────────────────────────────────────────
   Content blocks — a tiny model so the copy below stays readable
   as data rather than a wall of hand-written JSX.
   ───────────────────────────────────────────────────────────── */

type Block =
  | { kind: 'p'; text: string }
  | { kind: 'sub'; num: string; title: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'kv'; items: { label: string; text: string }[] };

interface Section {
  /** Omitted on pages that are not clause-numbered (e.g. About). */
  num?: string;
  title: string;
  intro?: string;
  blocks?: Block[];
}

interface Doc {
  key: string;
  title: string;
  lead: string;
  sections: Section[];
  /** Rendered as cards under the lead — only used by About. */
  audiences?: { icon: string; title: string; text: string }[];
}

/* ─────────────────────────────────────────────────────────────
   About ACVR
   ───────────────────────────────────────────────────────────── */

const ABOUT: Doc = {
  key: 'about',
  title: 'About ACVR',
  lead:
    'The Academic Credential Verification Registry (ACVR) is an official and trusted digital authentication platform designed to streamline the verification of academic qualifications.',
  audiences: [
    {
      icon: '🎓',
      title: 'Students',
      text: 'Individual graduates holding degrees, diplomas, transcripts or certificates issued by accredited national institutions.',
    },
    {
      icon: '🏢',
      title: 'Companies / Employers',
      text: 'Verifying organizations running employment checks, professional credential reviews and institutional compliance.',
    },
    {
      icon: '🏛️',
      title: 'Universities',
      text: 'Institutional administrators who issue, manage and maintain verified graduate records in the registry.',
    },
  ],
  sections: [
    {
      title: 'A secure central repository',
      blocks: [
        {
          kind: 'p',
          text:
            'Operated in partnership with higher education institutions recognized under the Ministry of Cooperatives and Rural Development, ACVR enables universities to directly issue, manage, and maintain verified graduate records in a secure central repository.',
        },
      ],
    },
    {
      title: 'Verification you can rely on',
      blocks: [
        {
          kind: 'p',
          text:
            'Through our secure verification services, employers, educational institutions, government agencies, professional organizations, and other authorized stakeholders can efficiently verify degree credentials and graduate information, reducing the risk of fraudulent qualifications and supporting informed decision-making.',
        },
      ],
    },
    {
      title: 'Your trusted gateway',
      blocks: [
        {
          kind: 'p',
          text:
            'Whether you are an employer looking to verify a candidate\'s credentials or a graduate stepping into the local or global workforce, the Academic Credential Verification and Registry is your trusted gateway for academic validation.',
        },
      ],
    },
  ],
};

/* ─────────────────────────────────────────────────────────────
   Terms of Use
   ───────────────────────────────────────────────────────────── */

const TERMS: Doc = {
  key: 'terms',
  title: 'Terms of Use',
  lead:
    'Welcome to The ACVR (Academic Credential Verification and Registry). By accessing or using this website, you agree to comply with and be bound by the following Terms of Use. If you disagree with any part of these terms, you must not use our services.',
  sections: [
    {
      num: '1',
      title: 'Scope of Service',
      blocks: [
        {
          kind: 'p',
          text:
            'The Portal provides digital verification services for academic degrees, diplomas, transcripts, and certificates issued by accredited national institutions. Users include individual graduates ("Students"), verifying organizations ("Companies/Employers"), and institutional administrators ("Universities").',
        },
      ],
    },
    {
      num: '2',
      title: 'User Accounts and Security',
      blocks: [
        {
          kind: 'ul',
          items: [
            'To access certain verification features, you may be required to register an account.',
            'You are entirely responsible for maintaining the confidentiality of your account credentials (username and password).',
            'You agree to notify us immediately of any unauthorized use of your account or any other breach of security.',
          ],
        },
      ],
    },
    {
      num: '3',
      title: 'Permissible Use and Consent',
      blocks: [
        {
          kind: 'sub',
          num: '3.1',
          title: 'Purpose Limitation',
        },
        {
          kind: 'p',
          text:
            'The Academic Credential Verification Registry (ACVR) is intended solely for official degree authentication. All verification queries submitted by Corporate and Third-Party Users must be strictly limited to valid employment checks, professional credentials, and institutional compliance.',
        },
        {
          kind: 'sub',
          num: '3.2',
          title: 'Non-Commercial & Data Privacy Guarantee',
        },
        {
          kind: 'kv',
          items: [
            {
              label: 'Zero Commercialization',
              text:
                'ACVR strictly prohibits the sale, lease, sharing, or redistribution of student or graduate records to third-party marketing agencies, data aggregators, or non-authorized commercial entities.',
            },
            {
              label: 'Prohibition of Data Mining',
              text:
                'Mass data harvesting, scraping, or profiling of student records is expressly forbidden.',
            },
          ],
        },
        {
          kind: 'p',
          text:
            'You agree not to misuse the Portal by attempting to scrape data, bypass security firewalls, or inject malicious code.',
        },
      ],
    },
    {
      num: '5',
      title: 'Termination of Access',
      blocks: [
        {
          kind: 'p',
          text:
            'We reserve the right to suspend or terminate your access to the Portal without prior notice if we determine, in our sole discretion, that you have breached these Terms of Service or engaged in fraudulent verification attempts.',
        },
      ],
    },
  ],
};

/* ─────────────────────────────────────────────────────────────
   Privacy Policy
   ───────────────────────────────────────────────────────────── */

const PRIVACY: Doc = {
  key: 'privacy',
  title: 'Privacy Policy',
  lead:
    'We respect your privacy and are committed to protecting your personal data. This Privacy Policy outlines how your information is collected, used, processed, and protected when using the ACVR.',
  sections: [
    {
      num: '1',
      title: 'Data We Collect',
      intro: 'To perform official academic verifications, we process the following types of data:',
      blocks: [
        {
          kind: 'kv',
          items: [
            { label: 'Identity Data', text: 'Full name, organizational name, email.' },
            {
              label: 'Academic Data',
              text: 'Degree type, major, graduation year, and transcript records.',
            },
            { label: 'Contact & Account Data', text: 'Email address, and account login details.' },
            {
              label: 'Transaction Data',
              text:
                'Details of payments made on the portal (we do not store your full credit card or mobile banking pin numbers).',
            },
          ],
        },
      ],
    },
    {
      num: '2',
      title: 'How We Use Your Data',
      intro:
        'We process personal and academic records purely to execute legitimate system functions, including:',
      blocks: [
        {
          kind: 'ul',
          items: [
            'Verifying identity and authenticity of academic credentials.',
            'Processing financial transactions for verification requests.',
            'Auditing verification logs to prevent fraud and identity theft.',
            'Complying with national education regulations and data governance standards.',
          ],
        },
      ],
    },
    {
      num: '3',
      title: 'Data Protection and Security Measures',
      intro:
        'Data security is our primary operational focus. We implement industry-standard cryptographic practices to shield sensitive academic records:',
      blocks: [
        {
          kind: 'kv',
          items: [
            {
              label: 'Encryption',
              text:
                'All personal and academic data is encrypted in transit using Secure Sockets Layer (SSL/TLS) technology and encrypted at rest within our centralized servers.',
            },
            {
              label: 'Access Control',
              text:
                'Only authenticated and authorized personnel (such as verified university registrars) are granted administrative access to system records.',
            },
          ],
        },
      ],
    },
    {
      num: '4',
      title: 'Data Sharing and Third-Party Disclosures',
      blocks: [
        {
          kind: 'ul',
          items: [
            'We never sell, rent, or lease personal user data to third-party marketing companies.',
            'Academic records are shared with evaluating corporate users only when initiated by a specific verification lookup request that has been authorized by the record holder.',
          ],
        },
      ],
    },
  ],
};

const DOCS: Record<string, Doc> = { about: ABOUT, terms: TERMS, privacy: PRIVACY };

/* ─────────────────────────────────────────────────────────────
   Rendering
   ───────────────────────────────────────────────────────────── */

const BlockView = ({ block }: { block: Block }) => {
  switch (block.kind) {
    case 'p':
      return <p className="cp-para">{block.text}</p>;

    case 'sub':
      return (
        <h3 className="cp-subhead">
          <span className="cp-subhead-num">{block.num}</span>
          {block.title}
        </h3>
      );

    case 'ul':
      return (
        <ul className="cp-list">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );

    case 'kv':
      return (
        <ul className="cp-list cp-list-kv">
          {block.items.map((item, i) => (
            <li key={i}>
              <strong>{item.label}:</strong> {item.text}
            </li>
          ))}
        </ul>
      );
  }
};

const ContentPage = ({ doc }: { doc: 'about' | 'terms' | 'privacy' }) => {
  const navigate = useNavigate();
  const content = DOCS[doc];

  // Footer links are reached from the bottom of a long page; without this the
  // new page would open already scrolled down.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [doc]);

  return (
    <div className="content-page">
      <Header />

      <main className="cp-main">
        {/* ── Hero ── */}
        <section className="cp-hero">
          <div className="cp-hero-inner">
            <span className="cp-eyebrow">Academic Credential Verification &amp; Registry</span>
            <h1 className="cp-title">{content.title}</h1>
            <p className="cp-lead">{content.lead}</p>
          </div>
        </section>

        <div className="cp-body">
          {/* ── Who it is for (About only) ── */}
          {content.audiences && (
            <div className="cp-audience-grid">
              {content.audiences.map(a => (
                <div className="cp-audience-card" key={a.title}>
                  <span className="cp-audience-icon" aria-hidden="true">{a.icon}</span>
                  <h3>{a.title}</h3>
                  <p>{a.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── Document card ── */}
          <article className="cp-card">
            {content.sections.map(section => (
              <section className="cp-section" key={section.title}>
                <h2 className="cp-section-title">
                  {section.num && <span className="cp-section-num">{section.num}</span>}
                  {section.title}
                </h2>

                {section.intro && <p className="cp-para">{section.intro}</p>}
                {section.blocks?.map((block, i) => (
                  <BlockView block={block} key={i} />
                ))}
              </section>
            ))}

            <div className="cp-foot">
              <button className="cp-back-btn" onClick={() => navigate('/')}>
                &larr; Back to Home
              </button>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContentPage;
