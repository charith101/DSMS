import React from "react";
import { Outlet, Link } from "react-router-dom";
import { Calendar, DollarSign, Clock, User } from "lucide-react";
import InstructorNav from "./InstructorNav";

function InstructorDashboard() {
  return (  
    <div>
      <InstructorNav page="home" />

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
            Manage your schedule, payments, and leave requests
          </h6>
        </div>
      </section>

      <div className="py-5 bg-light">
        <div className="container">
          <div className="row g-4">
            {/* Schedule Overview */}
            <div className="col-12">
              <div className="card border-2 shadow-sm p-3">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-info rounded-circle p-3 me-3 border border-5 border-dark">
                      <Calendar size={64} className="text-white" />
                    </div>
                    <div>
                      <h3 className="mb-1 fw-bold">Schedule</h3>
                      <small className="text-muted">View and manage your teaching schedule</small>
                    </div>
                  </div>
                  <div className="d-flex flex-column gap-2">
                    <Link
                      to="/instructor-dashboard/schedule"
                      className="btn btn-info w-100 text-start p-3 fs-5"
                    >
                      View My Schedule
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Payments Overview */}
            <div className="col-12">
              <div className="card border-2 shadow-sm p-3">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-success rounded-circle p-3 me-3 border border-5 border-dark">
                      <DollarSign size={64} className="text-white" />
                    </div>
                    <div>
                      <h3 className="mb-1 fw-bold">Payments</h3>
                      <small className="text-muted">Track your earnings and payments</small>
                    </div>
                  </div>
                  <div className="d-flex flex-column gap-2">
                    <Link
                      to="/instructor-dashboard/payments"
                      className="btn btn-success w-100 text-start p-3 fs-5"
                    >
                      View My Payments
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Leave Requests Overview */}
            <div className="col-12">
              <div className="card border-2 shadow-sm p-3">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-warning rounded-circle p-3 me-3 border border-5 border-dark">
                      <Clock size={64} className="text-black" />
                    </div>
                    <div>
                      <h3 className="mb-1 fw-bold">Leave Requests</h3>
                      <small className="text-muted">Submit and track leave requests</small>
                    </div>
                  </div>
                  <div className="d-flex flex-column gap-2">
                    <Link
                      to="/instructor-dashboard/leave-requests"
                      className="btn btn-warning w-100 text-start p-3 fs-5 text-dark"
                    >
                      Manage Leave Requests
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Overview */}
            <div className="col-12">
              <div className="card border-2 shadow-sm p-3">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary rounded-circle p-3 me-3 border border-5 border-dark">
                      <User size={64} className="text-white" />
                    </div>
                    <div>
                      <h3 className="mb-1 fw-bold">Profile</h3>
                      <small className="text-muted">Update your information and settings</small>
                    </div>
                  </div>
                  <div className="d-flex flex-column gap-2">
                    <Link
                      to="/instructor-dashboard/profile"
                      className="btn btn-primary w-100 text-start p-3 fs-5"
                    >
                      View My Profile
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

export default InstructorDashboard;