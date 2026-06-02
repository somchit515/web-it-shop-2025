import React, { useState, useEffect } from "react";
import { useRegisterMutation } from "../redux/authApi";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import MetaData from "../layout/MetaData";

/* ─── password strength ── */
function calcStrength(pwd) {
  if (!pwd) return 0;
  let s = 0;
  if (pwd.length >= 8)  s++;
  if (pwd.length >= 12) s++;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) s++;
  if (/\d/.test(pwd))   s++;
  if (/[^a-zA-Z0-9]/.test(pwd)) s++;
  return Math.min(s, 4);
}
const STR_CFG = [
  { label: "",         color: "#e2e8f0" },
  { label: "ອ່ອນ",    color: "#ef4444" },
  { label: "ອ່ອນ",    color: "#ef4444" },
  { label: "ປານກາງ",  color: "#f59e0b" },
  { label: "ແຂງແຮງ",  color: "#10b981" },
];

const EyeIcon = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    {open ? (
      <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
    ) : (
      <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>
    )}
  </svg>
);

export default function Register() {
  const navigate = useNavigate();
  const [register, { isLoading, error, data }] = useRegisterMutation();
  const { isAuthenticate } = useSelector((s) => s.auth);

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [show, setShow]   = useState({ password: false, confirm: false });
  const [agreed, setAgreed] = useState(false);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const { name, email, phone, password, confirm } = form;
  const strength = calcStrength(password);
  const strCfg   = STR_CFG[strength];

  /* validation */
  const RULES = {
    name:     !name.trim()                              ? "ກະລຸນາໃສ່ຊື່" : name.trim().length < 2 ? "ຊື່ຕ້ອງຢ່າງນ້ອຍ 2 ຕົວ" : "",
    email:    !email                                    ? "ກະລຸນາໃສ່ອີເມວ" : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "ຮູບແບບອີເມວບໍ່ຖືກ" : "",
    // eslint-disable-next-line no-useless-escape
    phone:    phone && !/^\+?[\d\s\-]{7,15}$/.test(phone) ? "ເບີໂທບໍ່ຖືກຕ້ອງ" : "",
    password: !password                                 ? "ກະລຸນາໃສ່ລະຫັດ" : password.length < 8 ? "ຕ້ອງຢ່າງນ້ອຍ 8 ຕົວ" : "",
    confirm:  !confirm                                  ? "ກະລຸນາຢືນຢັນລະຫັດ" : confirm !== password ? "ລະຫັດຜ່ານບໍ່ກົງກັນ" : "",
  };
  const hasErrors = Object.values(RULES).some(Boolean) || !agreed;
  const showErr = (f) => (touched[f] || submitted) && RULES[f];

  useEffect(() => {
    if (isAuthenticate) navigate("/", { replace: true });
  }, [isAuthenticate, navigate]);

  useEffect(() => {
    if (error) toast.error(error?.data?.message || "ມີຂໍ້ຜິດພາດ");
  }, [error]);

  useEffect(() => {
    if (data?.message || data?.user || data?.success) {
      toast.success("ລົງທະບຽນສຳເລັດ! 🎉");
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    }
  }, [data, navigate]);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setTouched((p) => ({ ...p, [e.target.name]: true }));
  };

  const handleBlur  = (f) => setTouched((p) => ({ ...p, [f]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTouched({ name:true, email:true, phone:true, password:true, confirm:true });
    if (hasErrors) return;
    try {
      const payload = { name: name.trim(), email: email.trim(), password };
      if (phone.trim()) payload.phone = phone.trim();
      await register(payload).unwrap();
    } catch (err) {
      toast.error(err?.data?.message || "ລົງທະບຽນບໍ່ສຳເລັດ");
    }
  };

  return (
    <>
      <MetaData title="ລົງທະບຽນ — IT HUBB" />
      <style>{CSS}</style>

      <div className="rg-root">
        {/* ── Left brand panel ── */}
        <div className="rg-brand">
          <span className="rg-orb rg-o1" /><span className="rg-orb rg-o2" /><span className="rg-orb rg-o3" />

          <div className="rg-brand-top">
            <div className="rg-logo">
              <img src="/images/logo.png" alt="IT HUBB"
                onError={(e) => { e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='60' x='50' text-anchor='middle' font-size='40' font-weight='bold' fill='white'%3EIT%3C/text%3E%3C/svg%3E"; }} />
            </div>
            <span className="rg-brand-name">IT HUBB</span>
          </div>

          <div className="rg-brand-mid">
            <div className="rg-badge">🎁 ສະມາຊິກໃໝ່ຮັບສ່ວນຫຼຸດ</div>
            <h2>ເຂົ້າຮ່ວມຄອບຄົວ<br /><span>IT HUBB ມື້ນີ້</span></h2>
            <p>ລົງທະບຽນຟຣີ ແລະ ປົດລັອກສິດທິພິເສດ ສຳລັບສະມາຊິກ</p>
            <div className="rg-perks">
              {[
                { icon: "🎁", t: "ສ່ວນຫຼຸດ 10% ຄັ້ງທຳອິດ",     s: "ໃຊ້ໄດ້ທັນທີຫຼັງລົງທະບຽນ" },
                { icon: "🚚", t: "ຈັດສົ່ງດ່ວນຟຣີ",                s: "ຊື້ ≥ ₭500,000 ຟຣີຄ່າສົ່ງ" },
                { icon: "⭐", t: "ສະສົມຄະແນນ ແລກລາງວັນ",         s: "ຍິ່ງຊື້ ຍິ່ງໄດ້ສິດທິ" },
                { icon: "🔒", t: "ຂໍ້ມູນປອດໄພ 100%",              s: "ເຂົ້າລະຫັດທຸກຂໍ້ມູນ" },
              ].map((p, i) => (
                <div key={i} className="rg-perk">
                  <div className="rg-perk-icon">{p.icon}</div>
                  <div>
                    <strong>{p.t}</strong>
                    <small>{p.s}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rg-brand-foot">
            <span>© 2026 IT HUBB</span>
            <span>ນະໂຍບາຍ</span>
            <span>ເງື່ອນໄຂ</span>
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="rg-panel">
          <div className="rg-card">
            <div className="rg-head">
              <h1>ສ້າງບັນຊີໃໝ່</h1>
              <p>ລົງທະບຽນຟຣີ ພຽງ 1 ນາທີ</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>

              {/* Name */}
              <div className="rg-field">
                <label className="rg-label">ຊື່ ແລະ ນາມສະກຸນ <span className="rg-req">*</span></label>
                <div className="rg-input-wrap">
                  <span className="rg-icon">👤</span>
                  <input className={`rg-input ${showErr("name") ? "err" : ""}`}
                    name="name" value={name} onChange={handleChange} onBlur={() => handleBlur("name")}
                    placeholder="ຊື່ຂອງທ່ານ" disabled={isLoading} autoComplete="name" />
                </div>
                {showErr("name") && <div className="rg-err">⚠️ {RULES.name}</div>}
              </div>

              {/* Email */}
              <div className="rg-field">
                <label className="rg-label">ອີເມວ <span className="rg-req">*</span></label>
                <div className="rg-input-wrap">
                  <span className="rg-icon">✉️</span>
                  <input className={`rg-input ${showErr("email") ? "err" : email && !RULES.email ? "ok" : ""}`}
                    type="email" name="email" value={email} onChange={handleChange} onBlur={() => handleBlur("email")}
                    placeholder="you@example.com" disabled={isLoading} autoComplete="email" />
                  {email && !RULES.email && <span className="rg-tick">✓</span>}
                </div>
                {showErr("email") && <div className="rg-err">⚠️ {RULES.email}</div>}
              </div>

              {/* Phone (optional) */}
              <div className="rg-field">
                <label className="rg-label">ເບີໂທ <span className="rg-opt">(ບໍ່ບັງຄັບ)</span></label>
                <div className="rg-input-wrap">
                  <span className="rg-icon">📱</span>
                  <input className={`rg-input ${showErr("phone") ? "err" : ""}`}
                    type="tel" name="phone" value={phone} onChange={handleChange} onBlur={() => handleBlur("phone")}
                    placeholder="+856 20 XXXX XXXX" disabled={isLoading} autoComplete="tel" />
                </div>
                {showErr("phone") && <div className="rg-err">⚠️ {RULES.phone}</div>}
              </div>

              {/* Password */}
              <div className="rg-field">
                <label className="rg-label">ລະຫັດຜ່ານ <span className="rg-req">*</span></label>
                <div className="rg-input-wrap">
                  <span className="rg-icon">🔑</span>
                  <input className={`rg-input ${showErr("password") ? "err" : ""}`}
                    type={show.password ? "text" : "password"} name="password"
                    value={password} onChange={handleChange} onBlur={() => handleBlur("password")}
                    placeholder="ຢ່າງນ້ອຍ 8 ຕົວ" disabled={isLoading} autoComplete="new-password" />
                  <button type="button" className="rg-eye" onClick={() => setShow(p => ({ ...p, password: !p.password }))}>
                    <EyeIcon open={show.password} />
                  </button>
                </div>
                {showErr("password") && <div className="rg-err">⚠️ {RULES.password}</div>}
                {/* Strength bar */}
                {password && (
                  <div className="rg-strength">
                    <div className="rg-str-bars">
                      {[1,2,3,4].map(l => (
                        <div key={l} className="rg-str-bar" style={{ background: l <= strength ? strCfg.color : "#e2e8f0" }} />
                      ))}
                    </div>
                    <span className="rg-str-lbl" style={{ color: strCfg.color }}>{strCfg.label}</span>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="rg-field">
                <label className="rg-label">ຢືນຢັນລະຫັດຜ່ານ <span className="rg-req">*</span></label>
                <div className="rg-input-wrap">
                  <span className="rg-icon">🔒</span>
                  <input className={`rg-input ${showErr("confirm") ? "err" : confirm && !RULES.confirm ? "ok" : ""}`}
                    type={show.confirm ? "text" : "password"} name="confirm"
                    value={confirm} onChange={handleChange} onBlur={() => handleBlur("confirm")}
                    placeholder="ໃສ່ລະຫັດຄືນໃໝ່" disabled={isLoading} autoComplete="new-password" />
                  <button type="button" className="rg-eye" onClick={() => setShow(p => ({ ...p, confirm: !p.confirm }))}>
                    <EyeIcon open={show.confirm} />
                  </button>
                  {confirm && !RULES.confirm && <span className="rg-tick">✓</span>}
                </div>
                {showErr("confirm") && <div className="rg-err">⚠️ {RULES.confirm}</div>}
              </div>

              {/* Terms checkbox */}
              <label className="rg-terms">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} disabled={isLoading} />
                <span>
                  ຂ້ອຍຍອມຮັບ{" "}
                  {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                  <a href="#" onClick={(e) => e.preventDefault()} style={{ color: "#667eea" }}>ຂໍ້ກຳນົດ</a>
                  {" "}ແລະ{" "}
                  {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                  <a href="#" onClick={(e) => e.preventDefault()} style={{ color: "#667eea" }}>ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວ</a>
                  {" "}ຂອງ IT HUBB
                </span>
              </label>
              {submitted && !agreed && <div className="rg-err" style={{ marginTop: -8 }}>⚠️ ກະລຸນາຍອມຮັບເງື່ອນໄຂ</div>}

              {/* Submit */}
              <button type="submit" className="rg-btn" disabled={isLoading}>
                {isLoading
                  ? <><span className="rg-spinner" /> ກຳລັງລົງທະບຽນ...</>
                  : "ລົງທະບຽນ →"}
              </button>

              {/* Divider */}
              <div className="rg-divider"><span>ຫຼື</span></div>

              {/* Login link */}
              <div className="rg-footer">
                ມີບັນຊີແລ້ວ?{" "}
                <Link to="/login">ເຂົ້າສູ່ລະບົບ →</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── CSS ─────────────────────────────────────────────── */
const CSS = `
*{box-sizing:border-box;margin:0;padding:0;}
html,body,#root{height:100%;width:100%;overflow-x:clip;}
body{font-family:"Noto Sans Lao","Inter",-apple-system,sans-serif;-webkit-font-smoothing:antialiased;}

.rg-root{min-height:100vh;width:100vw;position:fixed;inset:0;display:flex;overflow:hidden;background:#0f172a;}

/* ── Brand panel ── */
.rg-brand{
  flex:1.1;position:relative;display:flex;flex-direction:column;
  justify-content:space-between;padding:52px 60px;overflow:hidden;
  background:
    radial-gradient(circle at 15% 20%,rgba(99,102,241,.55) 0%,transparent 50%),
    radial-gradient(circle at 85% 80%,rgba(236,72,153,.45) 0%,transparent 50%),
    radial-gradient(circle at 50% 50%,rgba(56,189,248,.3) 0%,transparent 60%),
    linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#312e81 100%);
}
.rg-brand::before{
  content:'';position:absolute;inset:0;
  background-image:radial-gradient(rgba(255,255,255,.07) 1.5px,transparent 1.5px);
  background-size:28px 28px;
  mask-image:radial-gradient(ellipse at center,black 30%,transparent 75%);
  -webkit-mask-image:radial-gradient(ellipse at center,black 30%,transparent 75%);
  pointer-events:none;
}
.rg-orb{position:absolute;border-radius:50%;filter:blur(60px);pointer-events:none;animation:rgFloat 12s ease-in-out infinite;}
.rg-o1{width:320px;height:320px;background:radial-gradient(circle,rgba(168,85,247,.6),transparent 70%);top:-80px;left:-80px;}
.rg-o2{width:280px;height:280px;background:radial-gradient(circle,rgba(56,189,248,.5),transparent 70%);bottom:-60px;right:-60px;animation-delay:-6s;}
.rg-o3{width:220px;height:220px;background:radial-gradient(circle,rgba(236,72,153,.4),transparent 70%);top:40%;right:20%;animation-delay:-3s;}
@keyframes rgFloat{0%,100%{transform:translate(0,0) scale(1);}33%{transform:translate(30px,-40px) scale(1.08);}66%{transform:translate(-20px,30px) scale(.95);}}

.rg-brand-top{position:relative;z-index:2;display:flex;align-items:center;gap:14px;}
.rg-logo{width:50px;height:50px;border-radius:14px;background:linear-gradient(135deg,#818cf8,#c084fc);display:grid;place-items:center;padding:9px;box-shadow:0 10px 30px rgba(129,140,248,.5);}
.rg-logo img{width:100%;height:100%;object-fit:contain;}
.rg-brand-name{color:#fff;font-size:21px;font-weight:800;letter-spacing:.5px;}

.rg-brand-mid{position:relative;z-index:2;color:#fff;}
.rg-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 14px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);border-radius:999px;font-size:12px;font-weight:600;color:rgba(255,255,255,.9);margin-bottom:22px;backdrop-filter:blur(10px);}
.rg-brand-mid h2{font-size:clamp(28px,3.2vw,44px);font-weight:800;line-height:1.15;margin-bottom:16px;letter-spacing:-1px;}
.rg-brand-mid h2 span{background:linear-gradient(135deg,#c084fc 0%,#f0abfc 50%,#fbcfe8 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
.rg-brand-mid p{font-size:15px;line-height:1.65;color:rgba(255,255,255,.7);margin-bottom:28px;}
.rg-perks{display:flex;flex-direction:column;gap:10px;max-width:500px;}
.rg-perk{display:flex;align-items:center;gap:14px;padding:12px 16px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:14px;backdrop-filter:blur(10px);transition:all .3s;}
.rg-perk:hover{background:rgba(255,255,255,.09);transform:translateX(4px);border-color:rgba(192,132,252,.4);}
.rg-perk-icon{width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,rgba(129,140,248,.3),rgba(192,132,252,.3));border:1px solid rgba(192,132,252,.3);display:grid;place-items:center;font-size:15px;flex-shrink:0;}
.rg-perk strong{display:block;font-size:13px;font-weight:700;color:#fff;}
.rg-perk small{display:block;font-size:11px;color:rgba(255,255,255,.55);margin-top:2px;}

.rg-brand-foot{position:relative;z-index:2;display:flex;gap:20px;color:rgba(255,255,255,.45);font-size:12px;}
.rg-brand-foot span:hover{color:#fff;cursor:pointer;}

/* ── Form panel ── */
.rg-panel{flex:.9;background:linear-gradient(180deg,#fafbff 0%,#f1f5f9 100%);display:flex;align-items:flex-start;justify-content:center;padding:32px 36px;overflow-y:auto;}
.rg-card{width:100%;max-width:500px;background:#fff;border-radius:22px;padding:40px 40px 36px;box-shadow:0 1px 3px rgba(0,0,0,.05),0 20px 50px rgba(15,23,42,.09);border:1px solid rgba(226,232,240,.8);animation:rgSlide .5s cubic-bezier(.4,0,.2,1);margin:auto 0;}
@keyframes rgSlide{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}

.rg-head{margin-bottom:26px;}
.rg-head h1{font-size:26px;font-weight:800;color:#0f172a;margin-bottom:5px;letter-spacing:-.3px;}
.rg-head p{font-size:14px;color:#64748b;}

/* field */
.rg-field{margin-bottom:16px;}
.rg-label{display:block;font-size:13px;font-weight:700;color:#334155;margin-bottom:6px;}
.rg-req{color:#ef4444;margin-left:2px;}
.rg-opt{color:#94a3b8;font-weight:500;font-size:11px;margin-left:4px;}
.rg-input-wrap{position:relative;display:flex;align-items:center;}
.rg-icon{position:absolute;left:13px;font-size:.82rem;pointer-events:none;z-index:1;}
.rg-input{width:100%;padding:12px 44px 12px 38px;border:1.5px solid #e2e8f0;border-radius:11px;font-size:14px;font-family:inherit;transition:all .2s;background:#fff;color:#1e293b;outline:none;}
.rg-input:focus{border-color:#667eea;box-shadow:0 0 0 3px rgba(102,126,234,.1);}
.rg-input.err{border-color:#ef4444;box-shadow:0 0 0 3px rgba(239,68,68,.08);}
.rg-input.ok{border-color:#10b981;box-shadow:0 0 0 3px rgba(16,185,129,.08);}
.rg-input:disabled{background:#f8fafc;cursor:not-allowed;}
.rg-eye{position:absolute;right:11px;background:none;border:none;cursor:pointer;color:#94a3b8;padding:5px;border-radius:6px;display:flex;align-items:center;transition:all .15s;z-index:1;}
.rg-eye:hover{background:#f1f5f9;color:#667eea;}
.rg-tick{position:absolute;right:38px;color:#10b981;font-size:.85rem;font-weight:700;z-index:1;}
.rg-err{font-size:12px;color:#ef4444;margin-top:4px;font-weight:600;}

/* strength */
.rg-strength{display:flex;align-items:center;gap:8px;margin-top:8px;}
.rg-str-bars{flex:1;display:flex;gap:4px;}
.rg-str-bar{height:4px;flex:1;border-radius:999px;transition:background .3s;}
.rg-str-lbl{font-size:11px;font-weight:700;min-width:48px;text-align:right;}

/* terms */
.rg-terms{display:flex;align-items:flex-start;gap:10px;margin:14px 0 8px;cursor:pointer;font-size:13px;color:#475569;line-height:1.5;}
.rg-terms input{width:16px;height:16px;border-radius:4px;accent-color:#667eea;flex-shrink:0;margin-top:2px;cursor:pointer;}

/* btn */
.rg-btn{width:100%;padding:13px;border-radius:12px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;border:none;font-size:15px;font-weight:700;cursor:pointer;transition:all .25s;box-shadow:0 8px 20px rgba(102,126,234,.3);display:flex;align-items:center;justify-content:center;gap:8px;margin-top:16px;font-family:inherit;}
.rg-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 12px 28px rgba(102,126,234,.42);}
.rg-btn:disabled{opacity:.65;cursor:not-allowed;}
.rg-spinner{width:18px;height:18px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:rgSpin .6s linear infinite;flex-shrink:0;}
@keyframes rgSpin{to{transform:rotate(360deg);}}

/* divider */
.rg-divider{position:relative;text-align:center;margin:18px 0 14px;}
.rg-divider::before{content:'';position:absolute;left:0;top:50%;width:100%;height:1px;background:#e2e8f0;}
.rg-divider span{position:relative;z-index:1;background:#fff;padding:0 12px;font-size:12px;color:#94a3b8;}

/* footer */
.rg-footer{text-align:center;font-size:13px;color:#64748b;}
.rg-footer a{color:#667eea;font-weight:700;text-decoration:none;transition:color .15s;}
.rg-footer a:hover{color:#764ba2;}

/* responsive */
@media(max-width:1024px){.rg-brand{display:none;}.rg-panel{flex:1;}}
@media(max-width:640px){.rg-panel{padding:16px;}.rg-card{padding:28px 22px;}.rg-head h1{font-size:22px;}.rg-input{font-size:16px;}}
`;
