import React, { useEffect, useState } from "react";
import { ClipboardList, Bell } from "lucide-react";
import ReceptionistNav from "./ReceptionistNav";
import { useNavigate } from "react-router-dom";

function ReceptionistAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") {
      navigate("/login");
    }
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/receptionist/upcomingAppointments');
      const data = await response.json();
      setAppointments(data);
    } catch (err) {
      console.error('Error fetching appointments');
    }
  };

  const sendReminder = async (student) => {
    try {
      const response = await fetch('/receptionist/sendReminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName: student })
      });
      if (response.ok) {
        alert(`Reminder sent to ${student}! 📩`);
      }
    } catch (err) {
      alert('Error sending reminder');
    }
  };

  return (
    <div>
      <ReceptionistNav page="appointments" />
      <div
        className="container"
        style={{ marginTop: "100px" }}>
        <h2 className="fw-bold mb-4">
          <ClipboardList
            size={32}
            className="me-2 text-primary"
          />
          Upcoming Appointments
        </h2>

        <div className="d-flex flex-column gap-3">
          {appointments.map((app, index) => (
            <div
              className="card p-3 shadow-sm d-flex justify-content-between align-items-center"
              key={index}>
              <div>
                <strong>Time:</strong> {app.time} <br />
                <strong>Student:</strong> {app.student} <br />
                <strong>Instructor:</strong> {app.instructor}
              </div>
              <button
                className="btn btn-outline-success"
                onClick={() => sendReminder(app.student)}>
                <Bell
                  size={16}
                  className="me-1"
                />
                Send Reminder
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ReceptionistAppointments;
