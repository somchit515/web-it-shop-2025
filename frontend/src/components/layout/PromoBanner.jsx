import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/* ─── Slide Data ──────────────────────────────────────────── */
const SLIDES = [
  {
    id: 1,
    badge: "⚡ FLASH SALE",
    tag: "ຈຳກັດ 24 ຊຊ.",
    title: "ລາຄາພິເສດ",
    title2: "ໂປໂມຊັ່ນຮ້ອນ",
    sub: "ສ່ວນຫຼຸດສູງສຸດ 70% ສິນຄ້າ IT ທຸກໝວດ",
    cta: "ຊື້ດ່ວນ",
    ctaLink: "/",
    discount: "70%",
    bg: "linear-gradient(135deg, #c0392b 0%, #e74c3c 40%, #ff6b35 100%)",
    orb1: "rgba(255,255,255,0.12)",
    orb2: "rgba(255,200,0,0.15)",
    emoji: "🔥",
    textColor: "#fff",
  },
  {
    id: 2,
    badge: "💻 NEW ARRIVALS",
    tag: "ສິນຄ້າໃໝ່ 2025",
    title: "Laptops & PC",
    title2: "ຄຸນນະພາບສູງ",
    sub: "MSI, ASUS, Lenovo — ທີ່ສຸດຂອງປະສິດທິພາບ",
    cta: "ເບິ່ງສິນຄ້າ",
    ctaLink: "/category/laptops",
    discount: null,
    bg: "linear-gradient(135deg, #0f0c29 0%, #302b63 55%, #24243e 100%)",
    orb1: "rgba(102,126,234,0.25)",
    orb2: "rgba(118,75,162,0.2)",
    emoji: "💻",
    textColor: "#fff",
  },
  {
    id: 3,
    badge: "🎮 GAMING WEEK",
    tag: "Gaming Setup",
    title: "ຈັດເຕັມ",
    title2: "Gaming Gear",
    sub: "Headphones, Mouse, Keyboard — ສ່ວນຫຼຸດ 30%",
    cta: "Shop Now",
    ctaLink: "/category/gaming-products",
    discount: "30%",
    bg: "linear-gradient(135deg, #0d0d0d 0%, #1a0533 50%, #2d1b69 100%)",
    orb1: "rgba(139,92,246,0.3)",
    orb2: "rgba(236,72,153,0.2)",
    emoji: "🎮",
    textColor: "#fff",
  },
  {
    id: 4,
    badge: "📱 SMARTPHONES",
    tag: "Best Seller",
    title: "ໂທລະສັບ",
    title2: "ທຸກແບຣນ",
    sub: "Samsung, Vivo, iPhone — ຮາຄາດີທີ່ສຸດ",
    cta: "ເລືອກຊື້",
    ctaLink: "/category/smartphones",
    discount: "20%",
    bg: "linear-gradient(135deg, #134e5e 0%, #1d976c 60%, #71b280 100%)",
    orb1: "rgba(255,255,255,0.1)",
    orb2: "rgba(0,200,150,0.2)",
    emoji: "📱",
    textColor: "#fff",
  },
  {
    id: 5,
    badge: "🚚 FREE SHIPPING",
    tag: "ຂໍ້ສະເໜີພິເສດ",
    title: "ສົ່ງຟຣີ",
    title2: "ທົ່ວປະເທດ",
    sub: "ສັ່ງຊື້ ₭1,000,000 ຂຶ້ນໄປ — ຟຣີຄ່າຂົນສົ່ງທັນທີ",
    cta: "ສັ່ງຊື້ເລີຍ",
    ctaLink: "/",
    discount: null,
    bg: "linear-gradient(135deg, #4776e6 0%, #667eea 50%, #764ba2 100%)",
    orb1: "rgba(255,255,255,0.1)",
    orb2: "rgba(118,75,162,0.25)",
    emoji: "🚚",
    textColor: "#fff",
  },
];

/* ─── Component ───────────────────────────────────────────── */
export default function PromoBanner({ autoplayMs = 5000 }) {
  const [cur, setCur]         = useState(0);
  const [prev, setPrev]       = useState(null);
  const [phase, setPhase]     = useState("idle"); // idle | leaving | entering
  const [dir, setDir]         = useState("next");
  const pausedRef             = useRef(false);
  const timerRef              = useRef(null);

  const go = (next, direction = "next") => {
    if (phase !== "idle") return;
    setDir(direction);
    setPrev(cur);
    setPhase("leaving");
    setTimeout(() => {
      setCur(next);
      setPhase("entering");
      setTimeout(() => setPhase("idle"), 420);
    }, 320);
  };

  const goNext = () => go((cur + 1) % SLIDES.length, "next");
  const goPrev = () => go((cur - 1 + SLIDES.length) % SLIDES.length, "prev");
  const goTo   = (i) => { if (i !== cur) go(i, i > cur ? "next" : "prev"); };

  const startTimer = () => {
    clearInterval(timerRef.current);
    if (!pausedRef.current) timerRef.current = setInterval(goNext, autoplayMs);
  };

  useEffect(() => { startTimer(); return () => clearInterval(timerRef.current); }, [cur]);

  /* swipe */
  const touchX = useRef(0);
  const onTouchStart = (e) => (touchX.current = e.touches[0].clientX);
  const onTouchEnd   = (e) => {
    const d = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(d) > 50) { d > 0 ? goPrev() : goNext(); }
  };

  const slide = SLIDES[cur];

  return (
    <section
      className="pb-root"
      onMouseEnter={() => { pausedRef.current = true; clearInterval(timerRef.current); }}
      onMouseLeave={() => { pausedRef.current = false; startTimer(); }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <style>{css}</style>

      {/* ── Slide ── */}
      <div
        className={`pb-slide pb-${phase} pb-dir-${dir}`}
        style={{ background: slide.bg }}
        key={cur}
      >
        {/* Decorative orbs */}
        <div className="pb-orb pb-o1" style={{ background: slide.orb1 }} />
        <div className="pb-orb pb-o2" style={{ background: slide.orb2 }} />
        <div className="pb-orb pb-o3" style={{ background: slide.orb1 }} />

        {/* Grid lines decoration */}
        <div className="pb-grid" />

        <div className="pb-inner">
          {/* ── Left: Text ── */}
          <div className="pb-left">
            <div className="pb-badges">
              <span className="pb-badge">{slide.badge}</span>
              {slide.tag && <span className="pb-tag">{slide.tag}</span>}
            </div>

            <h2 className="pb-title">
              {slide.title}
              <br />
              <span className="pb-title-accent">{slide.title2}</span>
            </h2>

            <p className="pb-sub">{slide.sub}</p>

            <div className="pb-cta-row">
              <Link to={slide.ctaLink} className="pb-cta-btn">
                {slide.cta} <span className="pb-arrow-icon">→</span>
              </Link>
              {slide.discount && (
                <div className="pb-disc-badge">
                  <span className="pb-disc-top">ສ່ວນຫຼຸດ</span>
                  <span className="pb-disc-num">{slide.discount}</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Emoji / Visual ── */}
          <div className="pb-right">
            <div className="pb-emoji-ring">
              <div className="pb-emoji-inner">
                <span className="pb-emoji">{slide.emoji}</span>
              </div>
            </div>

            {/* Slide number */}
            <div className="pb-num">
              <span className="pb-num-cur">{String(cur + 1).padStart(2, "0")}</span>
              <span className="pb-num-sep">/</span>
              <span className="pb-num-tot">{String(SLIDES.length).padStart(2, "0")}</span>
            </div>
          </div>
        </div>

        {/* Bottom progress bar */}
        <div className="pb-progress-track">
          <div className="pb-progress-fill" style={{ animationDuration: `${autoplayMs}ms` }} key={`${cur}-prog`} />
        </div>
      </div>

      {/* ── Arrows ── */}
      <button className="pb-nav pb-nav-l" onClick={goPrev} aria-label="Previous">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button className="pb-nav pb-nav-r" onClick={goNext} aria-label="Next">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* ── Dots ── */}
      <div className="pb-dots">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            className={`pb-dot ${i === cur ? "active" : ""}`}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* ── Thumbnails (desktop only) ── */}
      <div className="pb-thumbs">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            className={`pb-thumb ${i === cur ? "active" : ""}`}
            onClick={() => goTo(i)}
            style={{ background: s.bg }}
            title={s.title}
          >
            <span className="pb-thumb-emoji">{s.emoji}</span>
            <span className="pb-thumb-label">{s.title}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ─── CSS ─────────────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;600;700;800;900&display=swap');

.pb-root {
  position: relative;
  width: 100%;
  user-select: none;
  overflow: hidden;
  border-radius: 0;
}

/* ── Slide ── */
.pb-slide {
  position: relative;
  width: 100%;
  min-height: 400px;
  overflow: hidden;
  transition: opacity .32s ease;
}
.pb-idle  { opacity: 1; }
.pb-leaving { opacity: 0; transform: scale(1.015); transition: opacity .3s ease, transform .3s ease; }
.pb-entering { opacity: 1; animation: pb-fadein .42s ease; }

@keyframes pb-fadein {
  from { opacity: 0; transform: translateY(10px) scale(.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* ── Decorative orbs ── */
.pb-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  pointer-events: none;
}
.pb-o1 { width: 400px; height: 400px; top: -120px; right: 60px; }
.pb-o2 { width: 300px; height: 300px; bottom: -80px; left: 20%; }
.pb-o3 { width: 200px; height: 200px; top: 30px; left: -60px; }

/* ── Grid decoration ── */
.pb-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
}

/* ── Inner layout ── */
.pb-inner {
  position: relative; z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1280px;
  margin: 0 auto;
  padding: 3rem 5rem 4.5rem;
  gap: 2rem;
  min-height: 400px;
}

/* ── Left ── */
.pb-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: .75rem;
  max-width: 560px;
}

.pb-badges {
  display: flex;
  align-items: center;
  gap: .6rem;
  flex-wrap: wrap;
}
.pb-badge {
  display: inline-flex; align-items: center;
  padding: .3rem .9rem;
  background: rgba(255,255,255,.2);
  border: 1px solid rgba(255,255,255,.35);
  border-radius: 50px;
  font-family: 'Noto Sans Lao', sans-serif;
  font-size: .75rem; font-weight: 700;
  color: #fff; letter-spacing: .06em;
  backdrop-filter: blur(8px);
}
.pb-tag {
  display: inline-flex; align-items: center;
  padding: .28rem .8rem;
  background: rgba(255,255,200,.25);
  border: 1px solid rgba(255,255,150,.4);
  border-radius: 50px;
  font-family: 'Noto Sans Lao', sans-serif;
  font-size: .72rem; font-weight: 600;
  color: #fff;
}

.pb-title {
  font-family: 'Noto Sans Lao', sans-serif;
  font-size: clamp(2rem, 4.5vw, 3.4rem);
  font-weight: 900;
  color: #fff;
  line-height: 1.15;
  margin: 0;
  letter-spacing: -.02em;
  text-shadow: 0 2px 20px rgba(0,0,0,.3);
}
.pb-title-accent {
  color: rgba(255,255,255,.75);
  font-weight: 700;
}

.pb-sub {
  font-family: 'Noto Sans Lao', sans-serif;
  font-size: clamp(.85rem, 1.5vw, 1.05rem);
  color: rgba(255,255,255,.82);
  line-height: 1.6;
  margin: 0;
  max-width: 440px;
}

.pb-cta-row {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  flex-wrap: wrap;
  margin-top: .5rem;
}

.pb-cta-btn {
  display: inline-flex; align-items: center; gap: .5rem;
  padding: .85rem 2.2rem;
  background: #fff;
  color: #1a1a2e;
  border-radius: 50px;
  font-family: 'Noto Sans Lao', sans-serif;
  font-size: .95rem; font-weight: 800;
  text-decoration: none;
  box-shadow: 0 8px 30px rgba(0,0,0,.25);
  transition: transform .2s, box-shadow .2s;
  letter-spacing: .01em;
}
.pb-cta-btn:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 14px 36px rgba(0,0,0,.35);
  color: #1a1a2e;
}
.pb-arrow-icon { transition: transform .2s; }
.pb-cta-btn:hover .pb-arrow-icon { transform: translateX(4px); }

.pb-disc-badge {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  width: 72px; height: 72px;
  border-radius: 50%;
  background: rgba(255,220,0,.95);
  box-shadow: 0 4px 20px rgba(0,0,0,.2);
  border: 3px solid rgba(255,255,255,.4);
  animation: pb-spin-badge 6s linear infinite;
}
@keyframes pb-spin-badge {
  0%,100% { transform: rotate(-5deg) scale(1); }
  50%      { transform: rotate(5deg) scale(1.05); }
}
.pb-disc-top {
  font-family: 'Noto Sans Lao', sans-serif;
  font-size: .55rem; font-weight: 700;
  color: #333; letter-spacing: .04em;
  text-transform: uppercase;
}
.pb-disc-num {
  font-family: 'Noto Sans Lao', sans-serif;
  font-size: 1.35rem; font-weight: 900;
  color: #c0392b; line-height: 1;
}

/* ── Right ── */
.pb-right {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.pb-emoji-ring {
  width: 220px; height: 220px;
  border-radius: 50%;
  background: rgba(255,255,255,.12);
  border: 2px solid rgba(255,255,255,.2);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 60px rgba(255,255,255,.08), inset 0 0 40px rgba(255,255,255,.05);
  animation: pb-float 4s ease-in-out infinite;
}
@keyframes pb-float {
  0%,100% { transform: translateY(0) rotate(-2deg); }
  50%      { transform: translateY(-14px) rotate(2deg); }
}
.pb-emoji-inner {
  width: 180px; height: 180px;
  border-radius: 50%;
  background: rgba(255,255,255,.08);
  display: flex; align-items: center; justify-content: center;
}
.pb-emoji { font-size: 6rem; line-height: 1; filter: drop-shadow(0 8px 24px rgba(0,0,0,.3)); }

.pb-num {
  display: flex; align-items: baseline; gap: .25rem;
}
.pb-num-cur {
  font-family: 'Noto Sans Lao', monospace;
  font-size: 1.8rem; font-weight: 900; color: #fff;
}
.pb-num-sep { font-size: .9rem; color: rgba(255,255,255,.4); }
.pb-num-tot { font-size: 1rem; font-weight: 600; color: rgba(255,255,255,.5); }

/* ── Progress bar ── */
.pb-progress-track {
  position: absolute; bottom: 0; left: 0; right: 0;
  height: 3px;
  background: rgba(255,255,255,.15);
  z-index: 10;
}
.pb-progress-fill {
  height: 100%;
  background: rgba(255,255,255,.8);
  animation: pb-progress linear forwards;
  transform-origin: left;
}
@keyframes pb-progress {
  from { width: 0%; }
  to   { width: 100%; }
}

/* ── Nav arrows ── */
.pb-nav {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 44px; height: 44px;
  border-radius: 50%;
  background: rgba(255,255,255,.18);
  border: 1.5px solid rgba(255,255,255,.3);
  backdrop-filter: blur(10px);
  color: #fff; cursor: pointer; z-index: 20;
  display: flex; align-items: center; justify-content: center;
  transition: background .2s, transform .2s;
  padding: 0;
}
.pb-nav svg { width: 20px; height: 20px; }
.pb-nav:hover { background: rgba(255,255,255,.35); transform: translateY(-50%) scale(1.1); }
.pb-nav-l { left: 1.25rem; }
.pb-nav-r { right: 1.25rem; }

/* ── Dots ── */
.pb-dots {
  position: absolute; bottom: 1rem; left: 50%; transform: translateX(-50%);
  display: flex; gap: .45rem; z-index: 20;
}
.pb-dot {
  width: 8px; height: 8px;
  border-radius: 50px;
  background: rgba(255,255,255,.4);
  border: none; cursor: pointer; padding: 0;
  transition: width .3s ease, background .3s ease;
}
.pb-dot.active {
  width: 28px;
  background: #fff;
}

/* ── Thumbnail strip ── */
.pb-thumbs {
  display: flex;
  border-top: 1px solid rgba(0,0,0,.08);
  background: #fff;
  overflow: hidden;
}
.pb-thumb {
  flex: 1;
  display: flex; align-items: center; gap: .5rem;
  padding: .6rem 1rem;
  border: none; cursor: pointer;
  opacity: .55;
  transition: opacity .2s;
  position: relative;
  overflow: hidden;
}
.pb-thumb::before {
  content: '';
  position: absolute; inset: 0;
  opacity: .12;
  background: inherit;
}
.pb-thumb.active { opacity: 1; }
.pb-thumb.active::after {
  content: '';
  position: absolute; bottom: 0; left: 0; right: 0;
  height: 3px;
  background: #fff;
  box-shadow: 0 0 8px rgba(255,255,255,.8);
}
.pb-thumb-emoji { font-size: 1.1rem; position: relative; z-index: 1; }
.pb-thumb-label {
  font-family: 'Noto Sans Lao', sans-serif;
  font-size: .72rem; font-weight: 700;
  color: #fff; position: relative; z-index: 1;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  text-shadow: 0 1px 4px rgba(0,0,0,.4);
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .pb-inner { padding: 2rem 3rem 4rem; }
  .pb-emoji-ring { width: 160px; height: 160px; }
  .pb-emoji-inner { width: 130px; height: 130px; }
  .pb-emoji { font-size: 4.5rem; }
  .pb-thumbs { display: none; }
}
@media (max-width: 640px) {
  .pb-slide { min-height: 280px; }
  .pb-inner { flex-direction: column; padding: 1.75rem 1.25rem 3.5rem; gap: 1rem; min-height: 280px; }
  .pb-left { order: 1; align-items: center; text-align: center; }
  .pb-title { font-size: clamp(1.5rem, 7vw, 2rem); }
  .pb-sub { display: none; }
  .pb-right { order: 0; }
  .pb-emoji-ring { width: 110px; height: 110px; }
  .pb-emoji-inner { width: 90px; height: 90px; }
  .pb-emoji { font-size: 3rem; }
  .pb-num { display: none; }
  .pb-nav-l { left: .5rem; }
  .pb-nav-r { right: .5rem; }
  .pb-nav { width: 36px; height: 36px; }
}
`;
