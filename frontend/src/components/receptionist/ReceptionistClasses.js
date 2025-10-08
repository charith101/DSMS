import React, { useEffect, useState } from "react";
import { CalendarCheck, Edit2 } from "lucide-react";
import ReceptionistNav from "./ReceptionistNav";
import { useNavigate } from "react-router-dom";

function ReceptionistClasses() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") {
      navigate("/login");
    }
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/receptionist/classSchedule');
      const data = await response.json();
      setClasses(data);
    } catch (err) {
      console.error('Error fetching classes');
    }
  };

  return (
    <div>
      <ReceptionistNav page="classes" />
      <div className="container" style={{ marginTop: "100px" }}>
        <h2 className="fw-bold mb-4">
          <CalendarCheck size={32} className="me-2 text-primary" />
          Class Schedule
        </h2>

        <div className="d-flex flex-column gap-3">
          {classes.map((cls, index) => (
            <div className="card p-3 shadow-sm d-flex justify-content-between align-items-center" key={index}>
              <div>
                <strong>Day:</strong> {cls.day} <br />
                <strong>Time:</strong> {cls.time} <br />
                <strong>Topic:</strong> {cls.topic}
              </div>
              <button className="btn btn-outline-primary">
                <Edit2 size={16} className="me-1" />
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ReceptionistClasses;