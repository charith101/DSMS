import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import ReceptionistNav from "./ReceptionistNav";
import { useNavigate } from "react-router-dom";

function ReceptionistAttendance() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([
    { name: "Emma Watson", status: "present" },
    { name: "Harry Potter", status: "late" },
    { name: "John Lee", status: "absent" },
  ]);

  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") {
      navigate("/login");
    }
  }, []);

  const toggleStatus = (index) => {
    const updated = [...students];
    const nextStatus = {
      present: "absent",
      absent: "late",
      late: "present",
    };
    updated[index].status = nextStatus[updated[index].status];
    setStudents(updated);
  };

  return (
    <div>
      <ReceptionistNav page="attendance" />
      <div className="container" style={{ marginTop: "100px" }}>
        <h2 className="fw-bold mb-4">Mark Attendance</h2>

        <div className="row g-3">
          {students.map((s, index) => (
            <div key={index} className="col-md-4">
              <div className="card p-3 shadow-sm d-flex align-items-center justify-content-between">
                <h5>{s.name}</h5>
                <button className="btn btn-outline-primary" onClick={() => toggleStatus(index)}>
                  {s.status === "present" && <CheckCircle className="text-success" />}
                  {s.status === "absent" && <XCircle className="text-danger" />}
                  {s.status === "late" && <Clock className="text-warning" />}
                  &nbsp; {s.status}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ReceptionistAttendance;