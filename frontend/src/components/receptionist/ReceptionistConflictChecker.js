import React, { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import ReceptionistNav from "./ReceptionistNav";
import { useNavigate } from "react-router-dom";

function ReceptionistConflictChecker() {
  const navigate = useNavigate();
  const [appointments] = useState([
    { time: "10:00 AM", instructor: "Mike Tyson", car: "Car A" },
    { time: "10:00 AM", instructor: "Mike Tyson", car: "Car B" },
    { time: "11:00 AM", instructor: "Angela White", car: "Car A" },
    { time: "10:00 AM", instructor: "Mike Tyson", car: "Car A" },
  ]);

  const [conflicts, setConflicts] = useState([]);

  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") {
      navigate("/login");
    }

    // Detect conflicts
    const seen = {};
    const conflictKeys = new Set();

    appointments.forEach((appointment) => {
      const key = `${appointment.time}_${appointment.instructor}_${appointment.car}`;
      if (seen[key]) {
        conflictKeys.add(key);
      } else {
        seen[key] = true;
      }
    });

    const foundConflicts = appointments.filter((appointment) => {
      const key = `${appointment.time}_${appointment.instructor}_${appointment.car}`;
      return conflictKeys.has(key);
    });

    setConflicts(foundConflicts);
  }, [appointments, navigate]);

  return (
    <div>
      <ReceptionistNav page="conflicts" />
      <div className="container" style={{ marginTop: "100px" }}>
        <h2 className="fw-bold mb-4">
          <AlertTriangle size={32} className="me-2 text-danger" />
          Appointment Conflict Checker
        </h2>
        {conflicts.length > 0 ? (
          <div className="alert alert-danger">
            <strong>Warning:</strong> Conflicting appointments detected!
          </div>
        ) : (
          <div className="alert alert-success">No conflicts found.</div>
        )}

        {conflicts.map((c, index) => (
          <div key={index} className="card shadow-sm p-3 mb-3 border-danger">
            <p>
              <strong>Time:</strong> {c.time}<br />
              <strong>Instructor:</strong> {c.instructor}<br />
              <strong>Car:</strong> {c.car}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReceptionistConflictChecker;