import React, { useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { Users, Briefcase, DollarSign, Truck, MessageSquare } from "lucide-react";
import AdminNav from "./AdminNav";

function AdminDashboard() {
  return (  
    <div>
      <AdminNav page="home" />

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
                    <div className="bg-warning rounded-circle p-3 me-3 border border-5 border-dark">
                      <Users size={64} className="text-black" />
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
                    <div className="bg-warning rounded-circle p-3 me-3 border border-5 border-dark">
                      <Briefcase size={64} className="text-black" />
                    </div>
                    <div>
                      <h3 className="mb-1 fw-bold">Employees</h3>
                      <small className="text-muted">Manage instructors and staff</small>
                    </div>
                  </div>
                  <div className="d-flex flex-column gap-2">
                    <Link
                      to="/admin-dashboard/employees"
                      className="btn btn-primary w-100 text-start p-3 fs-5"
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
                    <div className="bg-warning rounded-circle p-3 me-3 border border-5 border-dark">
                      <DollarSign size={64} className="text-black" />
                    </div>
                    <div>
                      <h3 className="mb-1 fw-bold">Finance</h3>
                      <small className="text-muted">Track payments and expenses</small>
                    </div>
                  </div>
                  <div className="d-flex flex-column gap-2">
                    <Link
                      to="/admin-dashboard/finance"
                      className="btn btn-primary w-100 text-start p-3 fs-5"
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
                    <div className="bg-warning rounded-circle p-3 me-3 border border-5 border-dark">
                      <Truck size={64} className="text-black" />
                    </div>
                    <div>
                      <h3 className="mb-1 fw-bold">Vehicles</h3>
                      <small className="text-muted">Manage training vehicles</small>
                    </div>
                  </div>
                  <div className="d-flex flex-column gap-2">
                    <Link
                      to="/admin-dashboard/vehicles"
                      className="btn btn-primary w-100 text-start p-3 fs-5"
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
                    <div className="bg-warning rounded-circle p-3 me-3 border border-5 border-dark">
                      <MessageSquare size={64} className="text-black" />
                    </div>
                    <div>
                      <h3 className="mb-1 fw-bold">Feedback</h3>
                      <small className="text-muted">View student feedback</small>
                    </div>
                  </div>
                  <div className="d-flex flex-column gap-2">
                    <Link
                      to="/admin-dashboard/feedback"
                      className="btn btn-primary w-100 text-start p-3 fs-5"
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

      <div className="container py-5">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminDashboard;