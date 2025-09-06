import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import StudentNav from "./StudentNav";
import { Calendar, Car, CheckCircle, Bell, Clock } from "lucide-react";

function StudentDashboard() {
  const [timeSlots, setTimeSlots] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    if (isAuth !== "true") {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    Promise.all([
      axios.get(`http://localhost:3001/student/getStudentTimeSlots/${userId}`),
      axios.get(`http://localhost:3001/student/getAttendance/${userId}`)
    ])
      .then(([slotsRes, attendanceRes]) => {
        setTimeSlots(slotsRes.data || []);
        setAttendance(attendanceRes.data || []);
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleDelete = (id) => {
    axios
      .delete("http://localhost:3001/student/deleteUser/" + id)
      .then(() => window.location.reload())
      .catch((err) => console.log(err));
  };

  return (
    <div>
      <StudentNav page="home" />
      <section
        className="text-white pb-5"
        style={{
          background: `linear-gradient(90deg, rgba(13,81,253,1) 20%, rgba(10,132,202,0.3) 100%), url('https://images.unsplash.com/photo-1516862523118-a3724eb136d7?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D') center/cover no-repeat`,
          marginTop: "76px",
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div className="container py-5 mt-5">
          <h1 className="fw-bold display-5 mb-3 mx-1">Welcome back</h1>
          <h6 className="fs-6 lead opacity-90">
            Manage your lessons, attendance, and stay updated with notices —
            all from your personal dashboard.
          </h6>
        </div>
      </section>

      <div className="py-5 bg-light">
        <div className="container">
          {loading ? (
            <div 
              className="d-flex justify-content-center align-items-center position-fixed top-0 start-0 w-100 vh-100 bg-white bg-opacity-100"
              style={{ zIndex: 2000 }}
            >
              <div
                className="spinner-border text-primary"
                style={{ width: "4rem", height: "4rem" }}
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {/* Time Slots */}
              <div className="col-12">
                <div className="card border-2 shadow-sm p-3">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-warning rounded-circle p-3 me-3 border border-5 border-dark">
                        <Clock size={64} className="text-black" />
                      </div>
                      <div>
                        <h3 className="mb-1 fw-bold">Chosen Time Slots</h3>
                        <small className="text-muted">
                          Your selected practice slots with instructors
                        </small>
                      </div>
                    </div>
                    <div className="d-flex flex-column gap-2">
                      {timeSlots.length > 0 ? (
                        timeSlots.map((slot) => (
                          <div
                            key={slot._id}
                            className="bg-success bg-opacity-10 border-2 border rounded-3 p-3"
                          >
                            <div className="d-flex flex-column gap-2">
                              <div>
                                <strong>Time:</strong> {slot.startTime} –{" "}
                                {slot.endTime}
                              </div>
                              <div>
                                <strong>Instructor:</strong>{" "}
                                {slot.instructorId?.name || "N/A"}
                              </div>
                              <div>
                                <strong>Vehicle:</strong>{" "}
                                {slot.vehicleId?.model || "N/A"}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-muted">No slots selected yet</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance */}
              <div className="col-12">
                <div className="card border-2 shadow-sm h-100 p-3">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-warning rounded-circle p-3 me-3 border border-5 border-dark">
                        <Calendar size={64} className="text-black" />
                      </div>
                      <div>
                        <h3 className="mb-1 fw-bold">Attendance</h3>
                        <small className="text-muted">This month</small>
                      </div>
                    </div>
                    <div className="table-responsive">
                      <table className="table table-sm mb-0">
                        <thead>
                          <tr>
                            <th scope="col">Date</th>
                            <th scope="col" className="text-end">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendance.length > 0 ? (
                            attendance.map((record) => (
                              <tr key={record._id}>
                                <td className="fs-5">
                                  {new Date(record.date).toLocaleDateString()}
                                </td>
                                <td className="text-end">
                                  <span
                                    className={`badge ${
                                      record.status === "Present"
                                        ? "bg-success"
                                        : "bg-danger"
                                    }`}
                                  >
                                    {record.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="2" className="text-center text-muted">
                                No attendance records
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notices */}
              <div className="col-12">
                <div className="card border-2 shadow-sm h-100 p-3">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-warning rounded-circle p-3 me-3 border border-5 border-dark">
                        <Bell size={64} className="text-black" />
                      </div>
                      <div>
                        <h3 className="mb-1 fw-bold">Notices</h3>
                        <small className="text-muted">All notices</small>
                      </div>
                    </div>
                    <div className="d-flex flex-column gap-2">
                      <div className="p-3 bg-light rounded-3 fs-4">
                        🚦 Road safety seminar on 28th Aug
                      </div>
                      <div className="p-3 bg-light rounded-3 fs-4">
                        🛑 No classes on 30th Aug (public holiday)
                      </div>
                      <div className="p-3 bg-light rounded-3  fs-4">
                        📢 New vehicles added for training
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;