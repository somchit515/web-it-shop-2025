// src/components/layout/Footer.jsx
import React, { useState } from "react";

function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setEmail("");
    }, 2500);
  };

  return (
    <>
      <style>{`
        :root {
          --ft-bg-1: #0b1020;
          --ft-bg-2: #131a2e;
          --ft-text: #f1f5f9;
          --ft-muted: #94a3b8;
          --ft-muted-soft: #cbd5e1;
          --ft-primary: #3b82f6;
          --ft-primary-light: #60a5fa;
          --ft-accent: #c084fc;
          --ft-accent-2: #06b6d4;
          --ft-border: rgba(255, 255, 255, 0.08);
          --ft-border-glow: rgba(99, 102, 241, 0.35);
          --ft-radius: 14px;
          --ft-radius-lg: 20px;
          --ft-font: "Noto Sans Lao", "Inter", "Phetsarath OT", "Segoe UI", Roboto, sans-serif;
          --ft-ease: cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* ================ FOOTER WRAPPER ================ */
        footer.site-footer {
          position: relative;
          font-family: var(--ft-font);
          color: var(--ft-text);
          padding: 64px 24px 0;
          background:
            radial-gradient(800px 400px at 15% 10%, rgba(99, 102, 241, 0.18), transparent 60%),
            radial-gradient(700px 400px at 85% 30%, rgba(192, 132, 252, 0.15), transparent 60%),
            radial-gradient(600px 400px at 50% 100%, rgba(6, 182, 212, 0.12), transparent 70%),
            linear-gradient(180deg, var(--ft-bg-2) 0%, var(--ft-bg-1) 100%);
          overflow: hidden;
        }

        /* Top gradient accent line */
        footer.site-footer::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(59, 130, 246, 0.5) 25%,
            rgba(192, 132, 252, 0.7) 50%,
            rgba(6, 182, 212, 0.5) 75%,
            transparent 100%
          );
        }

        /* Subtle grid pattern */
        footer.site-footer::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px);
          background-size: 32px 32px;
          mask-image: linear-gradient(180deg, black 0%, transparent 70%);
          -webkit-mask-image: linear-gradient(180deg, black 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .footer-inner {
          position: relative;
          z-index: 1;
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1.2fr;
          gap: 48px;
          padding-bottom: 48px;
        }

        /* ================ BRAND COLUMN ================ */
        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .footer-brand-top {
          display: flex;
          align-items: center;
          gap: 14px;
          text-decoration: none;
        }

        .brand-badge {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #818cf8, #c084fc);
          padding: 10px;
          flex-shrink: 0;
          box-shadow: 0 12px 32px rgba(129, 140, 248, 0.45);
          position: relative;
          overflow: hidden;
        }
        .brand-badge::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent 50%);
        }
        .brand-badge img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          position: relative;
          z-index: 1;
        }

        .brand-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: white;
          margin: 0;
          letter-spacing: 0.5px;
        }
        .brand-tagline {
          font-size: 0.78rem;
          color: var(--ft-muted);
          font-weight: 500;
          margin-top: 2px;
        }

        .brand-desc {
          color: var(--ft-muted-soft);
          font-size: 0.94rem;
          line-height: 1.65;
          max-width: 360px;
        }

        /* Trust badges */
        .trust-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 4px;
        }
        .trust-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--ft-border);
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--ft-muted-soft);
          transition: all 0.25s var(--ft-ease);
        }
        .trust-chip:hover {
          background: rgba(192, 132, 252, 0.1);
          border-color: var(--ft-border-glow);
          color: white;
          transform: translateY(-1px);
        }
        .trust-chip i {
          color: var(--ft-primary-light);
          font-size: 0.85rem;
        }

        /* ================ LINKS COLUMN ================ */
        .links-col h4 {
          color: white;
          font-size: 0.95rem;
          font-weight: 800;
          margin: 0 0 18px 0;
          letter-spacing: 0.3px;
          position: relative;
          padding-left: 14px;
        }
        .links-col h4::before {
          content: "";
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 16px;
          border-radius: 4px;
          background: linear-gradient(180deg, var(--ft-primary), var(--ft-accent));
        }

        .links-col ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .links-col a {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--ft-muted);
          text-decoration: none;
          font-size: 0.92rem;
          font-weight: 500;
          transition: all 0.2s var(--ft-ease);
          position: relative;
        }
        .links-col a::before {
          content: "";
          width: 0;
          height: 1.5px;
          background: linear-gradient(90deg, var(--ft-primary), var(--ft-accent));
          border-radius: 2px;
          transition: width 0.25s var(--ft-ease);
        }
        .links-col a:hover {
          color: white;
          transform: translateX(2px);
        }
        .links-col a:hover::before {
          width: 14px;
          margin-right: 4px;
        }

        /* ================ CONTACT / NEWSLETTER ================ */
        .footer-contact {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.01));
          border: 1px solid var(--ft-border);
          border-radius: var(--ft-radius-lg);
          padding: 24px;
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }
        .footer-contact::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--ft-primary), var(--ft-accent), var(--ft-accent-2));
        }

        .contact-title {
          color: white;
          font-weight: 800;
          margin: 0 0 18px 0;
          font-size: 1rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .contact-title i {
          color: var(--ft-accent);
        }

        .contact-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 18px;
        }
        .contact-line {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          color: var(--ft-muted-soft);
          font-size: 0.88rem;
          line-height: 1.5;
        }
        .contact-icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid rgba(99, 102, 241, 0.2);
          display: grid;
          place-items: center;
          color: var(--ft-primary-light);
          font-size: 0.8rem;
          flex-shrink: 0;
        }
        .contact-line a {
          color: var(--ft-primary-light);
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s ease;
        }
        .contact-line a:hover {
          color: var(--ft-accent);
        }

        /* Social row */
        .social-row {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
        }
        .social-btn {
          width: 40px;
          height: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 10px;
          border: 1px solid var(--ft-border);
          color: var(--ft-muted-soft);
          cursor: pointer;
          transition: all 0.3s var(--ft-ease);
          text-decoration: none;
          position: relative;
          overflow: hidden;
        }
        .social-btn::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, var(--ft-primary), var(--ft-accent));
          opacity: 0;
          transition: opacity 0.3s var(--ft-ease);
        }
        .social-btn:hover {
          transform: translateY(-3px);
          color: white;
          border-color: var(--ft-border-glow);
          box-shadow: 0 10px 24px rgba(99, 102, 241, 0.4);
        }
        .social-btn:hover::before {
          opacity: 1;
        }
        .social-btn svg {
          position: relative;
          z-index: 1;
        }

        /* Newsletter */
        .newsletter-label {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--ft-muted-soft);
          margin-bottom: 8px;
          display: block;
        }
        .newsletter {
          display: flex;
          gap: 6px;
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid var(--ft-border);
          border-radius: 999px;
          padding: 5px;
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .newsletter:focus-within {
          border-color: var(--ft-border-glow);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }
        .newsletter input {
          flex: 1;
          padding: 10px 14px;
          border-radius: 999px;
          border: none;
          background: transparent;
          color: white;
          font-size: 0.88rem;
          outline: none;
          font-family: inherit;
          min-width: 0;
        }
        .newsletter input::placeholder {
          color: var(--ft-muted);
        }
        .newsletter button {
          padding: 10px 18px;
          border-radius: 999px;
          border: none;
          background: linear-gradient(135deg, var(--ft-primary), var(--ft-accent));
          color: white;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.25s var(--ft-ease);
          font-family: inherit;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
          flex-shrink: 0;
        }
        .newsletter button:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 22px rgba(192, 132, 252, 0.55);
          filter: brightness(1.1);
        }
        .newsletter button.subscribed {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        /* ================ BOTTOM ROW ================ */
        .footer-bottom {
          position: relative;
          z-index: 1;
          max-width: 1280px;
          margin: 0 auto;
          padding: 22px 0;
          border-top: 1px solid var(--ft-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .copyright {
          color: var(--ft-muted);
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .copyright::before {
          content: "";
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 8px #22c55e;
          animation: pulseDot 2.5s ease-in-out infinite;
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .policies {
          display: flex;
          gap: 6px;
        }
        .policies a {
          color: var(--ft-muted);
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 500;
          padding: 6px 14px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }
        .policies a:hover {
          color: white;
          background: rgba(255, 255, 255, 0.05);
        }

        .payment-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .payment-label {
          color: var(--ft-muted);
          font-size: 0.8rem;
          font-weight: 600;
        }
        .payment-icons {
          display: flex;
          gap: 6px;
        }
        .payment-chip {
          padding: 4px 10px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid var(--ft-border);
          border-radius: 6px;
          color: var(--ft-muted-soft);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          transition: all 0.2s ease;
        }
        .payment-chip:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        /* ================ RESPONSIVE ================ */
        @media (max-width: 1100px) {
          .footer-inner {
            grid-template-columns: 1.2fr 1fr 1.4fr;
            gap: 36px;
          }
          .footer-brand { grid-column: 1 / -1; }
        }

        @media (max-width: 768px) {
          footer.site-footer {
            padding: 48px 18px 0;
          }
          .footer-inner {
            grid-template-columns: 1fr 1fr;
            gap: 32px 24px;
            padding-bottom: 36px;
          }
          .footer-brand,
          .footer-contact {
            grid-column: 1 / -1;
          }
          .footer-bottom {
            flex-direction: column;
            text-align: center;
            gap: 14px;
          }
        }

        @media (max-width: 480px) {
          .footer-inner {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .footer-contact { padding: 20px; }
          .brand-desc { max-width: none; }
        }
      `}</style>

      <footer className="site-footer" role="contentinfo" aria-label="Website footer">
        <div className="footer-inner">
          {/* ============ BRAND COLUMN ============ */}
          <div className="footer-brand">
            <a href="/" className="footer-brand-top" style={{ textDecoration: "none" }}>
              <div className="brand-badge" aria-hidden>
                <img src="/images/logo.png" alt="ITHUBB logo" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              </div>
              <div>
                <div className="brand-title">IT HUBB</div>
                <div className="brand-tagline">ຮ້ານເຄື່ອງຖື ແລະ ອຸປະກອນ IT</div>
              </div>
            </a>

            <p className="brand-desc">
              ສູນລວມສິນຄ້າ IT ແລະ ອຸປະກອນອິເລັກໂຕຣນິກຄຸນນະພາບສູງ
              ພ້ອມບໍລິການຈັດສົ່ງດ່ວນທົ່ວປະເທດ ແລະ ການຮັບປະກັນສິນຄ້າທີ່ໝັ້ນໃຈໄດ້.
            </p>

            <div className="trust-row">
              <span className="trust-chip">
                <i className="fas fa-shield-halved"></i>
                ຂອງແທ້ 100%
              </span>
              <span className="trust-chip">
                <i className="fas fa-truck-fast"></i>
                ຈັດສົ່ງດ່ວນ
              </span>
              <span className="trust-chip">
                <i className="fas fa-rotate-left"></i>
                ຄືນສິນຄ້າ 7 ວັນ
              </span>
            </div>
          </div>

          {/* ============ CONTENT LINKS ============ */}
          <div className="links-col">
            <h4>ເນື້ອໃນ</h4>
            <ul>
              <li><a href="/">ໜ້າຫຼັກ</a></li>
              <li><a href="/recommended">ສິນຄ້າແນະນຳ</a></li>
              <li><a href="/blogs">ບລ໋ອກ</a></li>
              <li><a href="/about">ກ່ຽວກັບເຮົາ</a></li>
            </ul>
          </div>

          {/* ============ HELP LINKS ============ */}
          <div className="links-col">
            <h4>ການຊ່ວຍເຫຼືອ</h4>
            <ul>
              <li><a href="/faq">FAQ</a></li>
              <li><a href="/shipping">ນະໂຍບາຍຈັດສົ່ງ</a></li>
              <li><a href="/returns">ນະໂຍບາຍຄືນ</a></li>
              <li><a href="/contact">ຕິດຕໍ່ເຮົາ</a></li>
            </ul>
          </div>

          {/* ============ CONTACT & NEWSLETTER ============ */}
          <aside className="footer-contact" aria-label="Contact and newsletter">
            <h4 className="contact-title">
              <i className="fas fa-paper-plane"></i>
              ຕິດຕໍ່ &amp; ຕິດຕາມ
            </h4>

            <div className="contact-list">
              <div className="contact-line">
                <span className="contact-icon"><i className="fas fa-envelope"></i></span>
                <span>
                  <a href="mailto:info@ithubb.com">info@ithubb.com</a>
                </span>
              </div>
              <div className="contact-line">
                <span className="contact-icon"><i className="fas fa-phone"></i></span>
                <span>(+856) 20 5704 7171</span>
              </div>
              <div className="contact-line">
                <span className="contact-icon"><i className="fas fa-location-dot"></i></span>
                <span>ວິທະຍາຄານ IT HUBB, ວຽງຈັນ, ລາວ</span>
              </div>
            </div>

            <div className="social-row" role="navigation" aria-label="Social links">
              <a className="social-btn" href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noreferrer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M22 12a10 10 0 10-11.5 9.9v-7h-2.2v-3h2.2V9.3c0-2.2 1.3-3.5 3.3-3.5.95 0 1.95.17 1.95.17v2.1h-1.07c-1.05 0-1.38.66-1.38 1.33v1.6h2.35l-.37 3h-1.98v7A10 10 0 0022 12z"/>
                </svg>
              </a>
              <a className="social-btn" href="https://twitter.com" aria-label="Twitter" target="_blank" rel="noreferrer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M22 5.9c-.6.3-1.3.5-2 .6.73-.44 1.28-1.13 1.55-1.96-.69.4-1.45.7-2.26.86A3.53 3.53 0 0012.8 8c0 .28.03.56.09.82-2.93-.15-5.53-1.55-7.27-3.68-.3.5-.47 1.08-.47 1.7 0 1.17.6 2.2 1.52 2.8-.56-.02-1.08-.17-1.54-.42v.04c0 1.64 1.16 3.01 2.7 3.32-.28.08-.57.12-.87.12-.21 0-.42-.02-.62-.06.42 1.33 1.62 2.3 3.05 2.33A7.1 7.1 0 012 19.5 10 10 0 0022 5.9z"/>
                </svg>
              </a>
              <a className="social-btn" href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noreferrer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 6a5 5 0 100 10 5 5 0 000-10zm6-3a1 1 0 110 2 1 1 0 010-2z"/>
                </svg>
              </a>
              <a className="social-btn" href="https://tiktok.com" aria-label="TikTok" target="_blank" rel="noreferrer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M19.6 6.3a4.8 4.8 0 01-2.9-1 4.7 4.7 0 01-1.9-3.3h-3.3v13.4a2.7 2.7 0 11-2.7-2.7c.3 0 .5 0 .8.1V9.4a6 6 0 105.2 5.9V8.5a8 8 0 004.8 1.6V6.3z"/>
                </svg>
              </a>
            </div>

            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <label className="newsletter-label">📧 ຮັບຂ່າວສານ ແລະ ໂປຣໂມຊັ່ນພິເສດ</label>
              <div className="newsletter">
                <input
                  type="email"
                  aria-label="Your email"
                  placeholder="ໃສ່ email ຂອງທ່ານ..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className={subscribed ? "subscribed" : ""}
                >
                  {subscribed ? (
                    <>
                      <i className="fas fa-check"></i>
                      ສຳເລັດ
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      ສະໝັກ
                    </>
                  )}
                </button>
              </div>
            </form>
          </aside>
        </div>

        {/* ============ BOTTOM ROW ============ */}
        <div className="footer-bottom">
          <div className="copyright">
            © {new Date().getFullYear()} IT HUBB — ສະຫງວນລິຂະສິດທຸກຢ່າງ
          </div>

          <div className="payment-row">
            <span className="payment-label">ຮັບຊຳລະ:</span>
            <div className="payment-icons">
              <span className="payment-chip">BCEL</span>
              <span className="payment-chip">LDB</span>
              <span className="payment-chip">JDB</span>
              <span className="payment-chip">COD</span>
            </div>
          </div>

          <div className="policies" role="navigation" aria-label="Footer links">
            <a href="/terms">Terms</a>
            <a href="/privacy">Privacy</a>
            <a href="/contact">Support</a>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;
