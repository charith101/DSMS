import React, { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import ReceptionistNav from "./ReceptionistNav";
import { useNavigate } from "react-router-dom";

function ReceptionistLateStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([
    { name: "Emma Watson", status: "On Time" },
    { name: "Harry Potter", status: "Late" },
  ]);

  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") {
      navigate("/login");
    }
  }, []);

  return (
    <div>
      <ReceptionistNav page="late" />
      <div className="container" style={{ marginTop: "100px" }}>
        <h2 className="fw-bold mb-4">
          <AlertCircle size={32} className="me-2 text-danger" />
          Late Students
        </h2>

        <div className="d-flex flex-column gap-3">
          {students.map((stu, index) => (
            <div className={`card p-3 shadow-sm d-flex justify-content-between align-items-center ${stu.status === "Late" ? "border-danger" : ""}`} key={index}>
              <div>
                <strong>Name:</strong> {stu.name} <br />
                <strong>Status:</strong> {stu.status}
              </div>
              {stu.status === "Late" && <span className="badge bg-danger">Late</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ReceptionistLateStudents;