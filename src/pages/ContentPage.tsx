import { useEffect, useRef, useState } from 'react';
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
  /** Present on clause-numbered documents; the tile then shows the number. */
  num?: string;
  /** Used for the tile when the section is not numbered. */
  icon?: string;
  title: string;
  intro?: string;
  blocks?: Block[];
}

interface Doc {
  key: 'about' | 'terms' | 'privacy';
  title: string;
  lead: string;
  /** Short badges under the hero lead. */
  chips: string[];
  audiences?: { icon: string; title: string; text: string }[];
  sections: Section[];
}

/* ─────────────────────────────────────────────────────────────
   About ACVR
   ───────────────────────────────────────────────────────────── */

const ABOUT: Doc = {
  key: 'about',
  title: 'About ACVR',
  lead:
    'The Academic Credential Verification Registry (ACVR) is an official and trusted digital authentication platform designed to streamline the verification of academic qualifications.',
  chips: [
    '🏛 Ministry of Cooperatives and Rural Development',
    '🔒 Encrypted in transit and at rest',
    '✅ Official degree authentication',
  ],
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
      icon: '🗄️',
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
      icon: '✅',
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
      icon: '🌐',
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
  chips: ['⚖️ Official degree authentication only', '🚫 No commercialization of records'],
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
        { kind: 'sub', num: '3.1', title: 'Purpose Limitation' },
        {
          kind: 'p',
          text:
            'The Academic Credential Verification Registry (ACVR) is intended solely for official degree authentication. All verification queries submitted by Corporate and Third-Party Users must be strictly limited to valid employment checks, professional credentials, and institutional compliance.',
        },
        { kind: 'sub', num: '3.2', title: 'Non-Commercial & Data Privacy Guarantee' },
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
  chips: ['🔐 SSL/TLS encryption', '🙅 Never sold or leased'],
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

const DOCS: Record<Doc['key'], Doc> = { about: ABOUT, terms: TERMS, privacy: PRIVACY };

/** The other documents, offered as cross-links so the legal pages navigate. */
const RELATED: Record<Doc['key'], { to: string; label: string; blurb: string }[]> = {
  about: [
    { to: '/terms', label: 'Terms of Use', blurb: 'What you may and may not do' },
    { to: '/privacy', label: 'Privacy Policy', blurb: 'How your data is handled' },
  ],
  terms: [
    { to: '/about', label: 'About ACVR', blurb: 'What the registry is' },
    { to: '/privacy', label: 'Privacy Policy', blurb: 'How your data is handled' },
  ],
  privacy: [
    { to: '/about', label: 'About ACVR', blurb: 'What the registry is' },
    { to: '/terms', label: 'Terms of Use', blurb: 'What you may and may not do' },
  ],
};

/* ─────────────────────────────────────────────────────────────
   Rendering
   ───────────────────────────────────────────────────────────── */

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

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
        <div className="cp-callouts">
          {block.items.map((item, i) => (
            <div className="cp-callout" key={i}>
              <span className="cp-callout-label">{item.label}</span>
              <p className="cp-callout-text">{item.text}</p>
            </div>
          ))}
        </div>
      );
  }
};

const ContentPage = ({ doc }: { doc: Doc['key'] }) => {
  const navigate = useNavigate();
  const content = DOCS[doc];

  const [activeId, setActiveId] = useState('');
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Footer links are reached from the bottom of a long page; without this the
  // new page would open already scrolled down.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [doc]);

  // Highlight the table-of-contents entry for the section currently in view.
  useEffect(() => {
    const onScroll = () => {
      let current = content.sections[0] ? slugify(content.sections[0].title) : '';
      for (const section of content.sections) {
        const el = sectionRefs.current[slugify(section.title)];
        if (el && el.getBoundingClientRect().top <= 140) {
          current = slugify(section.title);
        }
      }
      setActiveId(current);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [doc, content]);

  const jumpTo = (id: string) => {
    const el = sectionRefs.current[id];
    if (!el) return;
    // Offset so the heading clears the top of the viewport.
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - 90,
      behavior: 'smooth',
    });
  };

  return (
    <div className="content-page">
      <Header />

      <main className="cp-main">
        {/* ── Hero ── */}
        <section className="cp-hero">
          <div className="cp-hero-inner">
            <nav className="cp-crumbs" aria-label="Breadcrumb">
              <button type="button" className="cp-crumb-link" onClick={() => navigate('/')}>
                Home
              </button>
              <span className="cp-crumb-sep" aria-hidden="true">›</span>
              <span className="cp-crumb-current">{content.title}</span>
            </nav>

            <span className="cp-eyebrow">Academic Credential Verification &amp; Registry</span>
            <h1 className="cp-title">{content.title}</h1>
            <p className="cp-lead">{content.lead}</p>

            <div className="cp-chips">
              {content.chips.map(chip => (
                <span className="cp-chip" key={chip}>{chip}</span>
              ))}
            </div>
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

          <div className="cp-layout">
            {/* ── Sidebar ── */}
            <aside className="cp-side">
              <nav className="cp-toc" aria-label="On this page">
                <span className="cp-toc-title">On this page</span>
                <ul className="cp-toc-list">
                  {content.sections.map(section => {
                    const id = slugify(section.title);
                    return (
                      <li key={id}>
                        <button
                          type="button"
                          className={`cp-toc-link ${activeId === id ? 'is-active' : ''}`}
                          onClick={() => jumpTo(id)}
                        >
                          {section.title}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <nav className="cp-cross" aria-label="More information">
                <span className="cp-toc-title">More information</span>
                <ul>
                  {RELATED[doc].map(item => (
                    <li key={item.to}>
                      <button
                        type="button"
                        className="cp-cross-link"
                        onClick={() => navigate(item.to)}
                      >
                        <span className="cp-cross-label">{item.label}</span>
                        <span className="cp-cross-blurb">{item.blurb}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            {/* ── Document ── */}
            <article className="cp-card">
              {content.sections.map(section => {
                const id = slugify(section.title);
                return (
                  <section
                    className="cp-section"
                    key={id}
                    ref={el => { sectionRefs.current[id] = el; }}
                  >
                    <div className="cp-section-head">
                      <span className="cp-section-tile" aria-hidden="true">
                        {section.num ?? section.icon}
                      </span>
                      <h2 className="cp-section-title">{section.title}</h2>
                    </div>

                    {section.intro && <p className="cp-para">{section.intro}</p>}
                    {section.blocks?.map((block, i) => (
                      <BlockView block={block} key={i} />
                    ))}
                  </section>
                );
              })}

              <div className="cp-actions">
                <button
                  type="button"
                  className="cp-btn cp-btn-primary"
                  onClick={() => navigate('/')}
                >
                  <span aria-hidden="true">←</span> Back to Home
                </button>
                <button
                  type="button"
                  className="cp-btn cp-btn-ghost"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  <span aria-hidden="true">↑</span> Back to top
                </button>
              </div>
            </article>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContentPage;
