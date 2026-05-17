import React, { useState } from "react";
import MetaData from "../layout/MetaData";
import "./Contact.css";

const CONTACT_INFO = [
  { icon: "📍", title: "ທີ່ຢູ່", content: "ໂພນສະຫວັນ, ເມືອງ ແປກ, ແຂວງຊຽງຂວາງ, ສປປ ລາວ", link: null,                              color: "#ef4444" },
  { icon: "📞", title: "ໂທລະສັບ",  content: "+856 20 5704771",   link: "tel:+856205704771",           color: "#10b981" },
  { icon: "✉️", title: "ອີເມວ",    content: "info@ithubb.com",   link: "mailto:info@ithubb.com",      color: "#6366f1" },
  { icon: "🕐", title: "ເວລາເຮັດວຽກ", content: "ຈັນ – ເສົາ: 08:00 – 18:00", link: null,              color: "#f59e0b" },
];

const SOCIALS = [
  { icon: "📘", name: "Facebook",  color: "#1877f2", link: "#" },
  { icon: "📸", name: "Instagram", color: "#e4405f", link: "#" },
  { icon: "💬", name: "WhatsApp",  color: "#25d366", link: "#" },
  { icon: "🟢", name: "Line",      color: "#00b900", link: "#" },
];

const FAQS = [
  { q: "ເວລາເຮັດວຽກຂອງພວກເຮົາແມ່ນແນວໃດ?",          a: "ພວກເຮົາເປີດໃຫ້ບໍລິການທຸກວັນຈັນ – ເສົາ ເວລາ 08:00 – 18:00 ນ. ສຳລັບວັນອາທິດ ແລະ ວັນພັກ ກະລຸນາກວດສອບກ່ອນ." },
  { q: "ຈະຕິດຕໍ່ແນວໃດ ຖ້າມີບັນຫາກັບສິນຄ້າ?",        a: "ທ່ານສາມາດຕິດຕໍ່ໄດ້ທາງໂທລະສັບ, ອີເມວ, ຫຼື ຜ່ານແບບຟອມຂ້າງລຸ່ມ. ທີມງານຈະຕອບກັບພາຍໃນ 24 ຊົ່ວໂມງ." },
  { q: "ມີການຮັບປະກັນສິນຄ້າບໍ?",                     a: "ສິນຄ້າທຸກຊະນິດມີການຮັບປະກັນຕາມທີ່ຜູ້ຜະລິດກຳນົດ. ສຳລັບລາຍລະອຽດເພີ່ມເຕີມ ກະລຸນາສອບຖາມທີມງານ." },
  { q: "ມີການຈັດສົ່ງສິນຄ້າທົ່ວປະເທດບໍ?",              a: "ມີ — ພວກເຮົາຈັດສົ່ງທົ່ວລາວ. ຄ່າຈັດສົ່ງຂຶ້ນກັບທີ່ຕັ້ງ ແລະ ນໍ້າໜັກສິນຄ້າ. ກວດລາຄາໄດ້ໃນໂຕ checkout." },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [errors, setErrors]       = useState({});
  const [sending, setSending]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [openFaq, setOpenFaq]     = useState(null);

  const validate = (name, value) => {
    if (name === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return "ກະລຸນາປ້ອນອີເມວທີ່ຖືກຕ້ອງ";
    if (name === "phone" && value && !/^[0-9+\s-]{8,}$/.test(value))
      return "ກະລຸນາປ້ອນເບີໂທທີ່ຖືກຕ້ອງ";
    return "";
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: validate(name, value) }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSuccess(true);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
      setSending(false);
      setTimeout(() => setSuccess(false), 5000);
    }, 1500);
  };

  return (
    <>
      <MetaData title="ຕິດຕໍ່ IT HUBB — ພ້ອມຊ່ວຍເຫຼືອທ່ານຕະຫຼອດ 24/7" />

      <div className="ct-page">

        {/* ══ HERO ══ */}
        <section className="ct-hero">
          <div className="ct-hero-orb ct-orb1" />
          <div className="ct-hero-orb ct-orb2" />
          <div className="ct-hero-orb ct-orb3" />
          <div className="ct-hero-inner">
            <div className="ct-hero-badge">📞 ພ້ອມຊ່ວຍເຫຼືອທ່ານ</div>
            <h1 className="ct-hero-title">
              ຕິດຕໍ່<br />
              <span className="ct-gradient-text">IT HUBB</span>
            </h1>
            <p className="ct-hero-sub">
              ທີມງານຂອງພວກເຮົາພ້ອມຕອບທຸກຄຳຖາມ — ໄວ, ໃສ່ໃຈ, ແລະ ເປັນມິດ
            </p>
            <div className="ct-hero-chips">
              <span>⚡ ຕອບໄວ &lt; 1 ຊົ່ວໂມງ</span>
              <span>🌐 ຮອງຮັບລາວ / ໄທ / EN</span>
              <span>🕐 24/7 ທຸກວັນ</span>
            </div>
          </div>
        </section>

        {/* ══ STATS ══ */}
        <section className="ct-stats">
          <div className="ct-stat">
            <span className="ct-stat-icon">👥</span>
            <div className="ct-stat-num">10,000+</div>
            <div className="ct-stat-label">ລູກຄ້າໄວ້ວາງໃຈ</div>
          </div>
          <div className="ct-stat">
            <span className="ct-stat-icon">🎧</span>
            <div className="ct-stat-num">24/7</div>
            <div className="ct-stat-label">ສະໜັບສະໜູນ</div>
          </div>
          <div className="ct-stat">
            <span className="ct-stat-icon">⭐</span>
            <div className="ct-stat-num">99.9%</div>
            <div className="ct-stat-label">ຄວາມພໍໃຈ</div>
          </div>
          <div className="ct-stat">
            <span className="ct-stat-icon">⚡</span>
            <div className="ct-stat-num">&lt;1h</div>
            <div className="ct-stat-label">ເວລາຕອບສະໜອງ</div>
          </div>
        </section>

        {/* ══ MAIN CONTENT ══ */}
        <section className="ct-main">

          {/* Left — info + social */}
          <div className="ct-info-col">
            <div className="ct-info-card">
              <div className="ct-card-head">
                <span className="ct-card-icon">📋</span>
                <h2>ຂໍ້ມູນຕິດຕໍ່</h2>
              </div>
              <div className="ct-info-list">
                {CONTACT_INFO.map((item, i) => (
                  <div key={i} className="ct-info-item">
                    <div className="ct-info-ic" style={{ background: item.color + "18" }}>
                      <span style={{ fontSize: "1.3rem" }}>{item.icon}</span>
                    </div>
                    <div className="ct-info-body">
                      <div className="ct-info-label">{item.title}</div>
                      {item.link
                        ? <a href={item.link} className="ct-info-val ct-info-link">{item.content}</a>
                        : <div className="ct-info-val">{item.content}</div>
                      }
                    </div>
                  </div>
                ))}
              </div>

              <div className="ct-divider" />

              <div className="ct-social-head">ຕິດຕາມພວກເຮົາ</div>
              <div className="ct-social-row">
                {SOCIALS.map((s, i) => (
                  <a key={i} href={s.link} className="ct-social-btn" style={{ borderColor: s.color + "50" }}>
                    <span style={{ background: s.color + "18", borderRadius: "8px", padding: "6px 8px", fontSize: "1.1rem" }}>{s.icon}</span>
                    <span>{s.name}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Quick contact chips */}
            <div className="ct-quick-card">
              <div className="ct-quick-title">🚀 ຕິດຕໍ່ດ່ວນ</div>
              <a href="tel:+856205704771" className="ct-quick-btn ct-quick-phone">
                <span>📞</span> ໂທດຽວນີ້
              </a>
              <a href="mailto:info@ithubb.com" className="ct-quick-btn ct-quick-mail">
                <span>✉️</span> ສົ່ງອີເມວ
              </a>
            </div>
          </div>

          {/* Right — form */}
          <div className="ct-form-card">
            <div className="ct-card-head">
              <span className="ct-card-icon">✉️</span>
              <h2>ສົ່ງຂໍ້ຄວາມຫາພວກເຮົາ</h2>
            </div>

            {success && (
              <div className="ct-success">
                ✅ ສົ່ງຂໍ້ຄວາມສຳເລັດ! ພວກເຮົາຈະຕິດຕໍ່ກັບທ່ານໃນໄວໆນີ້
              </div>
            )}

            <form onSubmit={onSubmit} className="ct-form">
              <div className="ct-form-row">
                <div className="ct-fg">
                  <label className="ct-label">ຊື່ຂອງທ່ານ <span className="ct-req">*</span></label>
                  <input name="name" value={form.name} onChange={onChange}
                    className="ct-input" placeholder="ປ້ອນຊື່ຂອງທ່ານ" required />
                </div>
                <div className="ct-fg">
                  <label className="ct-label">ອີເມວ <span className="ct-req">*</span></label>
                  <input name="email" type="email" value={form.email} onChange={onChange}
                    className={`ct-input${errors.email ? " ct-err" : ""}`}
                    placeholder="example@email.com" required />
                  {errors.email && <span className="ct-err-msg">{errors.email}</span>}
                </div>
              </div>

              <div className="ct-form-row">
                <div className="ct-fg">
                  <label className="ct-label">ເບີໂທ</label>
                  <input name="phone" type="tel" value={form.phone} onChange={onChange}
                    className={`ct-input${errors.phone ? " ct-err" : ""}`}
                    placeholder="+856 20 XXXX XXXX" />
                  {errors.phone && <span className="ct-err-msg">{errors.phone}</span>}
                </div>
                <div className="ct-fg">
                  <label className="ct-label">ຫົວຂໍ້ <span className="ct-req">*</span></label>
                  <select name="subject" value={form.subject} onChange={onChange}
                    className="ct-select" required>
                    <option value="">ເລືອກຫົວຂໍ້</option>
                    <option value="general">ສອບຖາມທົ່ວໄປ</option>
                    <option value="product">ສອບຖາມສິນຄ້າ</option>
                    <option value="order">ສອບຖາມອໍເດີ</option>
                    <option value="support">ຊ່ວຍເຫຼືອດ້ານເທັກນິກ</option>
                    <option value="other">ອື່ນໆ</option>
                  </select>
                </div>
              </div>

              <div className="ct-fg">
                <label className="ct-label">ຂໍ້ຄວາມ <span className="ct-req">*</span></label>
                <textarea name="message" value={form.message} onChange={onChange}
                  className="ct-textarea" rows={5}
                  placeholder="ເຂົ້າຂໍ້ຄວາມຂອງທ່ານ..." required />
              </div>

              <button type="submit" className="ct-submit" disabled={sending}>
                {sending ? "⏳ ກຳລັງສົ່ງ..." : "🚀 ສົ່ງຂໍ້ຄວາມ"}
              </button>
            </form>
          </div>
        </section>

        {/* ══ MAP ══ */}
        <section className="ct-map-section">
          <div className="ct-section-head">
            <div className="ct-tag">📍 ທີ່ຕັ້ງຂອງພວກເຮົາ</div>
            <h2>ຊອກຫາ<span className="ct-gradient-text"> IT HUBB</span></h2>
            <p>ໂພນສະຫວັນ, ເມືອງ ແປກ, ແຂວງຊຽງຂວາງ, ສປປ ລາວ</p>
          </div>
          <div className="ct-map-wrap">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3872.2394859615465!2d103.2037906639804!3d19.455378387444224!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sth!2sla!4v1766043171934!5m2!1sth!2sla"
              width="100%" height="420" allowFullScreen loading="lazy"
              referrerPolicy="no-referrer-when-downgrade" title="IT HUBB Location"
            />
          </div>
          <div className="ct-map-btn-row">
            <a href="https://maps.app.goo.gl/Csui3b2heX8YUFwR6"
              target="_blank" rel="noopener noreferrer" className="ct-maps-btn">
              📍 ນຳທາງດ້ວຍ Google Maps
            </a>
          </div>
        </section>

        {/* ══ FAQ ══ */}
        <section className="ct-faq">
          <div className="ct-section-head ct-section-head--light">
            <div className="ct-tag ct-tag--light">❓ FAQ</div>
            <h2>ຄຳຖາມທີ່<span className="ct-gradient-text"> ພົບເລື້ອຍ</span></h2>
          </div>
          <div className="ct-faq-list">
            {FAQS.map((f, i) => (
              <div key={i}
                className={`ct-faq-item${openFaq === i ? " ct-faq-open" : ""}`}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <div className="ct-faq-q">
                  <span>{f.q}</span>
                  <span className={`ct-faq-arrow${openFaq === i ? " ct-faq-arrow--up" : ""}`}>›</span>
                </div>
                <div className="ct-faq-a">{f.a}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ CTA ══ */}
        <section className="ct-cta">
          <div className="ct-cta-orb ct-cta-orb1" />
          <div className="ct-cta-orb ct-cta-orb2" />
          <div className="ct-cta-inner">
            <div className="ct-cta-icon">💬</div>
            <h2>ຍັງມີຄຳຖາມ<br /><span>ຕິດຕໍ່ຫາພວກເຮົາໄດ້ເລີຍ!</span></h2>
            <p>ທີມງານຂອງພວກເຮົາພ້ອມຊ່ວຍທ່ານ — ບໍ່ຕ້ອງລໍຖ້າ</p>
            <div className="ct-cta-btns">
              <a href="tel:+856205704771" className="ct-cta-btn-primary">📞 ໂທຫາພວກເຮົາ</a>
              <a href="mailto:info@ithubb.com" className="ct-cta-btn-outline">✉️ ສົ່ງອີເມວ</a>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
