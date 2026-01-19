import React from "react";

function Loader() {
  return (
    <>
      <style>
        {`
          .loader-wrapper {
            width: 100%;
            height: 70vh;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .loader {
            width: 62px;
            height: 62px;
            border-radius: 50%;
            border: 6px solid rgba(15, 99, 255, 0.15);
            border-top-color: #0f63ff;
            border-right-color: #10b981;
            border-left-color: #0f63ff;
            animation: spin 0.9s linear infinite;
            box-shadow: 0 0 18px rgba(15, 99, 255, 0.15);
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>

      <div className="loader-wrapper">
        <div className="loader"></div>
      </div>
    </>
  );
}

export default Loader;
