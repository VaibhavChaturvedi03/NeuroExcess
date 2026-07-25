import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero.jsx'
import { IconDownload, IconSettings, IconCheck, IconPuzzle, IconArrowRight } from '../components/Icons.jsx'

// Flip this once the extension is live on the Chrome Web Store.
// Everything below is provisioned for both states so the page
// doesn't need a rebuild at launch — just this flag and the URL.
const IS_LIVE = false
const CHROME_STORE_URL = 'https://chromewebstore.google.com/'

const steps = [
  {
    icon: IconDownload,
    title: 'Add NeuroAccess to Chrome',
    text: 'Install from the Chrome Web Store. It only takes a few seconds and there is no account required to start.',
  },
  {
    icon: IconPuzzle,
    title: 'Pin the extension',
    text: 'Click the puzzle-piece icon in your toolbar and pin NeuroAccess so it is always one click away.',
  },
  {
    icon: IconSettings,
    title: 'Pick a starting profile',
    text: 'Choose Default, Blind, Low Vision, or Dyslexic. You can fine-tune or switch profiles per site at any time.',
  },
  {
    icon: IconCheck,
    title: 'Run your first audit',
    text: 'Open any page and click "Fix this page." NeuroAccess shows an issue summary, then applies safe fixes instantly.',
  },
]

export default function Setup() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
  }

  return (
    <>
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Setup guide</span>
            <h2>What installing looks like</h2>
            <p>
              This is the exact flow you'll follow once the extension is
              published — provisioned now so nothing changes at launch.
            </p>
          </div>

          <div className="setup-layout">
            <div className="steps-list">
              {steps.map((s, i) => (
                <div className="step-row" key={s.title}>
                  <div className="step-number">
                    {String(i + 1).padStart(2, "0")}
                  </div>

                  <div className="step-icon">
                    <s.icon width={22} height={22} />
                  </div>

                  <div className="step-body">
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                </div>
              ))}

              <div className="setup-cta">
                <Link to="/setup" className="btn btn-primary btn-lg">
                  Get the Extension
                  <IconArrowRight width={18} height={18} />
                </Link>
              </div>
            </div>

            <div className="setup-graphic">
              <div className="browser-window">
                <div className="browser-top">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                <div className="browser-content">
                  <div className="browser-card active">
                    <div className="browser-icon"></div>
                    <div>
                      <h4>Low Vision</h4>
                      <p>Contrast Enhanced</p>
                    </div>
                  </div>

                  <div className="browser-card">
                    <div className="browser-icon"></div>
                    <div>
                      <h4>Screen Reader</h4>
                      <p>Alt text generated</p>
                    </div>
                  </div>

                  <div className="browser-card">
                    <div className="browser-icon"></div>
                    <div>
                      <h4>Keyboard Mode</h4>
                      <p>Focus improved</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-banner">
            <div>
              <h2>Want early access?</h2>
              <p>
                We're inviting a small group of testers before the public
                launch.
              </p>
            </div>
            <Link to="/contact" className="btn cta-banner-btn">
              Request early access <IconArrowRight width={18} height={18} />
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .waitlist-form {
          display: flex;
          gap: 10px;
          margin-top: 28px;
          max-width: 460px;
          flex-wrap: wrap;
        }
        .waitlist-form input {
          flex: 1;
          min-width: 220px;
          padding: 13px 18px;
          border-radius: var(--radius-pill);
          border: 1px solid var(--border-strong);
          background: var(--surface);
          color: var(--text);
        }
        .setup-layout{
    display:grid;
    grid-template-columns:1.2fr .9fr;
    gap:70px;
    align-items:start;
}

.setup-cta{
    margin-top:40px;
}

.setup-graphic {
    display: flex;
    justify-content: center;
    position: sticky;
    top: 120px;
    transform: translateX(60px); 
    transform: translateY(-30px);
}

.browser-window{
    width:340px;
    border-radius:22px;
    overflow:hidden;
    background:var(--surface);
    border:1px solid var(--border);
    box-shadow:var(--shadow-lg);
}

.browser-top{
    height:42px;
    border-bottom:1px solid var(--border);
    display:flex;
    align-items:center;
    gap:8px;
    padding:0 16px;
    background:var(--bg-soft);
}

.browser-top span{
    width:10px;
    height:10px;
    border-radius:50%;
    background:var(--border-strong);
}

.browser-content{
    padding:22px;
    display:flex;
    flex-direction:column;
    gap:16px;
}

.browser-card{
    display:flex;
    gap:16px;
    align-items:center;
    padding:16px;
    border-radius:14px;
    border:1px solid var(--border);
    background:var(--bg-soft);
    transition:.25s;
}

.browser-card.active{
    border-color:var(--primary);
    box-shadow:0 0 0 3px var(--primary-soft);
}

.browser-icon{
    width:42px;
    height:42px;
    border-radius:12px;
    background:var(--primary-soft);
    position:relative;
}

.browser-icon::after{
    content:"✓";
    position:absolute;
    inset:0;
    display:grid;
    place-items:center;
    color:var(--primary);
    font-weight:700;
}

.browser-card h4{
    margin:0;
    font-size:15px;
}

.browser-card p{
    margin:4px 0 0;
    font-size:13px;
    color:var(--text-muted);
}

@media(max-width:900px){

.setup-layout{
    grid-template-columns:1fr;
}

.setup-graphic{
    display:none;
}

}
        .waitlist-form input:focus { border-color: var(--primary); }
        .waitlist-success {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px 20px;
          border-radius: var(--radius-pill);
          background: var(--accent-soft);
          color: var(--accent);
          font-weight: 500;
          font-size: 14.5px;
        }
        .sr-only {
          position: absolute;
          width: 1px; height: 1px;
          overflow: hidden;
          clip: rect(0 0 0 0);
        }

        .steps-list { display: flex; flex-direction: column; gap: 4px; }
        .step-row {
          display: grid;
          grid-template-columns: 56px 52px 1fr;
          gap: 20px;
          align-items: flex-start;
          padding: 22px 0;
          border-bottom: 1px solid var(--border);
        }
        .step-row:last-child { border-bottom: none; }
        .step-number {
          font-family: var(--font-mono);
          font-size: 14px;
          color: var(--text-faint);
          padding-top: 12px;
        }
        .step-icon {
          width: 52px; height: 52px;
          border-radius: 14px;
          background: var(--primary-soft);
          color: var(--primary);
          display: flex; align-items: center; justify-content: center;
        }
        .step-body h3 { font-size: 17px; margin-bottom: 6px; }
        .step-body p { margin: 0; font-size: 14.5px; }

        .dev-install-section { background: var(--bg-soft); }
        .dev-install { padding: 36px; max-width: 760px; margin: 0 auto; }
        .dev-install-head { margin-bottom: 20px; }
        .dev-install-steps { display: flex; flex-direction: column; gap: 12px; padding-left: 20px; }
        .dev-install-steps li { font-size: 14.5px; color: var(--text-muted); }
        .dev-install-steps code {
          font-family: var(--font-mono);
          background: var(--bg-soft);
          border: 1px solid var(--border);
          padding: 2px 6px;
          border-radius: 5px;
          font-size: 13px;
          color: var(--text);
        }

        @media (max-width: 600px) {
          .step-row { grid-template-columns: 44px 1fr; }
          .step-number { display: none; }
        }
      `}</style>
    </>
  );
}
