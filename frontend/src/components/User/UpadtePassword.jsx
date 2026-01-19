// src/pages/UpdatePassword.jsx
import React, { useEffect, useState } from 'react';
import Userlayout from '../layout/Userlayout';
import { useNavigate } from 'react-router-dom';
import { useUpdatePasswordMutation } from '../redux/api/userApi';
import toast from 'react-hot-toast';
import MetaData from '../layout/MetaData';

// FontAwesome icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

function UpdatePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [Password, setPassword] = useState(''); // keep backend field name
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const navigate = useNavigate();
  const [updatePassword, { isLoading, error, isSuccess }] = useUpdatePasswordMutation();

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message || 'ມີບາງຢ່າງຜິດພາດ');
    }
    if (isSuccess) {
      toast.success('ອັບເດດລະຫັດຜ່ານສຳເລັດ');
      navigate('/me/profile');
    }
  }, [error, isSuccess, navigate]);

  const passwordStrength = () => {
    if (!Password) return { label: 'ປຶກສາ', score: 0 };
    let score = 0;
    if (Password.length >= 8) score += 1;
    if (/[A-Z]/.test(Password)) score += 1;
    if (/[0-9]/.test(Password)) score += 1;
    if (/[^A-Za-z0-9]/.test(Password)) score += 1;
    if (score <= 1) return { label: 'ງ່າຍ', score };
    if (score === 2) return { label: 'ທຳມະດາ', score };
    if (score === 3) return { label: 'ດີ', score };
    return { label: 'ແຂງແກ່ນ', score };
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!oldPassword || !Password) {
      return toast.error('ກະລຸນາໃສ່ລະຫັດເກົ່າ ແລະ ລະຫັດໃໝ່');
    }
    if (Password.length < 8) {
      return toast.error('ລະຫັດໃໝ່ຕ້ອງຢ່າງນ້ອຍ 8 ຕົວ');
    }

    updatePassword({ oldPassword, password: Password });
  };

  const strength = passwordStrength();

  return (
    <>
      <MetaData title={'ອັບເດດລະຫັດຜ່ານ'} />
      <Userlayout>
        <style>{`
          /* Color system: primary blue, secondary green */
          :root {
            --primary: #0f63ff; /* blue */
            --primary-600: #0b53e6;
            --accent: #16a34a; /* green */
            --muted: #6b7280;
            --card-bg: #ffffff;
            --soft-shadow: 0 8px 30px rgba(15, 99, 255, 0.08);
            --radius: 12px;
          }

          .update-card {
            background: linear-gradient(180deg, #ffffff, #fbfdff);
            padding: 28px;
            border-radius: var(--radius);
            box-shadow: var(--soft-shadow);
            border: 1px solid rgba(11,18,32,0.04);
          }

          .update-title {
            font-weight: 700;
            color: var(--primary);
            letter-spacing: -0.2px;
          }

          .form-label {
            font-weight: 600;
            color: #0b1220;
          }

          .input-group .form-control {
            border-radius: 10px 0 0 10px;
            border-right: 0;
          }
          .input-group .btn-icon {
            border-radius: 0 10px 10px 0;
            border-left: 0;
            width: 48px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }

          .form-control:focus {
            box-shadow: 0 6px 20px rgba(15,99,255,0.12);
            border-color: var(--primary);
            outline: none;
          }

          .progress {
            background: rgba(11,18,32,0.06);
            border-radius: 8px;
            height: 8px;
          }
          .progress-bar {
            transition: width .25s ease;
          }

          .btn-primary {
            background: linear-gradient(90deg, var(--primary), var(--primary-600));
            border: none;
            border-radius: 10px;
            padding: 10px 14px;
            font-weight: 700;
            box-shadow: 0 8px 22px rgba(15,99,255,0.12);
            transition: transform .12s ease, box-shadow .12s ease;
          }
          .btn-primary:disabled {
            opacity: .65;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }
          .btn-primary:hover:not(:disabled) {
            transform: translateY(-3px);
            box-shadow: 0 14px 36px rgba(15,99,255,0.14);
          }

          .helper {
            font-size: 0.9rem;
            color: var(--muted);
          }

          @media (max-width: 720px) {
            .update-card { padding: 18px; }
          }
        `}</style>

        <div className="row wrapper">
          <div className="col-10 col-md-8 col-lg-6 mx-auto">
            <div className="update-card mt-4">
              <h2 className="update-title mb-3 text-center">ອັບເດດລະຫັດຜ່ານ</h2>

              <form onSubmit={submitHandler} aria-label="Update password form">
                {/* old password */}
                <div className="mb-3">
                  <label htmlFor="old_password_field" className="form-label">ລະຫັດຜ່ານເກົ່າ</label>
                  <div className="input-group">
                    <input
                      type={showOld ? 'text' : 'password'}
                      id="old_password_field"
                      className="form-control"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="ປ້ອນລະຫັດເກົ່າ"
                      aria-label="Old password"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-icon"
                      onClick={() => setShowOld(s => !s)}
                      aria-pressed={showOld}
                      aria-label={showOld ? 'Hide old password' : 'Show old password'}
                      title={showOld ? 'ປິດ' : 'ເບິ່ງ'}
                    >
                      <FontAwesomeIcon icon={showOld ? faEyeSlash : faEye} />
                    </button>
                  </div>
                  <div className="helper mt-2">ກະລຸນາໃສ່ລະຫັດທີ່ທ່ານນຳໃຊ້ລ່າສຸດ</div>
                </div>

                {/* new password */}
                <div className="mb-3">
                  <label htmlFor="new_password_field" className="form-label">ລະຫັດຜ່ານໃໝ່</label>
                  <div className="input-group">
                    <input
                      type={showNew ? 'text' : 'password'}
                      id="new_password_field"
                      className="form-control"
                      value={Password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="อย่างน้อย 8 ตัว เช่น รวมตัวพิมพ์ใหญ่/เลข/สัญลักษณ์"
                      aria-label="New password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-icon"
                      onClick={() => setShowNew(s => !s)}
                      aria-pressed={showNew}
                      aria-label={showNew ? 'Hide new password' : 'Show new password'}
                      title={showNew ? 'ປິດ' : 'ເບິ່ງ'}
                    >
                      <FontAwesomeIcon icon={showNew ? faEyeSlash : faEye} />
                    </button>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <small className="helper">ຄວາມຍາວ: {Password.length} ຕົວ</small>
                    <small className={strength.score >= 3 ? 'text-success' : strength.score === 2 ? 'text-warning' : 'text-danger'}>
                      {strength.label}
                    </small>
                  </div>

                  <div className="progress mt-2" style={{ height: 8 }}>
                    <div
                      className={`progress-bar ${strength.score >= 3 ? 'bg-success' : strength.score === 2 ? 'bg-warning' : 'bg-danger'}`}
                      role="progressbar"
                      style={{ width: `${(strength.score / 4) * 100}%` }}
                      aria-valuenow={(strength.score / 4) * 100}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    />
                  </div>
                </div>

                <div className="d-grid mt-4">
                  <button type="submit" className="btn btn-primary" disabled={isLoading} aria-disabled={isLoading}>
                    {isLoading ? 'ກຳລັງອັບເດດ...' : 'ອັບເດດລະຫັດ'}
                  </button>
                </div>

                <div className="mt-3 helper text-muted">
                  ຄໍາແນະນໍາ: ລະຫັດທີ່ແນະນໍາ ຄວນມີຕົວອັກສອນໃຫຍ່, ຕົວໝາຍ ແລະ ຈໍານວນ 8 ຕົວຂື້ນໄປ.
                </div>
              </form>
            </div>
          </div>
        </div>
      </Userlayout>
    </>
  );
}

export default UpdatePassword;
