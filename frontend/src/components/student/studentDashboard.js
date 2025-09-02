import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import StudentNav from "./StudentNav";
import { Calendar, Car, CheckCircle, Bell, Clock } from "lucide-react";


function StudentDashboard() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate()
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    if (isAuth !== "true") {
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    axios.get("http://localhost:3001/student")
      .then((result) => setUsers(result.data))
      .catch((err) => console.log(err));
  }, []);
  
  const handleDelete = (id) => {
    axios.delete("http://localhost:3001/student/deleteUser/" + id)
      .then((result) => window.location.reload())
      .catch((err) => console.log(err));
  }
  
  

  return (
    <div>
      <StudentNav page="home"/>
      <section
        className="text-white pb-5"
        style={{background: "linear-gradient(135deg, #0d51fdff 0%, #0a84caff 100%)", marginTop: "76px",}}>
        <div className="container py-5">       
          <h1 className="fw-bold display-5 mb-3 mx-1">Welcome back, Alex</h1>
          <h6 className="fs-6 lead opacity-90">
            Manage your lessons, attendance, and stay updated with notices —
            all from your personal dashboard.
          </h6>
        </div>
      </section>

      <div className="py-5 bg-light">
      <div className="container">
        <div className="row g-4">
          {/* Time Slots */}
          <div className="col-12">
            <div className="card border-2 shadow-sm p-3">
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                    <Clock size={64} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-1 fw-bold">Chosen Time Slots</h3>
                    <small className="text-muted">Your selected practice slots with instructors</small>
                  </div>
                </div>
                <div className="d-flex flex-column gap-2">
                  <div className="bg-success bg-opacity-10 border-2 border rounded-3 p-3">
                    <div className="d-flex flex-column gap-2">
                      <div><strong>Time:</strong> 9:00 AM – 10:00 AM</div>
                      <div><strong>Instructor:</strong> John Doe</div>
                      <div><strong>Vehicle:</strong> Toyota Yaris</div>
                      <div><strong>Location:</strong> Downtown Driving Track</div>
                    </div>
                  </div>
                  <div className="bg-success bg-opacity-10 border-2 border rounded-3 p-3">
                    <div className="d-flex flex-column gap-2">
                      <div><strong>Time:</strong> 9:00 AM – 10:00 AM</div>
                      <div><strong>Instructor:</strong> John Doe</div>
                      <div><strong>Vehicle:</strong> Toyota Yaris</div>
                      <div><strong>Location:</strong> Downtown Driving Track</div>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
          </div>

          {/* Attendance */}
          <div className="col-12">
            <div className="card border-2 shadow-sm h-100 p-3">
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-danger bg-opacity-10 rounded-circle p-3 me-3">
                    <Calendar size={64} className="text-danger" />
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
                        <th scope="col" className="text-end">Status</th>                
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td className="fs-5">2025.08.24</td><td className="text-end"><span className="badge bg-success">Present</span></td></tr>
                      <tr><td className="fs-5">2025.08.24</td><td className="text-end"><span className="badge bg-danger">Absent</span></td></tr>
                      <tr><td className="fs-5">2025.08.24</td><td className="text-end"><span className="badge bg-success">Present</span></td></tr>
                      <tr><td className="fs-5">2025.08.24</td><td className="text-end"><span className="badge bg-success">Present</span></td></tr>
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
                  <div className="bg-warning bg-opacity-10 rounded-circle p-3 me-3">
                    <Bell size={64} className="text-warning" />
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
      </div>
    </div>
    </div>
  );
}

export default StudentDashboard;
