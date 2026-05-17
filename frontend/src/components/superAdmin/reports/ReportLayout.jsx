import React from "react";
import { Outlet } from "react-router-dom";
import AdminLayout from "../../layout/AdminLayout";
import ReportSidebar from "./ReportSidebar";

const ReportLayout = () => {
  return (
    <AdminLayout>
      <style>{`
        .report-layout {
          display: flex;
          min-height: calc(100vh - 80px);
          font-family: "Noto Sans Lao", "Phetsarath OT", sans-serif;
        }

        .report-content {
          flex: 1;
          padding: 2rem;
          background: #f8fafc;
          overflow-x: hidden;
        }

        @media (max-width: 992px) {
          .report-layout {
            flex-direction: column;
          }

          .report-content {
            padding: 1.25rem;
          }
        }

        @media (max-width: 576px) {
          .report-content {
            padding: 1rem;
          }
        }
      `}</style>

      <div className="report-layout">
        <ReportSidebar />
        <main className="report-content">
          <Outlet />
        </main>
      </div>
    </AdminLayout>
  );
};

export default ReportLayout;
