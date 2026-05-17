import React from "react";
import { Link } from "react-router-dom";
import MetaData from "../layout/MetaData";
import "./About.css";

const STATS = [
  { num: "10,000+", label: "ລູກຄ້າທີ່ໄວ້ວາງໃຈ", icon: "👥", color: "#6366f1" },
  { num: "50,000+", label: "ສິນຄ້າທີ່ຈຳໜ່າຍ",   icon: "📦", color: "#8b5cf6" },
  { num: "99.9%",   label: "ລູກຄ້າພໍໃຈ",        icon: "⭐", color: "#06b6d4" },
  { num: "5+",      label: "ປີປະສົບການ",          icon: "🏆", color: "#10b981" },
];

const WHY = [
  { icon: "🛡️", title: "ສິນຄ້າຂອງແທ້ 100%",      desc: "ທຸກສິນຄ້າຜ່ານການກວດຄຸນນະພາບ ແລະ ມີການຮັບປະກັນຈາກຕົ້ນທາງ",    gradient: "from-indigo to-violet" },
  { icon: "🚀", title: "ສົ່ງດ່ວນທົ່ວລາວ",          desc: "ລະບົບຈັດສົ່ງທີ່ທັນສະໄໝ ຮ້ອດໃນ 1-3 ວັນ ທຸກຈັງຫວັດ",            gradient: "from-cyan to-blue" },
  { icon: "💰", title: "ລາຄາດີທີ່ສຸດ",            desc: "ລາຄາແຂ່ງຂັນ ພ້ອມໂປຣໂມຊັ່ນ Flash Deal ແລະ ລະຫັດສ່ວນຫຼຸດ",   gradient: "from-rose to-pink" },
  { icon: "🎧", title: "ສະໜັບສະໜູນ 24/7",         desc: "ທີມ Support ພ້ອມຊ່ວຍເຫຼືອທາງ Phone, Chat ຕະຫຼອດ 24 ຊົ່ວໂມງ", gradient: "from-amber to-orange" },
  { icon: "↩️", title: "ຄືນສິນຄ້າ 7 ວັນ",         desc: "ບໍ່ພໍໃຈສາມາດຄືນໄດ້ພາຍໃນ 7 ວັນ ໂດຍບໍ່ຕ້ອງຖາມເຫດຜົນ",         gradient: "from-teal to-emerald" },
  { icon: "🔒", title: "ຊຳລະເງິນປອດໄພ",          desc: "ຮອງຮັບ Bank Transfer, COD ແລະ ລະບົບຢືນຢັນສອງຊັ້ນ",           gradient: "from-purple to-indigo" },
];

const MILESTONES = [
  { year: "2020", title: "ກໍ່ຕັ້ງ IT HUBB",       desc: "ເລີ່ມຕົ້ນດ້ວຍທີມ 3 ຄົນ ແລະ ສິນຄ້າ 50 ລາຍການ" },
  { year: "2021", title: "ຂະຫຍາຍໄປ 5 ຈັງຫວັດ",    desc: "ເປີດບໍລິການຈັດສົ່ງທົ່ວ ວຽງຈັນ, ສະຫວັນນະເຂດ, ປາກເຊ" },
  { year: "2022", title: "ລູກຄ້າ 5,000 ທ່ານ",     desc: "ຍອດຂາຍຜ່ານ ₭1 Billion ເທື່ອທຳອິດ" },
  { year: "2023", title: "App ມືຖື & Website",     desc: "ເປີດຕົວ Platform ອອນລາຍ ພ້ອມ Flash Deal ທຸກວັນ" },
  { year: "2024", title: "10,000+ ລູກຄ້າ",         desc: "ກາຍເປັນ Platform IT ທີ່ໃຫຍ່ທີ່ສຸດໃນລາວ" },
  { year: "2025", title: "AI & Smart Rec",          desc: "ໃສ່ AI ແນະນຳສິນຄ້າ ແລະ Flash Deal ທີ່ Smart ຂຶ້ນ" },
];

const TEAM = [
  { name: "ສຸກວິສອນ ສີປະມວນ",   role: "CEO & Founder", avatar: "S",  color: "#6366f1", desc: "ວິໄສທັດ 10 ປີ ດ້ານ IT & Retail" },
  { name: "ພຸດທະສອນ ໄຊຍະເສນາ", role: "CTO",           avatar: "P",  color: "#8b5cf6", desc: "Full-Stack Dev ແລະ Cloud Architecture" },
  { name: "ສຸກສະຫວັນ ສີດາ",     role: "COO",           avatar: "SK", color: "#06b6d4", desc: "Operations ແລະ Supply Chain" },
  { name: "ດາລາ ວົງໄຊ",         role: "Customer Lead",  avatar: "D",  color: "#10b981", desc: "ດູແລຄວາມສຸກລູກຄ້າ 10,000+" },
];

export default function About() {
  return (
    <>
      <MetaData title="ກ່ຽວກັບ IT HUBB — ຮ້ານ IT ອຳດັບ 1 ໃນລາວ" />

      <div className="ab-page">

        {/* ══════════════ HERO ══════════════ */}
        <section className="ab-hero">
          <div className="ab-hero-orb ab-orb1" />
          <div className="ab-hero-orb ab-orb2" />
          <div className="ab-hero-orb ab-orb3" />

          <div className="ab-hero-inner">
            <div className="ab-hero-badge">🏆 ຮ້ານ IT ອັນດັບ 1 ໃນລາວ</div>
            <h1 className="ab-hero-title">
              ພວກເຮົາຄື<br />
              <span className="ab-gradient-text">IT HUBB</span>
            </h1>
            <p className="ab-hero-sub">
              ຕັ້ງແຕ່ປີ 2020 ພວກເຮົາໄດ້ນຳເອົາເທັກໂນໂລຢີລ່າສຸດ<br />
              ມາໃກ້ຊິດກັບຄົນລາວທຸກຄົນ — ຄຸນນະພາບ, ໄວ, ໜ້າເຊື່ອຖື
            </p>
            <div className="ab-hero-btns">
              <Link to="/" className="ab-btn-primary">🛒 ເລີ່ມຊອບປິ້ງ</Link>
              <Link to="/contact" className="ab-btn-outline">📞 ຕິດຕໍ່ພວກເຮົາ</Link>
            </div>
          </div>

          {/* floating tech icons */}
          <div className="ab-float-icons">
            {["💻","📱","🖥️","⌨️","🖱️","🎮","📡","🔋"].map((ic, i) => (
              <span key={i} className="ab-float-ic" style={{ "--i": i }}>{ic}</span>
            ))}
          </div>
        </section>

        {/* ══════════════ STATS ══════════════ */}
        <section className="ab-stats">
          {STATS.map((s, i) => (
            <div key={i} className="ab-stat" style={{ "--c": s.color }}>
              <span className="ab-stat-icon">{s.icon}</span>
              <div className="ab-stat-num">{s.num}</div>
              <div className="ab-stat-label">{s.label}</div>
            </div>
          ))}
        </section>

        {/* ══════════════ STORY ══════════════ */}
        <section className="ab-story">
          <div className="ab-story-text">
            <div className="ab-tag">📖 ເລື່ອງລາວຂອງພວກເຮົາ</div>
            <h2>ຈາກຄວາມຝັນ<br /><span className="ab-gradient-text">ສູ່ຄວາມເປັນຈິງ</span></h2>
            <p>
              ໃນປີ 2020 ກຸ່ມໝູ່ເພື່ອນທີ່ຮັກ IT ໄດ້ເຫັນວ່າຄົນລາວຍັງຫຍຸ້ງຍາກ
              ໃນການຫາຊື້ສິນຄ້າ Tech ທີ່ດີ — ລາຄາຍຸດຕິທຳ, ຂອງແທ້, ສົ່ງໄວ.
              ພວກເຮົາຈຶ່ງຕັດສິນໃຈສ້າງ <strong>IT HUBB</strong> ຂຶ້ນ.
            </p>
            <p>
              ຈາກຮ້ານເລັກໆ ທີ່ມີສິນຄ້າ 50 ລາຍການ ມາຮອດວັນນີ້ IT HUBB
              ມີສິນຄ້າກວ່າ 50,000 ລາຍການ ໃຫ້ເລືອກ ແລະ ໃຫ້ບໍລິການ
              ລູກຄ້າກວ່າ 10,000 ທ່ານ ທົ່ວປະເທດລາວ.
            </p>
            <p>
              ພາລະກິດຂອງພວກເຮົາຍັງຄົງດຽວກັນ —
              <em> ນຳເອົາ Technology ທີ່ດີທີ່ສຸດ ໃນລາຄາທີ່ທຸກຄົນຮັບໄດ້.</em>
            </p>
            <div className="ab-story-chips">
              <span>✅ ສິນຄ້າແທ້ 100%</span>
              <span>✅ ຮັບປະກັນຈາກ Brand</span>
              <span>✅ ສົ່ງທົ່ວລາວ</span>
            </div>
          </div>

          <div className="ab-story-visual">
            <div className="ab-store-card">
              <div className="ab-store-top">
                <div className="ab-store-logo">🏪</div>
                <div>
                  <div className="ab-store-name">IT HUBB</div>
                  <div className="ab-store-since">Since 2020</div>
                </div>
              </div>
              <div className="ab-store-stats">
                <div><strong>50K+</strong><small>Products</small></div>
                <div><strong>10K+</strong><small>Customers</small></div>
                <div><strong>5+</strong><small>Years</small></div>
              </div>
              <div className="ab-store-bar">
                <div className="ab-bar-label">Customer Satisfaction</div>
                <div className="ab-bar-track"><div className="ab-bar-fill" style={{ width: "99%" }} /></div>
                <div className="ab-bar-pct">99.9%</div>
              </div>
              <div className="ab-store-badges">
                <span>🏆 Best IT Shop</span>
                <span>⭐ 5.0 Rating</span>
                <span>🔒 Verified</span>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════ WHY US ══════════════ */}
        <section className="ab-why">
          <div className="ab-section-head">
            <div className="ab-tag">💡 ທຳໄມຕ້ອງ IT HUBB?</div>
            <h2>ຄຸນຄ່າທີ່ພວກເຮົາ<span className="ab-gradient-text"> ຍຶດໝັ້ນ</span></h2>
            <p>ທຸກການຕັດສິນໃຈຂອງພວກເຮົາ ຍຶດເອົາລູກຄ້າເປັນສູນກາງ</p>
          </div>
          <div className="ab-why-grid">
            {WHY.map((w, i) => (
              <div key={i} className="ab-why-card">
                <div className="ab-why-icon">{w.icon}</div>
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════ TIMELINE ══════════════ */}
        <section className="ab-timeline">
          <div className="ab-section-head ab-section-head--light">
            <div className="ab-tag ab-tag--light">📅 ການເດີນທາງ</div>
            <h2>ຈຸດສຳຄັນໃນ<span className="ab-gradient-text"> ປະຫວັດ</span>ຂອງພວກເຮົາ</h2>
          </div>
          <div className="ab-tl-track">
            {MILESTONES.map((m, i) => (
              <div key={i} className={`ab-tl-item${i % 2 === 0 ? "" : " ab-tl-item--right"}`}>
                <div className="ab-tl-dot" />
                <div className="ab-tl-card">
                  <div className="ab-tl-year">{m.year}</div>
                  <div className="ab-tl-title">{m.title}</div>
                  <div className="ab-tl-desc">{m.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════ TEAM ══════════════ */}
        <section className="ab-team">
          <div className="ab-section-head">
            <div className="ab-tag">👥 ທີມງານ</div>
            <h2>ຄົນທີ່<span className="ab-gradient-text"> ຂັບເຄື່ອນ</span> IT HUBB</h2>
            <p>ທີມງານທີ່ມີຄວາມຫຼງໃຫຼໃນ Technology ແລະ ຮັກການໃຫ້ບໍລິການ</p>
          </div>
          <div className="ab-team-grid">
            {TEAM.map((t, i) => (
              <div key={i} className="ab-team-card">
                <div className="ab-team-avatar" style={{ background: t.color }}>
                  {t.avatar}
                </div>
                <div className="ab-team-info">
                  <div className="ab-team-name">{t.name}</div>
                  <div className="ab-team-role" style={{ color: t.color }}>{t.role}</div>
                  <div className="ab-team-desc">{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════ CTA ══════════════ */}
        <section className="ab-cta">
          <div className="ab-cta-orb ab-cta-orb1" />
          <div className="ab-cta-orb ab-cta-orb2" />
          <div className="ab-cta-inner">
            <div className="ab-cta-icon">🚀</div>
            <h2>ພ້ອມຊອບປິ້ງ<br /><span>ກັບ IT HUBB ແລ້ວບໍ?</span></h2>
            <p>ສິນຄ້ານັບພັນລາຍການ ລາຄາດີ ສົ່ງດ່ວນ ໝັ້ນໃຈ 100%</p>
            <div className="ab-cta-btns">
              <Link to="/" className="ab-cta-btn-primary">🛒 ເລີ່ມຊອບປິ້ງດຽວນີ້</Link>
              <Link to="/contact" className="ab-cta-btn-outline">📞 ຕິດຕໍ່ທີ່ປຶກສາ</Link>
            </div>
            <div className="ab-cta-trust">
              <span>🔒 ປອດໄພ 100%</span>
              <span>↩️ ຄືນ 7 ວັນ</span>
              <span>🚚 ສົ່ງດ່ວນ</span>
              <span>⭐ 5.0 ດາວ</span>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
