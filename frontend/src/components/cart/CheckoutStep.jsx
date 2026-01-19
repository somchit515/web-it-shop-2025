import React from "react";
import { Link } from "react-router-dom";

const Step = ({ to, label, subtitle, active, completed, stepNumber, ariaLabel }) => {
  const inner = (
    <>
      <div className={`step-indicator ${completed ? 'completed' : active ? 'active' : 'inactive'}`}>
        {completed ? (
          <i className="fas fa-check"></i>
        ) : (
          <span className="step-number">{stepNumber}</span>
        )}
      </div>

      <div className="step-content">
        <div className="step-title">{label}</div>
        <div className="step-subtitle">{subtitle}</div>
      </div>

      {!active && !completed && (
        <div className="step-lock">
          <i className="fas fa-lock"></i>
        </div>
      )}
    </>
  );

  if (active || completed) {
    return (
      <Link to={to} className={`step-card ${active ? 'step-card-active' : 'step-card-completed'}`} aria-current={active ? "step" : undefined} aria-label={ariaLabel}>
        {inner}
      </Link>
    );
  }

  return (
    <div className="step-card step-card-disabled" aria-disabled="true" aria-label={ariaLabel}>
      {inner}
    </div>
  );
};

function CheckoutStep({ shipping, confirmOrder, payment, currentStep }) {
  // Determine which step is active
  let activeShipping = false;
  let activeConfirm = false;
  let activePayment = false;
  let completedShipping = false;
  let completedConfirm = false;

  if (currentStep === "shipping" || shipping) {
    activeShipping = true;
  }
  if (currentStep === "confirm" || confirmOrder) {
    activeConfirm = true;
    completedShipping = true;
  }
  if (currentStep === "payment" || payment) {
    activePayment = true;
    completedShipping = true;
    completedConfirm = true;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;600;700&display=swap');

        .checkout-steps-container {
          max-width: 1000px;
          margin: 2rem auto;
          padding: 0 1rem;
          font-family: "Noto Sans Lao", "Phetsarath OT", sans-serif;
        }

        .checkout-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .checkout-main-title {
          font-size: 1.75rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .checkout-main-subtitle {
          color: #718096;
          font-size: 0.95rem;
        }

        .checkout-progress-wrapper {
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          margin-bottom: 3rem;
        }

        .progress-line {
          position: absolute;
          top: 40px;
          left: 15%;
          right: 15%;
          height: 4px;
          background: #e2e8f0;
          z-index: 0;
          border-radius: 2px;
        }

        .progress-line-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          transition: width 0.5s ease;
          border-radius: 2px;
        }

        .step-card {
          flex: 1;
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 2px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          text-decoration: none;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
          min-height: 180px;
          justify-content: center;
        }

        .step-card-active {
          border-color: #667eea;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
          transform: translateY(-4px);
          box-shadow: 0 8px 28px rgba(102, 126, 234, 0.25);
        }

        .step-card-completed {
          border-color: #10b981;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.03) 0%, rgba(5, 150, 105, 0.03) 100%);
        }

        .step-card-completed:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.15);
        }

        .step-card-disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .step-indicator {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1rem;
          transition: all 0.3s ease;
        }

        .step-indicator.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
          animation: pulse 2s ease-in-out infinite;
        }

        .step-indicator.completed {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
        }

        .step-indicator.inactive {
          background: #f1f5f9;
          color: #94a3b8;
          border: 2px solid #e2e8f0;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .step-number {
          font-size: 2rem;
        }

        .step-content {
          width: 100%;
        }

        .step-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 0.5rem;
        }

        .step-card-active .step-title {
          color: #667eea;
        }

        .step-card-completed .step-title {
          color: #059669;
        }

        .step-subtitle {
          font-size: 0.875rem;
          color: #718096;
          line-height: 1.4;
        }

        .step-lock {
          position: absolute;
          top: 1rem;
          right: 1rem;
          color: #cbd5e1;
          font-size: 1rem;
        }

        .step-icon-wrapper {
          margin-top: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: #94a3b8;
        }

        .step-card-active .step-icon-wrapper {
          color: #667eea;
        }

        .step-card-completed .step-icon-wrapper {
          color: #10b981;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .checkout-progress-wrapper {
            flex-direction: column;
            gap: 1.5rem;
          }

          .progress-line {
            display: none;
          }

          .step-card {
            width: 100%;
            flex-direction: row;
            text-align: left;
            padding: 1.25rem;
            min-height: auto;
          }

          .step-indicator {
            width: 60px;
            height: 60px;
            font-size: 1.5rem;
            margin-bottom: 0;
            margin-right: 1rem;
            flex-shrink: 0;
          }

          .step-content {
            flex: 1;
          }

          .step-title {
            font-size: 1rem;
          }

          .step-subtitle {
            font-size: 0.8rem;
          }

          .checkout-main-title {
            font-size: 1.5rem;
          }

          .step-lock {
            position: static;
            margin-left: auto;
          }
        }

        @media (max-width: 480px) {
          .step-indicator {
            width: 50px;
            height: 50px;
            font-size: 1.25rem;
          }

          .step-number {
            font-size: 1.5rem;
          }
        }

        /* Animation for step completion */
        .step-card-completed .step-indicator i {
          animation: checkmark 0.5s ease;
        }

        @keyframes checkmark {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* Hover effects */
        .step-card:not(.step-card-disabled):hover {
          cursor: pointer;
        }

        .step-card-active:hover .step-indicator {
          transform: scale(1.05);
        }

        /* Progress percentage indicator */
        .progress-info {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .progress-percentage {
          font-size: 0.875rem;
          font-weight: 600;
          color: #667eea;
        }

        .progress-text {
          font-size: 0.8rem;
          color: #94a3b8;
          margin-top: 0.25rem;
        }
      `}</style>

      <div className="checkout-steps-container">
        {/* Header */}
        <div className="checkout-header">
          <h1 className="checkout-main-title">
            <i className="fas fa-shopping-bag"></i> ຂັ້ນຕອນການສັ່ງຊື້
          </h1>
          <p className="checkout-main-subtitle">
            ກະລຸນາປະຕິບັດຕາມຂັ້ນຕອນເພື່ອສໍາເລັດການສັ່ງຊື້
          </p>
        </div>

        {/* Progress Info */}
        <div className="progress-info">
          <div className="progress-percentage">
            {activePayment ? '100%' : activeConfirm ? '66%' : activeShipping ? '33%' : '0%'} ສໍາເລັດ
          </div>
          <div className="progress-text">
            ຂັ້ນຕອນ {activePayment ? '3' : activeConfirm ? '2' : '1'} ຈາກ 3
          </div>
        </div>

        {/* Progress Steps */}
        <div className="checkout-progress-wrapper" role="list" aria-label="Checkout progress">
          {/* Progress Line */}
          <div className="progress-line">
            <div 
              className="progress-line-fill"
              style={{ 
                width: activePayment ? '100%' : activeConfirm ? '50%' : completedShipping ? '50%' : '0%' 
              }}
            ></div>
          </div>

          {/* Step 1: Shipping */}
          <div role="listitem">
            <Step
              to="/shipping"
              label="ຂໍ້ມູນຂົນສົ່ງ"
              subtitle="ປ້ອນທີ່ຢູ່ ແລະ ເບີໂທລະສັບ"
              active={activeShipping}
              completed={completedShipping}
              stepNumber={1}
              ariaLabel="Go to shipping information step"
            />
            {(activeShipping || completedShipping) && (
              <div className="step-icon-wrapper">
                <i className="fas fa-truck"></i>
                <span>ຂໍ້ມູນການຈັດສົ່ງ</span>
              </div>
            )}
          </div>

          {/* Step 2: Confirm Order */}
          <div role="listitem">
            <Step
              to="/confirm_order"
              label="ຢືນຢັນຄໍາສັ່ງຊື້"
              subtitle="ກວດສອບລາຍລະອຽດການສັ່ງຊື້"
              active={activeConfirm}
              completed={completedConfirm}
              stepNumber={2}
              ariaLabel="Go to confirm order step"
            />
            {(activeConfirm || completedConfirm) && (
              <div className="step-icon-wrapper">
                <i className="fas fa-clipboard-check"></i>
                <span>ຢືນຢັນຂໍ້ມູນ</span>
              </div>
            )}
          </div>

          {/* Step 3: Payment */}
          <div role="listitem">
            <Step
              to="/payment"
              label="ການຊໍາລະເງິນ"
              subtitle="ເລືອກວິທີການຊໍາລະເງິນ"
              active={activePayment}
              completed={false}
              stepNumber={3}
              ariaLabel="Go to payment step"
            />
            {activePayment && (
              <div className="step-icon-wrapper">
                <i className="fas fa-credit-card"></i>
                <span>ຊໍາລະເງິນ</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default CheckoutStep;