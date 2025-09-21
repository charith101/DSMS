import React, { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { DollarSign, Clock, User, AlertCircle, Calendar } from "lucide-react";
import InstructorNav from "./InstructorNav";
import axios from 'axios';

function InstructorDashboard() {
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (userId) {
      fetchPendingLeaves();
    }
  }, [userId]);

  const fetchPendingLeaves = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`http://localhost:3001/employee/getMyLeaves/${userId}`);
      const pendingCount = response.data.filter(leave => leave.status === 'Pending').length;
      setPendingLeaves(pendingCount);
    } catch (err) {
      console.error('Error fetching pending leaves:', err);
      setError("Failed to load leave notifications");
    } finally {
      setLoading(false);
    }
  };

  const roadSafetyRules = [
    "Speed Limit: 50 km/h in urban areas, 70 km/h in rural areas, 100 km/h on expressways.",
    "No Driving Under the Influence: Illegal to drive under alcohol or drugs.",
    "No Mobile Phone Usage: Pull over if needed to use phone.",
    "Follow Road Signs: Always obey traffic signs and signals.",
    "Keep Left: Drive on the left side of the road.",
    "Use Indicators: Signal when turning or changing lanes.",
    "Maintain Safe Distance: Keep at least two-second gap from the vehicle ahead.",
    "Give Way to Pedestrians: At zebra crossings and pedestrian areas.",
    "Seat Belts Mandatory: For all passengers.",
    "Helmets for Motorcyclists: Required for riders and passengers.",
    "Yield to Emergency Vehicles: Move aside for ambulances, police, etc.",
    "No Illegal Parking: Park only in designated areas.",
    "Watch for Animals: Especially in rural areas."
  ];

  const safetyGuidelinesUrl = "https://www.transport.gov.lk/web/index.php?option=com_content&view=article&id=90&Itemid=191&lang=en";

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
            {/* Quick Action Cards - Expanded */}
            <div className="col-lg-6 col-md-12">
              <div className="row g-3 h-100">
                {/* Schedule Card */}
                <div className="col-12">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-4 text-center">
                      <div className="bg-info rounded-circle p-3 mx-auto mb-3 d-inline-block"
                           style={{ width: '60px', height: '60px' }}>
                        <Calendar size={28} className="text-white mt-1" />
                      </div>
                      <h6 className="fw-bold mb-2 text-primary">My Schedule</h6>
                      <p className="text-muted small mb-3">View and manage your teaching schedule</p>
                      <Link
                        to="/instructor-schedule"
                        className="btn btn-info btn-sm w-100 py-2 fw-semibold"
                        style={{ borderRadius: '8px' }}
                      >
                        View Schedule
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Payments Card */}
                <div className="col-12">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-4 text-center">
                      <div className="bg-success rounded-circle p-3 mx-auto mb-3 d-inline-block"
                           style={{ width: '60px', height: '60px' }}>
                        <DollarSign size={28} className="text-white mt-1" />
                      </div>
                      <h6 className="fw-bold mb-2 text-success">Payments</h6>
                      <p className="text-muted small mb-3">Track your earnings and payments</p>
                      <Link
                        to="/instructor-payments"
                        className="btn btn-success btn-sm w-100 py-2 fw-semibold"
                        style={{ borderRadius: '8px' }}
                      >
                        View Payments
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Leave Requests & Profile Cards - Updated with notification */}
            <div className="col-lg-6 col-md-12">
              <div className="row g-3 h-100">
                {/* Leave Requests Card */}
                <div className="col-12">
                  <div className="card border-0 shadow-sm h-100 position-relative">
                    <div className="card-body p-4 text-center">
                      {/* Pending Leave Notification Badge */}
                      {pendingLeaves > 0 && (
                        <div className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-warning border border-light p-2"
                             style={{ 
                               top: '10px', 
                               right: '10px',
                               boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                               zIndex: 10
                             }}
                             title={`${pendingLeaves} pending leave request${pendingLeaves > 1 ? 's' : ''}`}>
                          <div className="small fw-bold">{pendingLeaves}</div>
                        </div>
                      )}
                      
                      <div className="bg-warning rounded-circle p-3 mx-auto mb-3 d-inline-block"
                           style={{ width: '60px', height: '60px' }}>
                        <Clock size={28} className="text-dark mt-1" />
                      </div>
                      <h6 className="fw-bold mb-2 text-warning">Leave Requests</h6>
                      <p className="text-muted small mb-3">
                        {pendingLeaves > 0 
                          ? `You have ${pendingLeaves} pending request` 
                          : "Submit and track leave requests"
                        }
                      </p>
                      <Link
                        to="/instructor-leave"
                        className={`btn btn-warning btn-sm w-100 py-2 fw-semibold text-dark ${pendingLeaves > 0 ? 'shadow-sm' : ''}`}
                        style={{ borderRadius: '8px' }}
                      >
                        {pendingLeaves > 0 ? (
                          `Manage Leave (${pendingLeaves})`
                        ) : (
                          'Manage Leave'
                        )}
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Profile Card */}
                <div className="col-12">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-4 text-center">
                      <div className="bg-primary rounded-circle p-3 mx-auto mb-3 d-inline-block"
                           style={{ width: '60px', height: '60px' }}>
                        <User size={28} className="text-white mt-1" />
                      </div>
                      <h6 className="fw-bold mb-2 text-primary">Profile</h6>
                      <p className="text-muted small mb-3">Update your information and settings</p>
                      <Link
                        to="/instructor-profile"
                        className="btn btn-primary btn-sm w-100 py-2 fw-semibold"
                        style={{ borderRadius: '8px' }}
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Road Safety Regulations */}
            <div className="col-12">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-4">
                    <div className="bg-warning rounded-circle p-3 me-3 border border-5 border-dark">
                      <AlertCircle size={32} className="text-dark" />
                    </div>
                    <div>
                      <h5 className="mb-1 fw-bold text-dark">Road Safety Regulations</h5>
                      <small className="text-muted">Essential guidelines for safe driving</small>
                    </div>
                  </div>
                  
                  <div className="accordion" id="safetyRulesAccordion">
                    <div className="accordion-item border-0 rounded-3 shadow-sm mb-2">
                      <h2 className="accordion-header">
                        <button 
                          className="accordion-button collapsed fw-semibold" 
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target="#rulesCollapse"
                          style={{ 
                            fontSize: '1rem',
                            background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
                            border: '1px solid #ffeaa7'
                          }}
                        >
                          <i className="bi bi-shield-check me-2"></i>
                          {roadSafetyRules.length} Essential Safety Rules
                        </button>
                      </h2>
                      <div 
                        id="rulesCollapse" 
                        className="accordion-collapse collapse" 
                        data-bs-parent="#safetyRulesAccordion"
                      >
                        <div className="accordion-body p-0">
                          <div className="list-group list-group-flush">
                            {roadSafetyRules.map((rule, index) => (
                              <div key={index} className="list-group-item px-3 py-3 border-0">
                                <div className="d-flex align-items-start">
                                  <div className="badge bg-warning text-dark me-3 mt-1 fw-bold" 
                                       style={{ 
                                         minWidth: '28px', 
                                         fontSize: '0.85rem',
                                         background: 'linear-gradient(135deg, #ffc107 0%, #ffed4e 100%)'
                                       }}>
                                    {index + 1}.
                                  </div>
                                  <div className="flex-grow-1">
                                    <small className="text-dark fw-medium lh-sm">{rule}</small>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-top">
                    <a
                      href={safetyGuidelinesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-warning w-100 py-3 fw-semibold text-decoration-none"
                      style={{ 
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #ffc107 0%, #ffed4e 100%)',
                        border: 'none',
                        boxShadow: '0 2px 8px rgba(255, 193, 7, 0.3)'
                      }}
                    >
                      <i className="bi bi-book me-2"></i>
                      📖 View Complete Road Safety Guidelines
                    </a>
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