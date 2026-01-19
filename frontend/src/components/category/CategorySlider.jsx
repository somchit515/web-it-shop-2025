// src/components/category/CategorySlider.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CATEGORIES } from "../../utils/categories";
import "./CategorySlider.css";

export default function CategorySlider({ interval = 4500 }) {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);
  const pausedRef = useRef(false);
  const hasCats = CATEGORIES.length > 0;

  /* ---------- autoplay ---------- */
  const start = () => {
    if (pausedRef.current) return;
    stop();
    timerRef.current = setInterval(() => setIdx((i) => (i + 1) % CATEGORIES.length), interval);
  };
  const stop = () => clearInterval(timerRef.current);

  useEffect(() => {
    if (hasCats) start();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  /* ---------- control ---------- */
  const prev = () => setIdx((i) => (i - 1 + CATEGORIES.length) % CATEGORIES.length);
  const next = () => setIdx((i) => (i + 1) % CATEGORIES.length);
  const go = (i) => setIdx(i);

  const pause = () => (pausedRef.current = true);
  const resume = () => {
    pausedRef.current = false;
    start();
  };

  /* ---------- swipe ---------- */
  const touchX = useRef(0);
  const onTouchStart = (e) => (touchX.current = e.touches[0].clientX);
  const onTouchEnd = (e) => {
    const diff = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(diff) > 60) {
      diff > 0 ? prev() : next();
      pause();
    }
    resume();
  };

  /* ---------- keyboard ---------- */
  const onKey = (e) => {
    if (e.key === "ArrowLeft") {
      prev();
      pause();
    }
    if (e.key === "ArrowRight") {
      next();
      pause();
    }
  };

  if (!hasCats)
    return <div className="alert alert-warning text-center">ບໍ່ມີໝວດໝູ່ສິນຄ້າທີ່ຈະສະແດງ.</div>;

  const cur = CATEGORIES[idx];

  return (
    <section
      className="cat-slider"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
      onKeyDown={onKey}
      tabIndex={0}
      aria-label="Category slider"
    >
      <div className="cat-slide" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <Link to={`/category/${cur.slug}`} className="cat-link">
          <img src={cur.img} alt={cur.title} loading="lazy" />
          <div className="cat-overlay" />
          <div className="cat-info">
            <h3 className="cat-title">{cur.title}</h3>
            <p className="cat-desc">ເບິ່ງສິນຄ້າໃນໝວດໝູ່ {cur.title}</p>
            <span className="cat-btn">ເບິ່ງສິນຄ້າ</span>
          </div>
        </Link>
      </div>

      {/* arrows (SVG inline) */}
      <button className="cat-arrow cat-prev" onClick={() => { prev(); pause(); }} aria-label="Previous">
        <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
          <path d="M11.354 1.646a.5.5 0 010 .708L5.707 8l5.647 5.646a.5.5 0 01-.708.708l-6-6a.5.5 0 010-.708l6-6a.5.5 0 01.708 0z" />
        </svg>
      </button>
      <button className="cat-arrow cat-next" onClick={() => { next(); pause(); }} aria-label="Next">
        <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4.646 1.646a.5.5 0 01.708 0l6 6a.5.5 0 010 .708l-6 6a.5.5 0 01-.708-.708L10.293 8 4.646 2.354a.5.5 0 010-.708z" />
        </svg>
      </button>

      {/* indicators */}
      <div className="cat-dots">
        {CATEGORIES.map((c, i) => (
          <button
            key={c.slug}
            className={`cat-dot ${i === idx ? "active" : ""}`}
            onClick={() => { go(i); pause(); }}
            aria-label={c.title}
          />
        ))}
      </div>
    </section>
  );
}