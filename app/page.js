'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

const SERVICES_LIST = [
  { value: 'strategy', label: 'Strategy / Positioning' },
  { value: 'content', label: 'Content Creation' },
  { value: 'website', label: 'Website Creation' },
  { value: 'branding', label: 'Branding' },
  { value: 'ads', label: 'Paid Ads' },
];

const TIMELINE_OPTIONS = [
  { value: 'asap', label: 'ASAP' },
  { value: '1-2months', label: '1–2 months' },
  { value: '3-6months', label: '3–6 months' },
  { value: 'flexible', label: 'Flexible' },
];

const STEPS = [
  { num: '01', name: 'Discovery', desc: 'We learn your goals, audience, and competitive landscape. No assumptions — just the right questions.' },
  { num: '02', name: 'Strategy & Positioning', desc: 'We define your brand direction and go-to-market plan. You leave knowing exactly who you are and how you win.' },
  { num: '03', name: 'Build', desc: 'We execute across design, content, and digital — all under one roof. No handoffs to strangers.' },
  { num: '04', name: 'Launch & Grow', desc: 'We go live and scale results through paid and organic channels. Strategy meets momentum.' },
];

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    els.forEach((el) => observer.observe(el));

    const fallback = setTimeout(() => {
      els.forEach((el) => {
        if (!el.classList.contains('visible')) {
          el.classList.remove('reveal');
        }
      });
    }, 1500);

    return () => { observer.disconnect(); clearTimeout(fallback); };
  }, []);
}

function useNavScroll() {
  useEffect(() => {
    const nav = document.getElementById('navbar');
    if (!nav) return;
    const onScroll = () => {
      if (window.scrollY > 20) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
}

export default function Home() {
  useScrollReveal();
  useNavScroll();

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Process />
        <Services />
        <CTAForm />
      </main>
      <Footer />
    </>
  );
}

function Nav() {
  return (
    <header id="navbar">
      <nav className="nav-inner" aria-label="Main navigation">
        <a href="/" className="nav-logo" aria-label="5th Creative — home">
          <img src="/assets/logo-black.png" alt="5th Creative" />
        </a>
        <a href="#cta" className="nav-cta">Let&apos;s Talk</a>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section id="hero" aria-label="Hero">
      <img
        className="hero-bg"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_3EiySi9FiZS1xcUPg6DMyzXk0LA/hf_20260606_174859_35a2c48b-8947-4cf1-9c37-494498840632.png"
        alt=""
        loading="eager"
        fetchPriority="high"
      />
      <div className="hero-gradient" />
      <div className="hero-content">
        <h1 className="hero-heading">Attention Creates Opportunity.</h1>
        <p className="hero-sub">Build trust before the first call.</p>
        <a href="#cta" className="btn-cta">Let&apos;s Create Something Better</a>
      </div>
    </section>
  );
}

function Process() {
  return (
    <section id="process" aria-labelledby="process-heading">
      <div className="wrap">
        <p className="section-label reveal">How We Work</p>
        <h2 className="section-heading reveal" id="process-heading">Four steps from idea to momentum.</h2>
        <div className="process-steps">
          {STEPS.map((step, i) => (
            <article className={`process-card reveal reveal-delay-${i + 1}`} key={step.num}>
              <div className="process-card-header">
                <span className="process-num">{step.num}</span>
                <h3>{step.name}</h3>
              </div>
              <p>{step.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" aria-labelledby="services-heading">
      <div className="wrap">
        <p className="section-label reveal">What We Do</p>
        <h2 className="section-heading reveal" id="services-heading">Full-service creative for brands that move.</h2>
        <div className="services-list">
          {SERVICES_LIST.map((svc, i) => (
            <article className={`service-card reveal reveal-delay-${Math.min(i + 1, 4)}`} key={svc.value}>
              <div className="service-dot" aria-hidden="true" />
              <div>
                <h3>{svc.label}</h3>
                <p>{
                  svc.value === 'strategy' ? 'Define your market position and plan your moves.' :
                  svc.value === 'content' ? 'Words, visuals, and assets that connect with your audience.' :
                  svc.value === 'website' ? 'Fast, mobile-optimized sites built to convert.' :
                  svc.value === 'branding' ? 'Identities that look the part and mean something.' :
                  'Performance campaigns that turn spend into growth.'
                }</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTAForm() {
  const [status, setStatus] = useState('idle');
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedTimeline, setSelectedTimeline] = useState('');
  const formRef = useRef(null);
  const nameRef = useRef(null);
  const emailRef = useRef(null);

  function toggleService(val) {
    setSelectedServices((prev) =>
      prev.includes(val) ? prev.filter((s) => s !== val) : [...prev, val]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (status === 'loading') return;

    const fd = new FormData(e.target);
    const name = fd.get('name')?.trim() || '';
    const email = fd.get('email')?.trim() || '';
    const website = fd.get('website')?.trim() || '';
    const message = fd.get('message')?.trim() || '';

    const errs = {};
    if (!name) errs.name = true;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = true;

    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      if (errs.name) nameRef.current?.focus();
      else if (errs.email) emailRef.current?.focus();
      return;
    }

    setFieldErrors({});
    setServerError('');
    setStatus('loading');

    try {
      const services = selectedServices.map((v) =>
        SERVICES_LIST.find((s) => s.value === v)?.label || v
      );
      const timeline = TIMELINE_OPTIONS.find((t) => t.value === selectedTimeline)?.label || '';

      const res = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, website, service: services.join(', '), message: `${message}${timeline ? `\n\nTimeline: ${timeline}` : ''}` }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 422 && data.errors) {
          const errs = {};
          data.errors.forEach((err) => { errs[err.field] = true; });
          setFieldErrors(errs);
          setStatus('idle');
          return;
        }
        throw new Error(data.error || 'Something went wrong.');
      }

      setStatus('success');
    } catch (err) {
      setServerError(err.message || 'Something went wrong. Please try again or email us directly.');
      setStatus('error');
    }
  }

  function clearFieldError(field) {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  if (status === 'success') {
    return (
      <section id="cta" aria-labelledby="cta-heading">
        <div className="wrap">
          <p className="section-label">Get Started</p>
          <h2 className="section-heading" id="cta-heading">Let&apos;s Build Something Together.</h2>
          <p className="cta-sub">Book a free 30-minute strategy call. No commitment, no pressure &mdash; just clarity.</p>
          <div className="success-card" role="alert">
            <div className="success-icon" aria-hidden="true">&#10003;</div>
            <p className="title">You&apos;re in.</p>
            <p className="subtitle">Thank you. Your request has been received. A member of 5th Creative will contact you shortly.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="cta" aria-labelledby="cta-heading">
      <div className="wrap">
        <p className="section-label reveal">Get Started</p>
        <h2 className="section-heading reveal" id="cta-heading">Let&apos;s Build Something Together.</h2>
        <p className="cta-sub reveal">Book a free 30-minute strategy call. No commitment, no pressure &mdash; just clarity.</p>

        <form ref={formRef} className="form-card reveal" onSubmit={handleSubmit} noValidate>
          {serverError && (
            <div className="error-banner" role="alert">{serverError}</div>
          )}

          <div>
            <label className="form-label" htmlFor="field-name">Full Name <span className="req">*</span></label>
            <input
              ref={nameRef}
              className={`form-input${fieldErrors.name ? ' error' : ''}`}
              id="field-name"
              name="name"
              placeholder="Your full name"
              autoComplete="name"
              required
              onChange={() => clearFieldError('name')}
            />
          </div>

          <div>
            <label className="form-label" htmlFor="field-email">Email Address <span className="req">*</span></label>
            <input
              ref={emailRef}
              className={`form-input${fieldErrors.email ? ' error' : ''}`}
              id="field-email"
              name="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              required
              onChange={() => clearFieldError('email')}
            />
          </div>

          <div>
            <label className="form-label" htmlFor="field-website">Website URL</label>
            <input
              className="form-input"
              id="field-website"
              name="website"
              type="url"
              placeholder="https://yourbrand.com"
              autoComplete="url"
            />
          </div>

          <div>
            <label className="form-label">What services interest you? <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 13 }}>Select all that apply</span></label>
            <div className="service-chips">
              {SERVICES_LIST.map((svc) => (
                <button
                  key={svc.value}
                  type="button"
                  className={`service-chip${selectedServices.includes(svc.value) ? ' selected' : ''}`}
                  onClick={() => toggleService(svc.value)}
                  aria-pressed={selectedServices.includes(svc.value)}
                >
                  {svc.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label">Timeline</label>
            <div className="timeline-chips">
              {TIMELINE_OPTIONS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  className={`timeline-chip${selectedTimeline === t.value ? ' selected' : ''}`}
                  onClick={() => setSelectedTimeline((prev) => prev === t.value ? '' : t.value)}
                  aria-pressed={selectedTimeline === t.value}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label" htmlFor="field-message">Tell us about your business (please include the name)</label>
            <textarea
              className="form-input form-textarea"
              id="field-message"
              name="message"
              rows={3}
              placeholder="What does your brand need right now?"
            />
          </div>

          <button type="submit" className="form-submit" disabled={status === 'loading'} style={{ textAlign: 'center' }}>
            {status === 'loading' ? (
              <><span className="loading-spinner" aria-hidden="true" /> Submitting&hellip;</>
            ) : (
              "Let’s Grow Your Business"
            )}
          </button>
        </form>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <a href="/" aria-label="5th Creative — home">
          <img className="footer-logo" src="/assets/logo-black.png" alt="5th Creative" />
        </a>
        <a href="mailto:hello@5thcreative.com" className="footer-email">hello@5thcreative.com</a>
      </div>
    </footer>
  );
}
