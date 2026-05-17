import React, { useEffect, useState } from "react";
import MetaData from "../layout/MetaData";
import CheckoutStep from "./CheckoutStep";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { saveShippingInfo } from "../redux/features/shippingSlice";
import { countries as countryData } from "countries-list";
import "./Shipping.css";

/* ----------  shipping carriers  ---------- */
// ✅ ใช้ shared constants — single source of truth สำหรับทุกหน้า
import { SHIPPING_CARRIERS } from "../../constans/shipping";

/* ----------  country list  ---------- */
const baseCountries = Object.entries(countryData)
  .map(([code, info]) => ({ code, name: info.name }))
  .sort((a, b) => a.name.localeCompare(b.name));

const countries = [
  { code: "LA", name: "Laos" },
  ...baseCountries.filter((c) => c.code !== "LA"),
];

/* ----------  Sub-components (Defined outside to prevent re-mounting)  ---------- */

const BranchSelection = ({ branch, setBranch }) => {
  return (
    <div className="branch-selection-box" style={{ marginTop: '20px', padding: '15px', background: '#f9fafb', borderRadius: '12px', border: '1px dashed #d1d5db' }}>
      <div className="branch-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <div className="branch-icon" style={{ fontSize: '20px', marginRight: '10px' }}>📍</div>
        <div>
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>ລະບຸສາຂາ ຫຼື ໝາຍເຫດການຈັດສົ່ງ</h4>
          <p className="optional-badge" style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>ບໍ່ບັງຄັບ - ພິມຂໍ້ມູນທີ່ຕ້ອງການລະບຸໄດ້ທີ່ນີ້</p>
        </div>
      </div>
      <textarea
        id="branch_field"
        className="form-control-branch"
        rows="3"
        value={branch}
        onChange={(e) => setBranch(e.target.value)}
        placeholder="ຕົວຢ່າງ: ສາຂາຕະຫຼາດເຊົ້າ, ຝາກໄວ້ທີ່ປ້ອມຍาม, ຫຼື ຂໍ້ມູນອື່ນໆ..."
        style={{ 
          width: '100%', 
          padding: '12px', 
          borderRadius: '8px', 
          border: '1px solid #d1d5db',
          fontSize: '14px',
          outline: 'none',
          transition: 'border-color 0.2s',
          resize: 'vertical'
        }}
        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
      />
      <div className="branch-helper" style={{ marginTop: '8px', fontSize: '12px', color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
        💡 ທ່ານສາມາດລະບຸສາຂາຂົນສົ່ງທີ່ສະດວກ ຫຼື ຂໍ້ຄວາມເພີ່ມເຕີມເຖິງຜູ້ຂາຍໄດ້
      </div>
    </div>
  );
};

/* ----------  main component  ---------- */
export default function Shipping() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { shippingInfo = {} } = useSelector((state) => state.shipping || {});
  const { cartItems = [] } = useSelector((state) => state.cart || {});

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart', { replace: true });
    }
    // deps [] = ກວດສະເພາະຕອນ mount, ບໍ່ trigger ຫຼັງ clearCart
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* form fields */
  const [address, setAddress] = useState(shippingInfo.address || "");
  const [province, setProvince] = useState(shippingInfo.province || "");
  const [city, setCity] = useState(shippingInfo.city || "");
  const [phoneNo, setPhoneNo] = useState(shippingInfo.phoneNo || "");
  const [zipCode, setZipCode] = useState(shippingInfo.zipCode || "");
  const [country, setCountry] = useState(shippingInfo.country || "Laos");

  const [shippingCarrier, setShippingCarrier] = useState(
    shippingInfo.shippingCarrierCode || SHIPPING_CARRIERS[0].code
  );
  const [branch, setBranch] = useState(shippingInfo.branch || "");

  const [step, setStep] = useState(1);

  const currentCarrier =
    SHIPPING_CARRIERS.find((c) => c.code === shippingCarrier) ||
    SHIPPING_CARRIERS[0];

  /* ----------  helpers  ---------- */
  const isPhoneValid = (p) => {
    if (!p) return false;
    const normalized = p.trim();
    const re = /^\+856(20|30)\d{6,8}$/;
    return re.test(normalized);
  };

  const handlePhoneChange = (e) => {
    let value = String(e.target.value || "").replace(/\s+/g, "");
    if (/^0(20|30)\d*$/.test(value)) value = "+856" + value.substring(1);
    if (/^(20|30)\d*$/.test(value)) value = "+856" + value;
    if (/^856(20|30)\d*$/.test(value)) value = "+" + value;
    value = value.replace(/(?!^\+)[^\d]/g, "");
    if (value.length > 16) value = value.slice(0, 16);
    setPhoneNo(value);
  };

  const phoneHelper = () => {
    if (!phoneNo) return "ຮູບແບບ: +85620xxxxxxx ຫຼື +85630xxxxxxx";
    return isPhoneValid(phoneNo)
      ? "✅ ເບີຖືກຕ້ອງ"
      : "❌ ບໍ່ຖືກ: +85620xxxxxxx ຫຼື +85630xxxxxxx";
  };

  const isFormValid = () =>
    address.trim().length > 0 &&
    province.trim().length > 0 &&
    city.trim().length > 0 &&
    isPhoneValid(phoneNo) &&
    country.trim().length > 0 &&
    shippingCarrier.trim().length > 0;

  const submitHandler = (e) => {
    e.preventDefault();
    if (!isPhoneValid(phoneNo))
      return toast.error(
        "ເບີໂທຕ້ອງເປັນ +85620xxxxxxx ຫຼື +85630xxxxxxx (6–8 ຕົວໜ່ວຍຫຼັງ)"
      );
    if (!isFormValid())
      return toast.error("ກະລຸນາຕື່ມຂໍ້ມູນທັງໝົດ");

    dispatch(
      saveShippingInfo({
        address: address.trim(),
        province: province.trim(),
        city: city.trim(),
        phoneNo: phoneNo.trim(),
        zipCode: zipCode.trim(),
        country: country.trim(),
        shippingCarrier: currentCarrier.name,
        shippingCarrierCode: shippingCarrier,
        branch: branch.trim(),
      })
    );
    toast.success("ບັນທຶກຂໍ້ມູນການຂົນສົ່ງສຳເລັດ");
    navigate("/confirm_order");
  };

  /* ----------  UI components  ---------- */
  const ProgressBar = () => (
    <div className="progress-container">
      <div className="progress-step">
        <div className={`step-number ${step >= 1 ? "active" : ""}`}>1</div>
        <div className="step-label">ທີ່ຢູ່</div>
      </div>
      <div className="progress-line" />
      <div className="progress-step">
        <div className={`step-number ${step >= 2 ? "active" : ""}`}>2</div>
        <div className="step-label">ຜູ້ຂົນສົ່ງ</div>
      </div>
      <div className="progress-line" />
      <div className="progress-step">
        <div className={`step-number ${step >= 3 ? "active" : ""}`}>3</div>
        <div className="step-label">ຢືນຢັນ</div>
      </div>
    </div>
  );

  const CarrierSelection = () => (
    <div className="carrier-selection">
      <h3>ເລືອກຜູ້ໃຫ້ບໍລິການຂົນສົ່ງ</h3>
      <div className="carrier-cards">
        {SHIPPING_CARRIERS.filter(
          (c) => country === "Laos" || c.code === "INTERNATIONAL"
        ).map((c) => {
          const feeText =
            c.baseFee === 0
              ? "ຟຣີ"
              : `${c.baseFee.toLocaleString()} ກີບ`;
          const freeNote =
            c.freeShippingThreshold && c.freeShippingThreshold > 0
              ? `ຟຣີຄ່າສົ່ງເມື່ອສັ່ງ ≥ ${c.freeShippingThreshold.toLocaleString()} ກີບ`
              : null;
          return (
            <div
              key={c.code}
              className={`carrier-card ${
                shippingCarrier === c.code ? "selected" : ""
              }`}
              onClick={() => setShippingCarrier(c.code)}
            >
              <div className="carrier-logo">
                <img src={c.logo} alt={c.name} />
              </div>
              <div className="carrier-info">
                <h4>{c.name}</h4>
                <p>{c.description}</p>
                <span className="delivery-time">🚚 {c.deliveryTime}</span>
                {/* ✅ แสดงราคาค่าส่ง */}
                <div
                  style={{
                    marginTop: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      color: c.baseFee === 0 ? '#10b981' : '#0f63ff',
                      fontSize: '0.95rem',
                    }}
                  >
                    💰 {feeText}
                  </span>
                  {freeNote && (
                    <span style={{ fontSize: '0.78rem', color: '#10b981' }}>
                      ✨ {freeNote}
                    </span>
                  )}
                </div>
              </div>
              <div className="carrier-radio" />
            </div>
          );
        })}
      </div>
    </div>
  );

  /* ----------  render  ---------- */
  return (
    <>
      <MetaData title={"ຂໍ້ມູນຂົນສົ່ງ"} />
      <CheckoutStep shipping />

      <div className="shipping-root">
        <div className="shipping-wrap">
          <ProgressBar />

          <form className="card-form" onSubmit={submitHandler} noValidate>
            {step === 1 && (
              <>
                <div className="section-header">
                  <h3>ຂໍ້ມູນທີ່ຢູ່</h3>
                  <p>ກະລຸນາປ້ອນຂໍ້ມູນທີ່ຢູ່ຂອງທ່ານ</p>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label className="form-label">ທີ່ຢູ່</label>
                  <input
                    className="form-control"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="ບ້ານເລກທີ່, ຖະໜົນ, ບ້ານ"
                    required
                  />
                </div>

                <div className="form-row">
                  <div>
                    <label className="form-label">ແຂວງ</label>
                    <input
                      className="form-control"
                      type="text"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      placeholder="ເຊັ່ນ: ວຽງຈັນ, ສະຫວັນນະເຂດ"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">ເມືອງ</label>
                    <input
                      className="form-control"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="ເຊັ່ນ: ໄຊທານີ, ຫຼວງພະບາງ"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div>
                    <label className="form-label">ເບີໂທ</label>
                    <input
                      className={`form-control ${
                        phoneNo && !isPhoneValid(phoneNo) ? "is-invalid" : ""
                      }`}
                      type="tel"
                      value={phoneNo}
                      onChange={handlePhoneChange}
                      placeholder="+85620xxxxxxx ຫຼື +85630xxxxxxx"
                      required
                    />
                    <div
                      className="phone-hint"
                      style={{
                        color:
                          phoneNo && !isPhoneValid(phoneNo)
                            ? "var(--error)"
                            : "var(--muted)",
                      }}
                    >
                      {phoneHelper()}
                    </div>
                  </div>
                  <div>
                    <label className="form-label">ລະຫັດໄປສະນີ (ຖ້າມີ)</label>
                    <input
                      className="form-control"
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="ລະຫັດໄປສະນີ"
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label className="form-label">ປະເທດ</label>
                  <select
                    className="form-select"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                  >
                    {countries.map((c) => (
                      <option key={c.code} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="submit-row">
                  <button
                    type="button"
                    className="btn-primary-custom"
                    onClick={() => setStep(2)}
                    disabled={
                      !address ||
                      !province ||
                      !city ||
                      !isPhoneValid(phoneNo)
                    }
                  >
                    ຕໍ່ໄປ ▶
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="section-header">
                  <h3>ເລືອກຜູ້ຂົນສົ່ງ</h3>
                  <p>ເລືອກຜູ້ໃຫ້ບໍລິການຂົນສົ່ງທີ່ທ່ານຕ້ອງການ</p>
                </div>

                <CarrierSelection />
                
                {/* Fixed: BranchSelection is now a stable component reference */}
                <BranchSelection branch={branch} setBranch={setBranch} />

                <div className="submit-row">
                  <button
                    type="button"
                    className="btn-primary-custom"
                    style={{ marginRight: 12, background: "#6b7280" }}
                    onClick={() => setStep(1)}
                  >
                    ◀ ກັບຄືນ
                  </button>
                  <button
                    type="button"
                    className="btn-primary-custom"
                    onClick={() => setStep(3)}
                    disabled={!shippingCarrier}
                  >
                    ຕໍ່ໄປ ▶
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="section-header">
                  <h3>ຢືນຢັນຂໍ້ມູນ</h3>
                  <p>ກະລຸນາກວດສອບຂໍ້ມູນຂອງທ່ານອີກຄັ້ງ</p>
                </div>

                <div className="review-section">
                  <div className="review-card">
                    <h4>ທີ່ຢູ່ຈັດສົ່ງ</h4>
                    <div className="review-item">
                      <span className="review-label">ທີ່ຢູ່:</span>
                      <span>{address}</span>
                    </div>
                    <div className="review-item">
                      <span className="review-label">ເມືອງ:</span>
                      <span>{city}</span>
                    </div>
                    <div className="review-item">
                      <span className="review-label">ແຂວງ:</span>
                      <span>{province}</span>
                    </div>
                    <div className="review-item">
                      <span className="review-label">ລະຫັດໄປສະນີ:</span>
                      <span>{zipCode || "-"}</span>
                    </div>
                    <div className="review-item">
                      <span className="review-label">ເບີໂທ:</span>
                      <span>{phoneNo}</span>
                    </div>
                  </div>

                  <div className="review-card">
                    <h4>ຜູ້ຂົນສົ່ງ</h4>
                    <div className="review-item">
                      <span className="review-label">ຜູ້ໃຫ້ບໍລິການ:</span>
                      <span>{currentCarrier.name}</span>
                    </div>
                    <div className="review-item">
                      <span className="review-label">ສາຂາ/ໝາຍເຫດ:</span>
                      <span>{branch || "-"}</span>
                    </div>
                    <div className="review-item">
                      <span className="review-label">ເວລາຈັດສົ່ງ:</span>
                      <span>{currentCarrier.deliveryTime}</span>
                    </div>
                  </div>
                </div>

                <div className="submit-row">
                  <button
                    type="button"
                    className="btn-primary-custom"
                    style={{ marginRight: 12, background: "#6b7280" }}
                    onClick={() => setStep(2)}
                  >
                    ◀ ແກ້ໄຂ
                  </button>
                  <button type="submit" className="btn-primary-custom">
                    ✅ ຢືນຢັນການສັ່ງຊື້
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
