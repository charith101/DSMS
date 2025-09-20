import React, { useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { Users, Briefcase, DollarSign, Truck, User } from "lucide-react";
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
          <h1 className="fw-bold display-5 mb-3 mx-1">Welcome back</h1>
          <h6 className="fs-6 lead opacity-90">
            Manage students, employees, and school operations
          </h6>
        </div>
      </section>

      <div className="py-5 bg-light">
        <div className="container">
          <div className="row g-4">
            {/* Quick Action Cards - Two Column Layout */}
            <div className="col-lg-6 col-md-12">
              <div className="row g-3 h-100">
                {/* Students Card */}
                <div className="col-12">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-4 text-center">
                      <div className="bg-primary rounded-circle p-3 mx-auto mb-3 d-inline-block"
                           style={{ width: '60px', height: '60px' }}>
                        <Users size={28} className="text-white mt-1" />
                      </div>
                      <h6 className="fw-bold mb-2 text-primary">Students</h6>
                      <p className="text-muted small mb-3">Manage student records and schedules</p>
                      <Link
                        to="/students"
                        className="btn btn-primary btn-sm w-100 py-2 fw-semibold"
                        style={{ borderRadius: '8px' }}
                      >
                        View Students
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Employees Card */}
                <div className="col-12">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-4 text-center">
                      <div className="bg-success rounded-circle p-3 mx-auto mb-3 d-inline-block"
                           style={{ width: '60px', height: '60px' }}>
                        <Briefcase size={28} className="text-white mt-1" />
                      </div>
                      <h6 className="fw-bold mb-2 text-success">Employees</h6>
                      <p className="text-muted small mb-3">Manage instructors and staff</p>
                      <Link
                        to="/employees"
                        className="btn btn-success btn-sm w-100 py-2 fw-semibold"
                        style={{ borderRadius: '8px' }}
                      >
                        View Employees
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Finance & Vehicles Cards */}
            <div className="col-lg-6 col-md-12">
              <div className="row g-3 h-100">
                {/* Finance Card */}
                <div className="col-12">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-4 text-center">
                      <div className="bg-info rounded-circle p-3 mx-auto mb-3 d-inline-block"
                           style={{ width: '60px', height: '60px' }}>
                        <DollarSign size={28} className="text-white mt-1" />
                      </div>
                      <h6 className="fw-bold mb-2 text-info">Finance</h6>
                      <p className="text-muted small mb-3">Track payments and expenses</p>
                      <Link
                        to="/finance"
                        className="btn btn-info btn-sm w-100 py-2 fw-semibold"
                        style={{ borderRadius: '8px' }}
                      >
                        View Finance
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Vehicles Card */}
                <div className="col-12">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-4 text-center">
                      <div className="bg-warning rounded-circle p-3 mx-auto mb-3 d-inline-block"
                           style={{ width: '60px', height: '60px' }}>
                        <Truck size={28} className="text-dark mt-1" />
                      </div>
                      <h6 className="fw-bold mb-2 text-warning">Vehicles</h6>
                      <p className="text-muted small mb-3">Manage training vehicles</p>
                      <Link
                        to="/vehicles"
                        className="btn btn-warning btn-sm w-100 py-2 fw-semibold text-dark"
                        style={{ borderRadius: '8px' }}
                      >
                        View Vehicles
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Card */}
            <div className="col-lg-6 col-md-12">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4 text-center">
                  <div className="bg-primary rounded-circle p-3 mx-auto mb-3 d-inline-block"
                       style={{ width: '60px', height: '60px' }}>
                    <User size={28} className="text-white mt-1" />
                  </div>
                  <h6 className="fw-bold mb-2 text-primary">Profile</h6>
                  <p className="text-muted small mb-3">Update your information and settings</p>
                  <Link
                    to="/admin-Profile"  // ✅ Fixed: Now matches AdminNav
                    className="btn btn-primary btn-sm w-100 py-2 fw-semibold"
                    style={{ borderRadius: '8px' }}
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            </div>

            {/* Empty column to maintain balance */}
            <div className="col-lg-6 col-md-12 d-none d-lg-block"></div>
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