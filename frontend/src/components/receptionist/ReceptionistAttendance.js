import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import ReceptionistNav from "./ReceptionistNav";
import { useNavigate } from "react-router-dom";

function ReceptionistAttendance() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") {
      navigate("/login");
    }
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/receptionist/studentsForAttendance');
      const data = await response.json();
      setStudents(data);
    } catch (err) {
      console.error('Error fetching students');
    }
  };

  const toggleStatus = async (index) => {
    const updated = [...students];
    const nextStatus = {
      present: "absent",
      absent: "late",
      late: "present",
    };
    const newStatus = nextStatus[updated[index].status];
    updated[index].status = newStatus;

    try {
      await fetch('/receptionist/markAttendance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName: updated[index].name, status: newStatus })
      });
      setStudents(updated);
    } catch (err) {
      alert('Error marking attendance');
    }
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