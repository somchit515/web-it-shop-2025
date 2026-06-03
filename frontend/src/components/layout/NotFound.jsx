import React from "react";
import { Link } from "react-router-dom";
import MetaData from "./MetaData";
import "./NotFound.css";

export default function NotFound() {
  return (
    <>
      <MetaData title="404 — ບໍ່ພົບໜ້ານີ້" />
      <div className="notfound-wrap">
        <div className="notfound-card">
          <div className="notfound-code">404</div>
          <div className="notfound-icon">🔍</div>
          <h1 className="notfound-title">ບໍ່ພົບໜ້ານີ້</h1>
          <p className="notfound-desc">
            ໜ້າທີ່ທ່ານຊອກຫາອາດຖືກລຶບ, ຍ້າຍ, ຫຼືບໍ່ເຄີຍມີຢູ່
          </p>
          <div className="notfound-actions">
            <Link to="/" className="notfound-btn-primary">
              ກັບຫນ້າຫຼັກ
            </Link>
            <Link to="/search" className="notfound-btn-secondary">
              ຄົ້ນຫາສິນຄ້າ
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
