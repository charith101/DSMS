import React, { useEffect } from "react";
import { FileDown } from "lucide-react";
import ReceptionistNav from "./ReceptionistNav";
import { useNavigate } from "react-router-dom";

function ReceptionistExportData() {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") {
      navigate("/login");
    }
  }, []);

  const handleDownload = (type) => {
    alert(`Downloading ${type}.csv...`);
    // Simulate CSV generation
  };

  return (
    <div>
      <ReceptionistNav page="export" />
      <div className="container" style={{ marginTop: "100px" }}>
        <h2 className="fw-bold mb-4">
          <FileDown size={32} className="me-2 text-info" />
          Export Data to CSV
        </h2>

        <div className="d-flex flex-column gap-3">
          <button onClick={() => handleDownload("students")} className="btn btn-outline-success">Download Student List</button>
          <button onClick={() => handleDownload("payments")} className="btn btn-outline-primary">Download Payment History</button>
          <button onClick={() => handleDownload("appointments")} className="btn btn-outline-secondary">Download Appointment Summary</button>
        </div>
      </div>
    </div>
  );
}

export default ReceptionistExportData;