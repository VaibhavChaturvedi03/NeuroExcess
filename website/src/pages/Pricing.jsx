import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero.jsx'
import { IconCheck, IconArrowRight } from '../components/Icons.jsx'

const plans = [
  {
    name: 'Free',
    tagline: 'Everything you need to read the web comfortably.',
    monthly: 0,
    yearly: 0,
    cta: 'Add to Chrome',
    features: [
      'One-click Global Accessibility Mode',
      'Smart contrast fixer + color-blind presets',
      'Text-to-speech (selection & full page)',
      'Enhanced keyboard navigation & skip links',
      'Default, Blind, Low Vision & Dyslexic profiles',
      'Local-first processing on every site',
    ],
  },
  {
    name: 'Plus',
    tagline: 'For daily power users who want AI on tap.',
    monthly: 6,
    yearly: 60,
    highlight: true,
    cta: 'Start free trial',
    features: [
      'Everything in Free',
      'AI image labeling & OCR, unlimited pages',
      'Speech-to-text & voice command navigation',
      'Per-site profile overrides that sync across devices',
      'Accessibility report export (PDF & JSON)',
      'Priority email support',
    ],
  },
  {
    name: 'Teams',
    tagline: 'Shared standards for schools, clinics, and workplaces.',
    monthly: 4,
    yearly: 40,
    priceNote: 'per seat',
    cta: 'Talk to us',
    features: [
      'Everything in Plus',
      'Centrally managed profiles & site allow-lists',
      'Org-wide accessibility reporting dashboard',
      'Bring-your-own API key for cloud AI features',
      'Onboarding session for your team',
      'Dedicated support channel',
    ],
  },
]

const faqs = [
  {
    q: 'Does NeuroAccess work without an internet connection?',
    a: 'Yes. Core features — contrast fixing, keyboard navigation, TTS, and profiles — run entirely locally. AI image labeling and OCR use an optional cloud step you can turn off or replace with your own API key.',
  },
  {
    q: 'Is my browsing content ever sent anywhere?',
    a: 'No hidden tracking of browsing content, ever. Cloud AI features are opt-in, and you control which sites they run on.',
  },
  {
    q: 'Can I cancel or downgrade at any time?',
    a: 'Yes, from your account settings at any time. You keep Plus or Teams features until the end of the billing period.',
  },
  {
    q: 'Is this a medical device?',
    a: 'No. NeuroAccess is an assistive browsing tool, not a medical treatment or diagnostic device.',
  },
]

export default function Pricing() {
  const [yearly, setYearly] = useState(false)

  return (
    <>
      <PageHero
        eyebrow="Simple, transparent pricing"
        title="Choose how you'd like to pay"
        lede="Whether you pay monthly or yearly, every plan includes the same accessibility-first experience. Switch billing anytime."
        rightContent={
          <div className="billing-card">
            <div className="billing-card-header">
              <span className="billing-label">Billing cycle</span>
              <h3>Save with yearly billing</h3>
              <p>
                Pay annually and save around 15% compared to monthly billing.
              </p>
            </div>

            <div
              className="billing-toggle billing-toggle-large"
              role="group"
              aria-label="Billing period"
            >
              <button
                type="button"
                className={"billing-btn" + (!yearly ? " is-active" : "")}
                onClick={() => setYearly(false)}
                aria-pressed={!yearly}
              >
                Monthly
              </button>

              <button
                type="button"
                className={"billing-btn" + (yearly ? " is-active" : "")}
                onClick={() => setYearly(true)}
                aria-pressed={yearly}
              >
                Yearly
                <span className="billing-save">Save 15%</span>
              </button>
            </div>

            <div className="billing-note">
              <span>✔ Cancel anytime</span>
              <span>✔ Instant upgrade</span>
              <span>✔ Secure payments</span>
            </div>
          </div>
        }
      />

      <section className="section">
        <div className="container">
          <div className="pricing-grid">
            {plans.map((p) => (
              <div
                className={
                  "pricing-card card" + (p.highlight ? " is-highlight" : "")
                }
                key={p.name}
              >
                {p.highlight && (
                  <span className="pricing-badge">Most popular</span>
                )}
                <h3>{p.name}</h3>
                <p className="pricing-tagline">{p.tagline}</p>
                <div className="pricing-amount">
                  <span className="pricing-currency">₹</span>
                  <span className="pricing-number">
                    {yearly ? Math.round((p.yearly * 100) / 12) : (p.monthly*100)}
                  </span>
                  <span className="pricing-period">
                    /mo{p.priceNote ? `, ${p.priceNote}` : ""}
                  </span>
                </div>
                {yearly && p.yearly > 0 && (
                  <p className="pricing-billed">Billed {p.yearly} yearly</p>
                )}
                <Link
                  to={p.name === "Teams" ? "/contact" : "/setup"}
                  className={
                    "btn btn-block " +
                    (p.highlight ? "btn-primary" : "btn-secondary")
                  }
                >
                  {p.cta}
                </Link>
                <ul className="pricing-features">
                  {p.features.map((f) => (
                    <li key={f}>
                      <IconCheck width={17} height={17} /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section faq-section">
        <div className="container">
          <div
            className="section-head"
            style={{
              margin: "0 auto 40px",
              textAlign: "center",
              maxWidth: 560,
            }}
          >
            <span className="eyebrow">Questions</span>
            <h2>Pricing FAQ</h2>
          </div>
          <div className="faq-list">
            {faqs.map((f) => (
              <details className="faq-item card" key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-banner">
            <div>
              <h2>Start free today</h2>
              <p>
                No credit card required. Upgrade only when AI features earn
                their keep.
              </p>
            </div>
            <Link to="/setup" className="btn cta-banner-btn">
              Add to Chrome <IconArrowRight width={18} height={18} />
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .billing-toggle {
          display: inline-flex;
          background: var(--surface);
          border: 1px solid var(--border-strong);
          border-radius: var(--radius-pill);
          padding: 4px;
          margin-top: 28px;
        }
        .billing-btn {
          border: none;
          background: transparent;
          padding: 10px 18px;
          border-radius: var(--radius-pill);
          font-size: 14px;
          font-weight: 500;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background-color var(--duration) ease, color var(--duration) ease;
        }
        .billing-btn.is-active { background: var(--primary); color: var(--on-primary); }
        .billing-save {
          font-size: 11px;
          background: var(--accent-soft);
          color: var(--accent);
          padding: 2px 8px;
          border-radius: var(--radius-pill);
        }
        .billing-btn.is-active .billing-save { background: rgba(255,255,255,0.2); color: var(--on-primary); }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          align-items: start;
        }
        .pricing-card {
          padding: 32px;
          position: relative;
        }
        .pricing-card.is-highlight {
          border-color: var(--primary);
          box-shadow: var(--shadow-lg);
        }
        .pricing-badge {
          position: absolute;
          top: -13px;
          right: 24px;
          background: var(--primary);
          color: var(--on-primary);
          font-size: 12px;
          font-weight: 500;
          padding: 5px 14px;
          border-radius: var(--radius-pill);
        }
        .billing-card{
          max-width:430px;
          margin-left:auto;

          padding:32px;

          background:var(--surface);

          border:1px solid var(--border);

          border-radius:24px;

          box-shadow:var(--shadow-lg);
      }

      .billing-card-header h3{
          margin:8px 0;
          font-size:26px;
      }

      .billing-card-header p{
          color:var(--text-muted);
          margin-bottom:28px;
      }

      .billing-label{
          display:inline-flex;
          padding:6px 12px;

          border-radius:999px;

          background:var(--primary-soft);

          color:var(--primary);

          font-size:12px;
          font-weight:600;
          text-transform:uppercase;
          letter-spacing:.05em;
      }

      .billing-toggle-large{
          display:flex;
          width:100%;
          padding:6px;
      }

      .billing-toggle-large .billing-btn{
          flex:1;
          justify-content:center;
          padding:14px 18px;
      }

      .billing-note{
          margin-top:24px;

          display:grid;
          gap:10px;

          color:var(--text-muted);
          font-size:14px;
      }
        .pricing-card h3 { font-size: 22px; margin-bottom: 6px; }
        .pricing-tagline { font-size: 14.5px; min-height: 44px; }
        .pricing-amount { display: flex; align-items: baseline; gap: 4px; margin: 8px 0 4px; }
        .pricing-currency { font-size: 20px; color: var(--text-muted); }
        .pricing-number { font-family: var(--font-display); font-size: 44px; font-weight: 700; }
        .pricing-period { font-size: 14px; color: var(--text-faint); }
        .pricing-billed { font-size: 13px; color: var(--text-faint); margin-bottom: 20px; }
        .pricing-card > .btn { margin: 20px 0 28px; }
        .pricing-features { display: flex; flex-direction: column; gap: 13px; }
        .pricing-features li {
          display: flex; align-items: flex-start; gap: 10px;
          font-size: 14.5px; color: var(--text);
        }
        .pricing-features svg { color: var(--accent); flex-shrink: 0; margin-top: 2px; }

        .faq-section { background: var(--bg-soft); }
        .faq-list { display: flex; flex-direction: column; gap: 14px; max-width: 760px; margin: 0 auto; }
        .faq-item { padding: 20px 24px; }
        .faq-item summary {
          cursor: pointer;
          font-weight: 600;
          font-size: 15.5px;
          color: var(--text);
          list-style: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .faq-item summary::-webkit-details-marker { display: none; }
        .faq-item summary::after {
          content: '+';
          font-size: 20px;
          color: var(--text-faint);
          margin-left: 12px;
        }
        .faq-item[open] summary::after { content: '–'; }
        .faq-item p { margin-top: 12px; font-size: 14.5px; }

        @media (max-width: 900px) {
          .pricing-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}
