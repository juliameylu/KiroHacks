import './ReflectLanding.css'

// ── Asset URLs from Figma ──────────────────────────────────────────────────
const logoUrl =
  'https://www.figma.com/api/mcp/asset/5dd1aec5-8d37-47a6-b7ad-e2b48437e507'
const heroBgUrl =
  'https://www.figma.com/api/mcp/asset/61dbe828-b565-4186-af27-89d4c9e629bf'
const heroAppUrl =
  'https://www.figma.com/api/mcp/asset/c35d19dd-e675-45d1-b60e-b408ff9e3c1b'
const aiSparkUrl =
  'https://www.figma.com/api/mcp/asset/5b1862a3-e0e1-4540-9544-edc1b3f1822d'
const playIconUrl =
  'https://www.figma.com/api/mcp/asset/5162ced3-1046-4386-974b-02478bb68171'

// Feature card icons
const iconSpeed =
  'https://www.figma.com/api/mcp/asset/a688f8e9-3028-4156-9359-a86d4a449b4b'
const iconNetwork =
  'https://www.figma.com/api/mcp/asset/6548a16b-87bd-4444-8cb4-e8a6d46a5d47'
const iconIos =
  'https://www.figma.com/api/mcp/asset/50c5dff5-dd50-4533-8f71-3f540c8369a5'
const iconEncrypt =
  'https://www.figma.com/api/mcp/asset/daf03e69-c30b-41b5-967f-e2af535c061e'
const iconCalendar =
  'https://www.figma.com/api/mcp/asset/74a4e990-a884-45eb-bd33-fae92cc9278a'
const iconPublish =
  'https://www.figma.com/api/mcp/asset/5e316af0-04a6-4f33-9092-5b86f5df7f29'
const iconCapture =
  'https://www.figma.com/api/mcp/asset/5d71e112-c3dc-43cc-bbdf-52637e2b7e47'
const iconSearch =
  'https://www.figma.com/api/mcp/asset/5a543c5a-dc5b-4977-8b7d-82e09bbfbd62'

// ── Data ──────────────────────────────────────────────────────────────────
const NAV_LINKS = ['Product', 'Pricing', 'Company', 'Blog', 'Changelog']

const FEATURES = [
  { icon: iconSpeed,    title: 'Built for speed',         desc: 'Instantly sync your notes across devices' },
  { icon: iconNetwork,  title: 'Networked notes',          desc: 'Form a graph of ideas with backlinked notes' },
  { icon: iconIos,      title: 'iOS app',                  desc: 'Capture ideas on the go, online or offline' },
  { icon: iconEncrypt,  title: 'End-to-end encryption',    desc: 'Only you can access your notes' },
  { icon: iconCalendar, title: 'Calendar integration',     desc: 'Keep track of meetings and agendas' },
  { icon: iconPublish,  title: 'Publishing',               desc: 'Share anything you write with one click' },
  { icon: iconCapture,  title: 'Instant capture',          desc: 'Save snippets from your browser and Kindle' },
  { icon: iconSearch,   title: 'Frictionless search',      desc: 'Easily recall and index past notes and ideas' },
]

// ── Component ─────────────────────────────────────────────────────────────
export default function ReflectLanding() {
  return (
    <div className="rl-root">
      {/* ── Header ── */}
      <header className="rl-header">
        <div className="rl-header-inner">
          {/* Logo */}
          <a href="#" className="rl-logo" aria-label="Reflect home">
            <img src={logoUrl} alt="" className="rl-logo-img" />
            <span className="rl-logo-name">Reflect</span>
          </a>

          {/* Nav */}
          <nav className="rl-nav" aria-label="Main navigation">
            <ul className="rl-nav-list">
              {NAV_LINKS.map((link) => (
                <li key={link}>
                  <a href="#" className="rl-nav-link">{link}</a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Actions */}
          <div className="rl-header-actions">
            <a href="#" className="rl-login">Login</a>
            <a href="#" className="rl-btn-primary">Start free trial</a>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="rl-hero" aria-label="Hero">
        {/* Concentric orbit rings */}
        <div className="rl-hero-bg" aria-hidden="true">
          <img src={heroBgUrl} alt="" className="rl-hero-bg-img" />
          <div className="rl-orbit rl-orbit-lg" />
          <div className="rl-orbit rl-orbit-md" />
          <div className="rl-orbit rl-orbit-sm" />
        </div>

        <div className="rl-hero-content">
          {/* Badge */}
          <div className="rl-badge">
            <img src={aiSparkUrl} alt="" className="rl-badge-icon" />
            <span>New: Our AI integration just landed</span>
          </div>

          {/* Headline */}
          <h1 className="rl-hero-title">Think better with Reflect</h1>
          <p className="rl-hero-sub">Never miss a note, idea or connection.</p>
        </div>

        {/* App screenshot / video preview */}
        <div className="rl-hero-video">
          <div className="rl-hero-video-frame">
            <img src={heroAppUrl} alt="Reflect app screenshot" className="rl-hero-video-img" />
          </div>
          {/* Gradient fade at bottom */}
          <div className="rl-hero-video-fade" aria-hidden="true" />
          {/* Play button */}
          <button className="rl-play-btn" aria-label="Watch demo video">
            <img src={playIconUrl} alt="" className="rl-play-icon" />
          </button>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="rl-features" aria-label="Features">
        <div className="rl-features-grid">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="rl-feature-card" data-index={i}>
              <img src={f.icon} alt="" className="rl-feature-icon" />
              <h3 className="rl-feature-title">{f.title}</h3>
              <p className="rl-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
