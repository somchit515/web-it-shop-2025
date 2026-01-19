// src/components/layout/Footer.jsx
import React from "react";

function Footer() {
  return (
    <>
      <style>{`
        :root{
          --bg-900: #0b0f13;
          --card-800: #0f1720;
          --text-100: #e6eef7;
          --muted-300: #9aa6b2;
          --accent-500: #c69a3d;
          --accent-600: #b07f2e;
          --accent-400: #d4ad54;
          --glass: rgba(255,255,255,0.03);
          --radius: 12px;
          --shadow-strong: 0 18px 46px rgba(2,6,12,0.55);
          --gap: 20px;
          --maxw: 1160px;
          --font: "Noto Sans Lao", Phetsarath OT, "Segoe UI", Roboto, sans-serif;
        }

        footer.site-footer {
          background: linear-gradient(180deg, rgba(11,15,19,0.98), rgba(15,23,28,1));
          color: var(--text-100);
          padding: 48px 20px;
          font-family: var(--font);
        }

        .footer-inner {
          max-width: var(--maxw);
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.2fr 1fr 360px;
          gap: 28px;
          align-items: start;
          padding: 10px;
        }

        /* Brand area */
        .footer-brand {
          display:flex;
          gap:16px;
          align-items:flex-start;
        }

        /* updated: support logo image + fallback badge */
        .brand-badge {
          width:64px;
          height:64px;
          border-radius:14px;
          display:flex;
          align-items:center;
          justify-content:center;
          background: linear-gradient(135deg, rgba(198,154,61,0.14), rgba(176,127,46,0.06));
          box-shadow: 0 6px 20px rgba(176,127,46,0.06) inset;
          font-weight:800;
          color: var(--accent-500);
          font-size:20px;
          flex-shrink:0;
          overflow:hidden;
        }
        .brand-badge img {
          width:100%;
          height:100%;
          object-fit:cover;
          display:block;
        }

        .brand-title{ font-size:1.35rem; font-weight:800; color:var(--text-100); margin:0; }
        .brand-desc{ margin-top:8px; color:var(--muted-300); font-size:0.98rem; max-width:540px; line-height:1.5; }

        /* Links column */
        .footer-links {
          display:flex;
          gap: 32px;
          align-items:flex-start;
        }
        .links-col {
          display:flex;
          flex-direction:column;
          gap:10px;
        }
        .links-col strong { color: var(--text-100); margin-bottom:6px; display:block; font-size:1rem; }
        .links-col a {
          color: var(--muted-300);
          text-decoration:none;
          font-size:0.96rem;
          transition: color .12s ease, transform .12s ease;
        }
        .links-col a:hover { color: var(--text-100); transform: translateX(4px); }

        /* Contact / social / newsletter */
        .footer-contact {
          background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
          border-radius: 12px;
          padding:18px;
          border: 1px solid rgba(255,255,255,0.03);
          box-shadow: 0 8px 28px rgba(2,6,12,0.35);
        }
        .contact-title { color: var(--text-100); font-weight:800; margin:0 0 8px 0; font-size:1rem; }
        .contact-line { color: var(--muted-300); font-size:0.95rem; margin-bottom:10px; line-height:1.4; }

        .social-row { display:flex; gap:10px; margin-top:8px; }
        .social-btn {
          width:44px; height:44px; display:inline-flex; align-items:center; justify-content:center;
          background: transparent;
          border-radius:10px;
          border:1px solid rgba(255,255,255,0.04);
          color: var(--text-100);
          cursor:pointer;
          transition: all .14s ease;
        }
        .social-btn:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(2,6,12,0.5); border-color: rgba(214,173,84,0.15); color: var(--accent-400); }

        /* Newsletter */
        .newsletter {
          margin-top:12px;
          display:flex;
          gap:8px;
          align-items:center;
        }
        .newsletter input {
          flex:1;
          padding:10px 12px;
          border-radius:10px;
          border: 1px solid rgba(255,255,255,0.04);
          background: rgba(255,255,255,0.02);
          color: var(--text-100);
          font-size:0.95rem;
        }
        .newsletter button {
          padding:10px 14px;
          border-radius:10px;
          border:none;
          background: linear-gradient(90deg,var(--accent-500),var(--accent-600));
          color:#071117;
          font-weight:700;
          cursor:pointer;
          transition: transform .12s ease, box-shadow .12s ease;
        }
        .newsletter button:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(176,127,46,0.12); }

        /* bottom row */
        .footer-bottom {
          margin-top: 26px;
          border-top: 1px solid rgba(255,255,255,0.04);
          padding-top:22px;
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:10px;
          flex-wrap:wrap;
        }
        .copyright { color: var(--muted-300); font-size:0.92rem; }
        .policies { display:flex; gap:18px; }
        .policies a { color:var(--muted-300); text-decoration:none; font-size:0.92rem; transition: color .12s ease; }
        .policies a:hover { color: var(--text-100); text-decoration:underline; }

        /* small screens */
        @media (max-width: 980px) {
          .footer-inner { grid-template-columns: 1fr; text-align: left; }
          .footer-contact { order: 3; }
          .footer-links { order: 2; gap: 24px; margin-top: 8px; }
        }
      `}</style>

      <footer className="site-footer" role="contentinfo" aria-label="Website footer">
        <div className="footer-inner">
          <div>
            <div className="footer-brand" aria-hidden>
              <a href="/" style={{ textDecoration: "none", display: "flex", gap: 16, alignItems: "center" }}>
                <div className="brand-badge" aria-hidden>
                  {/* logo from public/images/logo.png (fallback text "IT" shown if image not found) */}
                  <img src="/images/logo.png" alt="ITHUBB logo" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </div>

                <div>
                  <div className="brand-title">ITHUBB</div>
                  <div className="brand-desc">
                    ຮ້ານ IT HUBB — ຈັດຈໍາສິນຄ້າ, ສົ່ງດ່ວນ ແລະ ບໍລິການທີ່ໄວແລະນໍາສະເຫລີມ.
                  </div>
                </div>
              </a>
            </div>
          </div>

          <div className="footer-links" aria-hidden="false">
            <div className="links-col">
              <strong>ເນື້ອໃນ</strong>
              <a href="/">ໜ້າຫຼັກ</a>
              <a href="/products">ສິນຄ້າ</a>
              <a href="/deals">ໂຄສະນາ</a>
              <a href="/blog">ບລ໋ອກ</a>
            </div>

            <div className="links-col">
              <strong>ການຊ່ວຍເຫຼືອ</strong>
              <a href="/faq">FAQ</a>
              <a href="/shipping">ນະໂຍບາຍການຈັດສົ່ງ</a>
              <a href="/returns">ນະໂຍບາຍການຄືນ</a>
              <a href="/contact">ຕິດຕໍ່</a>
            </div>
          </div>

          <aside className="footer-contact" aria-label="Contact and newsletter">
            <div className="contact-title">ຕິດຕໍ່ & ຕິດຕາມ</div>
            <div className="contact-line">Email: <a href="mailto:info@ithubb.com" style={{color:"var(--accent-400)", textDecoration:"none"}}>info@ithubb.com</a></div>
            <div className="contact-line">ໂທ: (+856) 20 5704 7171</div>
            <div className="contact-line">ທີ່ຢູ່: ວິທະຍາຄານ IT HUBB, ເມືອງ, ປະເທດ</div>

            <div className="social-row" role="navigation" aria-label="Social links">
              <a className="social-btn" href="https://facebook.com" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M22 12a10 10 0 10-11.5 9.9v-7h-2.2v-3h2.2V9.3c0-2.2 1.3-3.5 3.3-3.5.95 0 1.95.17 1.95.17v2.1h-1.07c-1.05 0-1.38.66-1.38 1.33v1.6h2.35l-.37 3h-1.98v7A10 10 0 0022 12z"/>
                </svg>
              </a>

              <a className="social-btn" href="https://twitter.com" aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M22 5.9c-.6.3-1.3.5-2 .6.73-.44 1.28-1.13 1.55-1.96-.69.4-1.45.7-2.26.86A3.53 3.53 0 0012.8 8c0 .28.03.56.09.82-2.93-.15-5.53-1.55-7.27-3.68-.3.5-.47 1.08-.47 1.7 0 1.17.6 2.2 1.52 2.8-.56-.02-1.08-.17-1.54-.42v.04c0 1.64 1.16 3.01 2.7 3.32-.28.08-.57.12-.87.12-.21 0-.42-.02-.62-.06.42 1.33 1.62 2.3 3.05 2.33A7.1 7.1 0 012 19.5 10 10 0 0022 5.9z"/>
                </svg>
              </a>

              <a className="social-btn" href="https://instagram.com" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 6a5 5 0 100 10 5 5 0 000-10zm6-3a1 1 0 110 2 1 1 0 010-2z"/>
                </svg>
              </a>
            </div>

            <div className="newsletter" aria-label="Newsletter signup">
              <input aria-label="Your email" placeholder="ໃສ່ email ເພື່ອຮັບຂ່າວ" />
              <button aria-label="Subscribe">Subscribe</button>
            </div>
          </aside>
        </div>

        <div className="footer-bottom">
          <div className="copyright">ITHUBB © 2024–2025 — ສິດທິທຸກຢ່າງ</div>

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
