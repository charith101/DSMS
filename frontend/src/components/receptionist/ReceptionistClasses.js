import React, { useState, useEffect } from "react";
import { CalendarCheck, Edit2 } from "lucide-react";
import ReceptionistNav from "./ReceptionistNav";
import { useNavigate } from "react-router-dom";

function ReceptionistClasses() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([
    { day: "Monday", time: "8:00 AM", topic: "Manual Driving" },
    { day: "Tuesday", time: "10:00 AM", topic: "Highway Practice" },
    { day: "Wednesday", time: "1:00 PM", topic: "Reverse Parking" },
  ]);

  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") {
      navigate("/login");
    }
  }, []);

  const handleReschedule = (index, newDay, newTime) => {
    const updatedClasses = [...classes];
    updatedClasses[index] = { ...updatedClasses[index], day: newDay, time: newTime };
    setClasses(updatedClasses);
    alert("Class rescheduled successfully!");
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const times = ["8:00 AM", "10:00 AM", "1:00 PM", "3:00 PM"];

  return (
    <div>
      <ReceptionistNav page="classes" />
      <div className="container" style={{ marginTop: "100px" }}>
        <h2 className="fw-bold mb-4">
          <CalendarCheck size={32} className="me-2 text-success" />
          Class Timetable
        </h2>

        <div className="row g-4">
          {classes.map((cls, index) => (
            <div className="col-md-4" key={index}>
              <div className="card shadow-sm p-3">
                <h5 className="fw-bold">{cls.topic}</h5>
                <p>
                  <strong>Day:</strong> {cls.day} <br />
                  <strong>Time:</strong> {cls.time}
                </p>
                <div className="d-flex gap-2">
                  <select
                    className="form-select form-select-sm"
                    value={cls.day}
                    onChange={(e) => handleReschedule(index, e.target.value, cls.time)}
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <select
                    className="form-select form-select-sm"
                    value={cls.time}
                    onChange={(e) => handleReschedule(index, cls.day, e.target.value)}
                  >
                    {times.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <button className="btn btn-outline-primary btn-sm">
                    <Edit2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ReceptionistClasses;