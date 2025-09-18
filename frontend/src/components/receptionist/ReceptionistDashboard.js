import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReceptionistNav from "./ReceptionistNav";
import { CalendarCheck, ClipboardList, Users, AlertTriangle } from "lucide-react";

function ReceptionistDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") {
      navigate("/login");
    }
  }, []);

  return (
    <div>
      <ReceptionistNav page="home" />

      <section
        className="text-white pb-5"
        style={{
          background: "linear-gradient(135deg, #097965 0%, #03a9f4 100%)",
          marginTop: "76px",
        }}
      >
        <div className="container py-5">
          <h1 className="fw-bold display-5 mb-3 mx-1">Welcome back, Receptionist</h1>
          <h6 className="fs-6 lead opacity-90">
            Manage class schedules, student appointments, and notifications —
            all from your dashboard.
          </h6>
        </div>
      </section>

      <div className="py-5 bg-light">
        <div className="container">
          <div className="row g-4">

            {/* Appointment Bookings */}
            <div className="col-12">
              <div className="card border-2 shadow-sm p-3">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                      <ClipboardList size={64} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="mb-1 fw-bold">Upcoming Appointments</h3>
                      <small className="text-muted">Today's bookings</small>
                    </div>
                  </div>
                  <div className="d-flex flex-column gap-2">
                    <div className="bg-info bg-opacity-10 border rounded-3 p-3">
                      <strong>Time:</strong> 10:00 AM<br />
                      <strong>Student:</strong> Sarah Williams<br />
                      <strong>Instructor:</strong> Mike Tyson
                    </div>
                    <div className="bg-info bg-opacity-10 border rounded-3 p-3">
                      <strong>Time:</strong> 11:00 AM<br />
                      <strong>Student:</strong> John Lee<br />
                      <strong>Instructor:</strong> Angela White
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Class Timetable */}
            <div className="col-12">
              <div className="card border-2 shadow-sm p-3">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">
                      <CalendarCheck size={64} className="text-success" />
                    </div>
                    <div>
                      <h3 className="mb-1 fw-bold">Class Schedule</h3>
                      <small className="text-muted">Weekly Overview</small>
                    </div>
                  </div>
                  <ul className="list-group">
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Monday - 8:00 AM</span>
                      <span>Manual Driving</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Tuesday - 10:00 AM</span>
                      <span>Highway Practice</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Wednesday - 1:00 PM</span>
                      <span>Reverse Parking</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Student Management */}
            <div className="col-12">
              <div className="card border-2 shadow-sm p-3">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-dark bg-opacity-10 rounded-circle p-3 me-3">
                      <Users size={64} className="text-dark" />
                    </div>
                    <div>
                      <h3 className="mb-1 fw-bold">Student List</h3>
                      <small className="text-muted">Quick summary</small>
                    </div>
                  </div>
                  <div className="d-flex flex-column gap-2">
                    <div className="bg-light border rounded-3 p-3">
                      <strong>Name:</strong> Emma Watson<br />
                      <strong>Status:</strong> Active
                    </div>
                    <div className="bg-light border rounded-3 p-3">
                      <strong>Name:</strong> Harry Potter<br />
                      <strong>Status:</strong> Completed
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="col-12">
              <div className="card border-2 shadow-sm p-3">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-warning bg-opacity-10 rounded-circle p-3 me-3">
                      <AlertTriangle size={64} className="text-warning" />
                    </div>
                    <div>
                      <h3 className="mb-1 fw-bold">Notifications</h3>
                      <small className="text-muted">All alerts</small>
                    </div>
                  </div>
                  <div className="d-flex flex-column gap-2">
                    <div className="p-3 bg-light rounded-3 fs-5">
                      ⚠ Cancelled class on 2nd Sep due to rain
                    </div>
                    <div className="p-3 bg-light rounded-3 fs-5">
                      🔔 New instructor added to staff list
                    </div>
                    <div className="p-3 bg-light rounded-3 fs-5">
                      📅 Timetable updated for September
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default ReceptionistDashboard;