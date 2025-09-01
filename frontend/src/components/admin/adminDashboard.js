import React, { useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { Home, Users, Briefcase, DollarSign, Truck, MessageSquare, LogOut } from "lucide-react";
import AdminNav from "./AdminNav";

function AdminDashboard() {
  return (  
    <div>
      {/* Navbar */}
      <AdminNav />

      {/* Sidebar */}
      

      {/* Main Content */}
      <div className="ms-auto" style={{ marginLeft: "250px" }}>
        <section
          className="text-white pb-5"
          style={{ background: "linear-gradient(135deg, #333 0%, #555 100%)", marginTop: "76px" }}
        >
          <div className="container py-5">
            <h1 className="fw-bold display-5 mb-3 mx-1">Welcome back, Admin</h1>
            <h6 className="fs-6 lead opacity-90">
              Manage students, employees, finances, vehicles, and feedback all from your dashboard.
            </h6>
          </div>
        </section>

        <div className="py-5 bg-light">
          <div className="container">
            <div className="row g-4">
              {/* Students Overview */}
              <div className="col-12">
                <div className="card border-2 shadow-sm p-3">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                        <Users size={64} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="mb-1 fw-bold">Students</h3>
                        <small className="text-muted">Manage student records and schedules</small>
                      </div>
                    </div>
                    <div className="d-flex flex-column gap-2">
                      <Link
                        to="/admin-dashboard/students"
                        className="btn btn-primary w-100 text-start p-3 fs-5"
                      >
                        View All Students
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Employees Overview */}
              <div className="col-12">
                <div className="card border-2 shadow-sm p-3">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-danger bg-opacity-10 rounded-circle p-3 me-3">
                        <Briefcase size={64} className="text-danger" />
                      </div>
                      <div>
                        <h3 className="mb-1 fw-bold">Employees</h3>
                        <small className="text-muted">Manage instructors and staff</small>
                      </div>
                    </div>
                    <div className="d-flex flex-column gap-2">
                      <Link
                        to="/admin-dashboard/employees"
                        className="btn btn-danger w-100 text-start p-3 fs-5"
                      >
                        View All Employees
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Finance Overview */}
              <div className="col-12">
                <div className="card border-2 shadow-sm p-3">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-warning bg-opacity-10 rounded-circle p-3 me-3">
                        <DollarSign size={64} className="text-warning" />
                      </div>
                      <div>
                        <h3 className="mb-1 fw-bold">Finance</h3>
                        <small className="text-muted">Track payments and expenses</small>
                      </div>
                    </div>
                    <div className="d-flex flex-column gap-2">
                      <Link
                        to="/admin-dashboard/finance"
                        className="btn btn-warning w-100 text-start p-3 fs-5"
                      >
                        View Financial Records
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicles Overview */}
              <div className="col-12">
                <div className="card border-2 shadow-sm p-3">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">
                        <Truck size={64} className="text-success" />
                      </div>
                      <div>
                        <h3 className="mb-1 fw-bold">Vehicles</h3>
                        <small className="text-muted">Manage training vehicles</small>
                      </div>
                    </div>
                    <div className="d-flex flex-column gap-2">
                      <Link
                        to="/admin-dashboard/vehicles"
                        className="btn btn-success w-100 text-start p-3 fs-5"
                      >
                        View All Vehicles
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feedback Overview */}
              <div className="col-12">
                <div className="card border-2 shadow-sm p-3">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-info bg-opacity-10 rounded-circle p-3 me-3">
                        <MessageSquare size={64} className="text-info" />
                      </div>
                      <div>
                        <h3 className="mb-1 fw-bold">Feedback</h3>
                        <small className="text-muted">View student feedback</small>
                      </div>
                    </div>
                    <div className="d-flex flex-column gap-2">
                      <Link
                        to="/admin-dashboard/feedback"
                        className="btn btn-info w-100 text-start p-3 fs-5"
                      >
                        View All Feedback
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nested Routes Content */}
        <div className="container py-5">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;