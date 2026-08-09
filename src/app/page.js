"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Syne, DM_Sans } from "next/font/google";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm",
  display: "swap",
});

export default function Home() {
  const [splashDone, setSplashDone] = useState(false);
  const [splashFading, setSplashFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setSplashFading(true), 2200);
    const doneTimer = setTimeout(() => setSplashDone(true), 2900);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  return (
    <div className={`${syne.variable} ${dmSans.variable}`}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --blue: #1d6fc4;
          --blue-dark: #0f4a8a;
          --blue-light: #e8f2fc;
          --blue-mid: #2d84e0;
          --white: #ffffff;
          --slate: #f0f5fb;
          --text: #0a1628;
          --muted: #5a7090;
        }

        .splash {
          position: fixed; inset: 0; z-index: 9999;
          background: var(--blue-dark);
          display: flex; align-items: center; justify-content: center;
          flex-direction: column; gap: 20px;
          transition: opacity 0.7s cubic-bezier(.4,0,.2,1);
        }
        .splash.fading { opacity: 0; pointer-events: none; }

        .splash-logo {
          display: flex; align-items: center; gap: 14px;
          animation: splashIn 0.7s cubic-bezier(.34,1.56,.64,1) both;
        }
        .splash-icon {
          width: 56px; height: 56px; border-radius: 16px;
          background: var(--blue-mid);
          display: flex; align-items: center; justify-content: center;
        }
        .splash-icon svg { width: 30px; height: 30px; fill: white; }
        .splash-wordmark {
          font-family: var(--font-syne), 'Syne', sans-serif;
          font-weight: 800; font-size: 28px; color: white; letter-spacing: -0.5px;
        }
        .splash-wordmark span { color: #6db3f2; }

        .splash-bar-wrap {
          width: 200px; height: 3px; background: rgba(255,255,255,0.15); border-radius: 99px;
          overflow: hidden;
          animation: splashIn 0.7s 0.3s cubic-bezier(.34,1.56,.64,1) both;
        }
        .splash-bar {
          height: 100%; background: #6db3f2; border-radius: 99px;
          animation: barFill 1.8s 0.4s cubic-bezier(.4,0,.2,1) forwards;
          width: 0%;
        }
        .splash-sub {
          font-family: var(--font-dm), 'DM Sans', sans-serif;
          font-size: 13px; color: rgba(255,255,255,0.45); letter-spacing: 0.15em;
          text-transform: uppercase;
          animation: splashIn 0.7s 0.5s both;
        }

        @keyframes splashIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes barFill { to { width: 100%; } }

        .page {
          font-family: var(--font-dm), 'DM Sans', sans-serif;
          background: var(--white); color: var(--text);
          min-height: 100vh; overflow-x: hidden;
          opacity: 0; transition: opacity 0.6s ease;
        }
        .page.visible { opacity: 1; }

        /* NAV */
        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 48px;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(29, 111, 196, 0.08);
        }
        .nav-logo {
          display: flex; align-items: center; gap: 10px;
          font-family: var(--font-syne), 'Syne', sans-serif;
          font-weight: 800; font-size: 18px;
          color: var(--text); text-decoration: none;
        }
        .nav-logo-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: var(--blue); display: flex; align-items: center; justify-content: center;
        }
        .nav-logo-icon svg { width: 20px; height: 20px; fill: white; }
        .nav-logo span { color: var(--blue); }
        .nav-links { display: flex; gap: 32px; }
        .nav-links a {
          font-family: var(--font-dm), 'DM Sans', sans-serif;
          font-size: 14px; color: var(--muted); text-decoration: none; font-weight: 500;
          transition: color 0.2s;
        }
        .nav-links a:hover { color: var(--blue); }
        .nav-cta {
          padding: 10px 22px; border-radius: 12px;
          background: var(--blue); color: white;
          font-family: var(--font-dm), 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 500; text-decoration: none;
          transition: background 0.2s, transform 0.15s;
        }
        .nav-cta:hover { background: var(--blue-dark); transform: translateY(-1px); }

        /* HERO */
        .hero {
          min-height: 100vh;
          display: grid; grid-template-columns: 1fr 1fr;
          align-items: center;
          padding: 120px 48px 80px;
          gap: 64px;
          position: relative;
          overflow: hidden;
        }
        .hero::before {
          content: '';
          position: absolute; top: -120px; right: -80px;
          width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(29,111,196,0.07) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero::after {
          content: '';
          position: absolute; bottom: -80px; left: 200px;
          width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(29,111,196,0.05) 0%, transparent 70%);
          pointer-events: none;
        }

        .hero-left { position: relative; z-index: 1; }

        .badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 14px 6px 8px; border-radius: 99px;
          background: var(--blue-light); margin-bottom: 28px;
          border: 1px solid rgba(29,111,196,0.15);
          animation: fadeUp 0.7s 0.1s both;
        }
        .badge-dot {
          width: 22px; height: 22px; border-radius: 99px;
          background: var(--blue); display: flex; align-items: center; justify-content: center;
        }
        .badge-dot svg { width: 12px; height: 12px; fill: white; }
        .badge-text {
          font-family: var(--font-dm), 'DM Sans', sans-serif;
          font-size: 12px; font-weight: 600; color: var(--blue);
          letter-spacing: 0.08em; text-transform: uppercase;
        }

        h1 {
          font-family: var(--font-syne), 'Syne', sans-serif;
          font-size: clamp(38px, 4.5vw, 58px);
          font-weight: 800; line-height: 1.1;
          letter-spacing: -1.5px; color: var(--text);
          margin-bottom: 24px;
          animation: fadeUp 0.7s 0.2s both;
        }
        h1 .accent { color: var(--blue); }

        .hero-desc {
          font-family: var(--font-dm), 'DM Sans', sans-serif;
          font-size: 17px; line-height: 1.75; color: var(--muted);
          max-width: 500px; margin-bottom: 40px;
          animation: fadeUp 0.7s 0.3s both;
        }

        .hero-btns {
          display: flex; gap: 12px; flex-wrap: wrap;
          animation: fadeUp 0.7s 0.4s both;
        }
        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; border-radius: 14px;
          background: var(--blue); color: white;
          font-family: var(--font-dm), 'DM Sans', sans-serif;
          font-size: 15px; font-weight: 500; text-decoration: none;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 24px rgba(29,111,196,0.25);
        }
        .btn-primary:hover { background: var(--blue-dark); transform: translateY(-2px); box-shadow: 0 8px 32px rgba(29,111,196,0.35); }
        .btn-primary svg { width: 18px; height: 18px; fill: white; }

        .btn-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; border-radius: 14px;
          border: 1.5px solid rgba(29,111,196,0.2); background: white;
          color: var(--text);
          font-family: var(--font-dm), 'DM Sans', sans-serif;
          font-size: 15px; font-weight: 500; text-decoration: none;
          transition: border-color 0.2s, background 0.2s, transform 0.15s;
        }
        .btn-secondary:hover { border-color: var(--blue); background: var(--blue-light); transform: translateY(-2px); }

        .hero-stats {
          display: flex; gap: 32px; margin-top: 48px;
          animation: fadeUp 0.7s 0.5s both;
        }
        .stat-num {
          font-family: var(--font-syne), 'Syne', sans-serif;
          font-size: 28px; font-weight: 800; color: var(--text); line-height: 1;
        }
        .stat-num span { color: var(--blue); }
        .stat-label {
          font-family: var(--font-dm), 'DM Sans', sans-serif;
          font-size: 13px; color: var(--muted); margin-top: 4px;
        }

        /* HERO RIGHT */
        .hero-right {
          position: relative; height: 540px;
          animation: fadeUp 0.8s 0.3s both;
        }
        .img-card {
          position: absolute; border-radius: 20px; overflow: hidden;
          box-shadow: 0 20px 60px rgba(10,22,40,0.12);
          border: 3px solid white;
        }
        .img-card img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .img-main { width: 78%; height: 360px; top: 0; right: 0; }
        .img-secondary { width: 50%; height: 210px; bottom: 0; left: 0; }

        .floating-chip {
          position: absolute; z-index: 10;
          background: white; border-radius: 14px;
          padding: 10px 16px;
          box-shadow: 0 8px 32px rgba(10,22,40,0.13);
          display: flex; align-items: center; gap: 10px;
        }
        .chip-icon {
          width: 32px; height: 32px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
        }
        .chip-icon.blue { background: var(--blue-light); }
        .chip-icon.blue svg { fill: var(--blue); }
        .chip-icon svg { width: 18px; height: 18px; }
        .chip-label {
          font-family: var(--font-dm), 'DM Sans', sans-serif;
          font-size: 11px; color: var(--muted); font-weight: 500;
        }
        .chip-value {
          font-family: var(--font-syne), 'Syne', sans-serif;
          font-size: 14px; font-weight: 700; color: var(--text);
        }

        .chip-orders { top: 20px; left: -20px; animation: float1 3.5s ease-in-out infinite; }
        .chip-revenue { bottom: 90px; right: -16px; animation: float2 4s ease-in-out infinite; }

        @keyframes float1 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes float2 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(6px); } }

        /* FEATURES */
        .features-strip {
          background: var(--slate);
          padding: 80px 48px;
          border-top: 1px solid rgba(29,111,196,0.07);
        }
        .strip-label {
          text-align: center;
          font-family: var(--font-dm), 'DM Sans', sans-serif;
          font-size: 12px; font-weight: 600;
          color: var(--blue); letter-spacing: 0.2em; text-transform: uppercase;
          margin-bottom: 16px;
        }
        .strip-title {
          font-family: var(--font-syne), 'Syne', sans-serif;
          font-size: clamp(28px, 3vw, 40px); font-weight: 800;
          color: var(--text); text-align: center; letter-spacing: -1px;
          margin-bottom: 56px;
        }
        .features-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
          max-width: 1100px; margin: 0 auto;
        }
        .feature-card {
          background: white; border-radius: 20px;
          padding: 32px; border: 1px solid rgba(29,111,196,0.08);
          transition: transform 0.25s, box-shadow 0.25s;
          position: relative; overflow: hidden;
        }
        .feature-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, var(--blue), #6db3f2);
          opacity: 0; transition: opacity 0.25s;
        }
        .feature-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(29,111,196,0.1); }
        .feature-card:hover::before { opacity: 1; }
        .feature-icon {
          width: 48px; height: 48px; border-radius: 13px;
          background: var(--blue-light); display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
        }
        .feature-icon svg { width: 24px; height: 24px; fill: var(--blue); }
        .feature-title {
          font-family: var(--font-syne), 'Syne', sans-serif;
          font-size: 17px; font-weight: 700; margin-bottom: 10px; color: var(--text);
        }
        .feature-desc {
          font-family: var(--font-dm), 'DM Sans', sans-serif;
          font-size: 14px; color: var(--muted); line-height: 1.65;
        }

        /* PORTALS */
        .portals {
          padding: 100px 48px;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 64px; align-items: center;
          max-width: 1200px; margin: 0 auto;
        }
        .portals-img-wrap {
          position: relative; border-radius: 24px; overflow: hidden;
          height: 440px; box-shadow: 0 24px 64px rgba(10,22,40,0.13);
        }
        .portals-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
        .portals-badge {
          position: absolute; top: 20px; left: 20px;
          background: white; border-radius: 12px;
          padding: 10px 16px; box-shadow: 0 4px 16px rgba(10,22,40,0.1);
          font-family: var(--font-dm), 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 600; color: var(--blue);
          display: flex; align-items: center; gap: 6px;
        }
        .portals-badge-dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; flex-shrink: 0; }

        .portals-text .strip-label { text-align: left; margin-bottom: 14px; }
        .portals-text h2 {
          font-family: var(--font-syne), 'Syne', sans-serif;
          font-size: clamp(28px, 3vw, 40px); font-weight: 800;
          color: var(--text); letter-spacing: -1px;
          margin-bottom: 20px; line-height: 1.15;
        }
        .portals-text p {
          font-family: var(--font-dm), 'DM Sans', sans-serif;
          font-size: 16px; color: var(--muted); line-height: 1.75; margin-bottom: 32px;
        }

        .portal-cards { display: flex; flex-direction: column; gap: 12px; }
        .portal-card {
          border-radius: 16px; padding: 18px 20px;
          border: 1.5px solid rgba(29,111,196,0.1);
          display: flex; align-items: flex-start; gap: 14px;
          transition: border-color 0.2s, background 0.2s;
          cursor: default;
        }
        .portal-card:hover { border-color: var(--blue); background: var(--blue-light); }
        .portal-card-icon {
          width: 38px; height: 38px; border-radius: 10px;
          background: var(--blue); display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .portal-card-icon.light { background: var(--blue-light); }
        .portal-card-icon svg { width: 20px; height: 20px; fill: white; }
        .portal-card-icon.light svg { fill: var(--blue); }
        .portal-card-name {
          font-family: var(--font-syne), 'Syne', sans-serif;
          font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 4px;
        }
        .portal-card-desc {
          font-family: var(--font-dm), 'DM Sans', sans-serif;
          font-size: 13px; color: var(--muted);
        }

        /* DB SECTION */
        .db-section {
          background: var(--blue-dark);
          padding: 80px 48px;
          text-align: center;
          position: relative; overflow: hidden;
        }
        .db-section::before {
          content: '';
          position: absolute; inset: 0;
          background: url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1400&q=80') center/cover no-repeat;
          opacity: 0.08; pointer-events: none;
        }
        .db-section-inner { position: relative; z-index: 1; }
        .db-label {
          font-family: var(--font-dm), 'DM Sans', sans-serif;
          font-size: 12px; font-weight: 600; color: #6db3f2;
          letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 16px;
        }
        .db-title {
          font-family: var(--font-syne), 'Syne', sans-serif;
          font-size: clamp(28px, 3vw, 42px); font-weight: 800;
          color: white; letter-spacing: -1px; margin-bottom: 20px;
        }
        .db-desc {
          font-family: var(--font-dm), 'DM Sans', sans-serif;
          font-size: 16px; color: rgba(255,255,255,0.6);
          max-width: 520px; margin: 0 auto 48px; line-height: 1.75;
        }
        .db-pills { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .db-pill {
          padding: 10px 20px; border-radius: 99px;
          border: 1px solid rgba(109,179,242,0.3);
          background: rgba(109,179,242,0.08);
          color: #aed4f5;
          font-family: var(--font-dm), 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500;
        }

        /* CTA */
        .cta-section {
          padding: 100px 48px;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 64px; align-items: center;
          max-width: 1200px; margin: 0 auto;
        }
        .cta-left h2 {
          font-family: var(--font-syne), 'Syne', sans-serif;
          font-size: clamp(28px, 3vw, 44px); font-weight: 800;
          color: var(--text); letter-spacing: -1px; line-height: 1.15;
          margin-bottom: 20px;
        }
        .cta-left h2 .accent { color: var(--blue); }
        .cta-left p {
          font-family: var(--font-dm), 'DM Sans', sans-serif;
          font-size: 16px; color: var(--muted); line-height: 1.75; margin-bottom: 36px;
        }

        .cta-right-img {
          border-radius: 24px; overflow: hidden;
          height: 360px; box-shadow: 0 24px 64px rgba(10,22,40,0.13);
        }
        .cta-right-img img { width: 100%; height: 100%; object-fit: cover; }

        /* FOOTER */
        footer {
          background: var(--text); color: rgba(255,255,255,0.4);
          padding: 32px 48px;
          display: flex; align-items: center; justify-content: space-between;
          font-family: var(--font-dm), 'DM Sans', sans-serif;
          font-size: 13px;
        }
        footer .nav-logo { color: white; }
        footer .nav-logo span { color: #6db3f2; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 900px) {
          .hero { grid-template-columns: 1fr; padding: 120px 24px 60px; }
          .hero-right { height: 300px; }
          .features-grid { grid-template-columns: 1fr; }
          .portals, .cta-section { grid-template-columns: 1fr; padding: 60px 24px; }
          nav { padding: 16px 24px; }
          .nav-links { display: none; }
          .hero::before, .hero::after { display: none; }
        }
      `}</style>

      {/* SPLASH */}
      {!splashDone && (
        <div className={`splash${splashFading ? " fading" : ""}`}>
          <div className="splash-logo">
            <div className="splash-icon">
              <svg viewBox="0 0 24 24"><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM4 3h16v2H4zm0 14h16v2H4z"/></svg>
            </div>
            <span className="splash-wordmark">Smart<span>Retail</span> Pro</span>
          </div>
          <div className="splash-bar-wrap">
            <div className="splash-bar" />
          </div>
          <p className="splash-sub">Initializing platform</p>
        </div>
      )}

      {/* MAIN PAGE */}
      <div className={`page${splashDone ? " visible" : ""}`}>

        {/* NAV */}
        <nav>
          <a href="/" className="nav-logo">
            <div className="nav-logo-icon">
              <svg viewBox="0 0 24 24"><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM4 3h16v2H4zm0 14h16v2H4z"/></svg>
            </div>
            Smart<span>Retail</span> Pro
          </a>
          <div className="nav-links">
            <a href="#">Features</a>
            <a href="#">Analytics</a>
            <a href="#">Inventory</a>
            <a href="#">Pricing</a>
          </div>
          <Link href="/auth" className="nav-cta">Sign In</Link>
        </nav>

        {/* HERO */}
        <section className="hero">
          <div className="hero-left">
            <div className="badge">
              <div className="badge-dot">
                <svg viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <span className="badge-text">Enterprise-grade retail platform · Release B</span>
            </div>

            <h1>
              Elevate retail ops with <span className="accent">database-first</span> intelligence.
            </h1>

            <p className="hero-desc">
              Smart Retail Pro centralizes inventory, sales, customer workflows, and analytics through PostgreSQL automation — triggers, stored procedures, and advanced views.
            </p>

            <div className="hero-btns">
              <Link href="/auth" className="btn-primary">
                <svg viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
                Start with Login
              </Link>
              <Link href="/admin/dashboard" className="btn-secondary">
                View Admin Demo →
              </Link>
            </div>

            <div className="hero-stats">
              <div>
                <div className="stat-num">99<span>%</span></div>
                <div className="stat-label">Uptime SLA</div>
              </div>
              <div style={{width:"1px", background:"rgba(29,111,196,0.15)"}} />
              <div>
                <div className="stat-num">3<span>s</span></div>
                <div className="stat-label">Avg. query time</div>
              </div>
              <div style={{width:"1px", background:"rgba(29,111,196,0.15)"}} />
              <div>
                <div className="stat-num">50<span>k+</span></div>
                <div className="stat-label">SKUs supported</div>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <div className="img-card img-main">
              <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&q=80" alt="Modern retail store" />
            </div>
            <div className="img-card img-secondary">
              <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80" alt="Retail analytics" />
            </div>
            <div className="floating-chip chip-orders">
              <div className="chip-icon blue">
                <svg viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
              </div>
              <div>
                <div className="chip-label">Today's Orders</div>
                <div className="chip-value">1,284</div>
              </div>
            </div>
            <div className="floating-chip chip-revenue">
              <div className="chip-icon blue">
                <svg viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
              </div>
              <div>
                <div className="chip-label">Revenue Today</div>
                <div className="chip-value">$48,920</div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="features-strip">
          <div className="strip-label">What we offer</div>
          <div className="strip-title">Everything your retail team needs</div>
          <div className="features-grid">
            {[
              { icon: <svg viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>, title: "Real-time Analytics", desc: "Monitor stock levels and sales velocity as they happen with marketplace-ready dashboards and analytical ranking views." },
              { icon: <svg viewBox="0 0 24 24"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 01-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 011-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 011.52 0C14.51 3.81 17 5 19 5a1 1 0 011 1z"/></svg>, title: "Smart Inventory", desc: "Automated SKU management, low-stock alerts, and restock workflows driven by database triggers and stored procedures." },
              { icon: <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>, title: "Customer Management", desc: "Unified customer profiles with purchase history, wishlists, and segmentation powered by advanced PostgreSQL views." },
              { icon: <svg viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>, title: "Order Processing", desc: "End-to-end order lifecycle from cart to fulfillment with automated status updates and customer notifications." },
              { icon: <svg viewBox="0 0 24 24"><path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"/></svg>, title: "DB Insights", desc: "Deep PostgreSQL query plans, trigger logs, stored procedure executions, and ADBMS compliance reports." },
              { icon: <svg viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>, title: "Role-based Access", desc: "Secure portals for both customers and administrators with fine-grained permission controls and audit logs." },
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* PORTALS */}
        <section style={{background:"white"}}>
          <div className="portals">
            <div className="portals-img-wrap">
              <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=80" alt="Admin dashboard analytics" />
              <div className="portals-badge">
                <span className="portals-badge-dot" />
                System Online
              </div>
            </div>
            <div className="portals-text">
              <div className="strip-label">Access portals</div>
              <h2>Secure role-based portals for every user.</h2>
              <p>Dedicated experiences for customers and administrators — each built for their unique workflows with data fully powered by PostgreSQL views and procedures.</p>
              <div className="portal-cards">
                <div className="portal-card">
                  <div className="portal-card-icon">
                    <svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                  </div>
                  <div>
                    <div className="portal-card-name">Customer Portal</div>
                    <div className="portal-card-desc">Browse products, manage wishlist, place orders, and track purchase history.</div>
                  </div>
                </div>
                <div className="portal-card">
                  <div className="portal-card-icon light">
                    <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                  </div>
                  <div>
                    <div className="portal-card-name">Admin Dashboard</div>
                    <div className="portal-card-desc">Manage inventory, orders, customers, analytics, and advanced database insights.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DB SECTION */}
        <section className="db-section">
          <div className="db-section-inner">
            <div className="db-label">ADBMS Features</div>
            <h2 className="db-title">Designed for Viva Demos</h2>
            <p className="db-desc">Full showcase of advanced database management — query plans, stored procedures, triggers, analytical ranking, and materialized views included.</p>
            <div className="db-pills">
              {["PostgreSQL Views", "Stored Procedures", "DB Triggers", "Query Plans", "Analytical Ranking", "Row-level Security"].map((t) => (
                <div key={t} className="db-pill">{t}</div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <div className="cta-left">
            <h2>Ready to <span className="accent">transform</span> your retail operations?</h2>
            <p>Join the platform that puts database intelligence at the heart of your retail workflows. Start with a secure login and explore both portals today.</p>
            <div className="hero-btns">
              <Link href="/auth" className="btn-primary">
                <svg viewBox="0 0 24 24" style={{width:18,height:18,fill:"white"}}><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
                Get Started Now
              </Link>
              <Link href="/admin/dashboard" className="btn-secondary">Admin Demo →</Link>
            </div>
          </div>
          <div className="cta-right-img">
            <img src="https://images.unsplash.com/photo-1556742111-a301076d9d18?w=900&q=80" alt="Retail team at work" />
          </div>
        </section>

        {/* FOOTER */}
        <footer>
          <a href="/" className="nav-logo">
            <div className="nav-logo-icon">
              <svg viewBox="0 0 24 24"><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM4 3h16v2H4zm0 14h16v2H4z"/></svg>
            </div>
            Smart<span>Retail</span> Pro
          </a>
          <span>© 2025 SmartRetail Pro. All rights reserved.</span>
        </footer>

      </div>
    </div>
  );
}
