import React, { useEffect, useState } from "react";
import { Users } from "lucide-react";
import ReceptionistNav from "./ReceptionistNav";
import { useNavigate } from "react-router-dom";

function ReceptionistStudents() {
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
      const response = await fetch('/receptionist/students');
      const data = await response.json();
      setStudents(data);
    } catch (err) {
      console.error('Error fetching students');
    }
  };

  return (
    <div>
      <ReceptionistNav page="students" />
      <div className="container" style={{ marginTop: "100px" }}>
        <h2 className="fw-bold mb-4">
          <Users size={32} className="me-2 text-dark" />
          Student List
        </h2>

        <div className="d-flex flex-column gap-3">
          {students.map((stu, index) => (
            <div className="card p-3 shadow-sm" key={index}>
              <strong>Name:</strong> {stu.name} <br />
              <strong>Status:</strong> {stu.status}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ReceptionistStudents;