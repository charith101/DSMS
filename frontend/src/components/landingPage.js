import React from 'react';
import { Calendar, CreditCard, Car, Users, BarChart3, Wrench, Clock,CheckCircle,Star,ArrowRight, User} from 'lucide-react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="min-vh-100">
      {/* Nav bar */}
      <nav className="navbar navbar-expand-lg navbar-light shadow-sm fixed-top" style={{
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'saturate(180%) blur(20px)',
            WebkitBackdropFilter: 'saturate(180%) blur(10px)',
            boxShadow: '0 0.125rem 0.25rem rgb(0 0 0 / 0.075)'
          }}>
        <div className="container-fluid">
          <Link className="navbar-brand fw-bold fs-3 text-primary d-flex align-items-center" to="/">
            <Car className="me-2" size={32} />
            DrivePro
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <div className="ms-auto d-flex gap-2 mt-3 mt-lg-0">
              <Link to="/login" className="btn btn-outline-primary px-4">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary px-4">
                Get Started <ArrowRight size={16} className="ms-1" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-primary text-white pb-5" style={{
        backgroundImage: `linear-gradient(90deg, rgba(13,81,253,1) 20%, rgba(10,132,202,0.6) 100%), url("https://img.freepik.com/premium-vector/set-yellow-road-signs-american-road-signs_924514-534.jpg")`,
        backgroundSize: 'cover',
        marginTop: '76px'
      }}>
        <div className="container-fluid py-5 px-5">
          <div className="row align-items-center">
            <div className="col-lg-7 mb-4 mb-lg-0">
              <h1 className="display-4 fw-bold mb-4">
                Smarter Driving School Management
              </h1>
              <p className="lead mb-4 opacity-90">
                Schedule lessons, track payments, manage vehicles & staff — all in one sleek, modern platform designed for driving schools.
              </p>
              <div className="d-flex flex-wrap gap-3 mb-4">
                <div className="d-flex align-items-center">
                  <CheckCircle size={20} className="text-light me-2" />
                  <span>Sleek Dashboard</span>
                </div>
                <div className="d-flex align-items-center">
                  <CheckCircle size={20} className="text-light me-2" />
                  <span>No Queues</span>
                </div>
                <div className="d-flex align-items-center">
                  <CheckCircle size={20} className="text-light me-2" />
                  <span>24/7 support</span>
                </div>
              </div>
              <Link to="/register" className="btn btn-light btn-lg me-3 shadow-sm">
                Register now
                <ArrowRight size={20} className="ms-2" />
              </Link>
            </div>
            <div className="mx-auto col-lg-5 text-center d-flex justify-content-center align-items-center">
              <img
                src="https://www.protectiveagency.com/blog/wp-content/uploads/2018/06/shutterstock_213307594.jpg"
                alt="Driving School Dashboard"
                className="img-fluid rounded-4 shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-5">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Everything you need to succeed</h2>
            <p className="lead text-muted">
              Comprehensive tools designed specifically for driving schools
            </p>
          </div>
          <div className="row g-4">
            <div className="col-lg-4 col-md-6">
              <div className="card border-2 shadow h-100 hover-card">
                {/* Image at top */}
                <img 
                  src="https://images.unsplash.com/photo-1515847049296-a281d6401047?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                  alt="Smart Scheduling" 
                  className="card-img-top" 
                  style={{ height: "180px", objectFit: "cover" }} 
                />

                <div className="card-body p-4 text-center">
                  <h5 className="fw-bold mb-3">Smart Scheduling</h5>
                  <p className="text-muted mb-4">
                    Intelligent booking system with automated reminders, conflict detection, and easy rescheduling.
                  </p>
                  <ul className="list-unstyled text-start">
                    <li className="mb-2">
                      <CheckCircle size={16} className="text-success me-2" />
                      Schedule Calendar
                    </li>
                    <li className="mb-2">
                      <CheckCircle size={16} className="text-success me-2" />
                      Reminders
                    </li>
                    <li className="mb-2">
                      <CheckCircle size={16} className="text-success me-2" />
                      Better productivity
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="card border-2 shadow h-100 hover-card">
                {/* Image at top */}
                <img 
                  src="https://images.unsplash.com/photo-1593182440959-9d5165b29b59?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                  alt="Payment Management" 
                  className="card-img-top" 
                  style={{ height: "180px", objectFit: "cover" }} 
                />

                <div className="card-body p-4 text-center">
                  <h5 className="fw-bold mb-3">Payment Management</h5>
                  <p className="text-muted mb-4">
                    Secure payment processing with automated invoicing and comprehensive financial reporting.
                  </p>
                  <ul className="list-unstyled text-start">
                    <li className="mb-2">
                      <CheckCircle size={16} className="text-success me-2" />
                      Online payments
                    </li>
                    <li className="mb-2">
                      <CheckCircle size={16} className="text-success me-2" />
                      Automated invoicing
                    </li>
                    <li className="mb-2">
                      <CheckCircle size={16} className="text-success me-2" />
                      Financial reports
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="card border-2 shadow h-100 hover-card">
                {/* Image at top */}
                <img 
                  src="https://images.unsplash.com/photo-1630406144797-821be1f35d75?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                  alt="Vehicle Management" 
                  className="card-img-top" 
                  style={{ height: "180px", objectFit: "cover" }} 
                />

                <div className="card-body p-4 text-center">
                  <h5 className="fw-bold mb-3">Vehicle Management</h5>
                  <p className="text-muted mb-4">
                    Complete vehicle tracking with maintenance schedules, fuel monitoring, and insurance management.
                  </p>
                  <ul className="list-unstyled text-start">
                    <li className="mb-2">
                      <CheckCircle size={16} className="text-success me-2" />
                      Maintenance tracking
                    </li>
                    <li className="mb-2">
                      <CheckCircle size={16} className="text-success me-2" />
                      Fuel management
                    </li>
                    <li className="mb-2">
                      <CheckCircle size={16} className="text-success me-2" />
                      Insurance alerts
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="bg-light py-5">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold mb-3">Additional Features</h2>
            <p className="lead text-muted">Powerful tools to streamline your operations</p>
          </div>
          <div className="row g-4">
            <div className="col-lg-3 col-md-6">
              <div className="text-center p-4 bg-white rounded-3 shadow h-100">
                <div className="bg-warning rounded-circle p-4 d-inline-flex mb-3 border border-5 border-dark">
                  <Users size={64} className="text-black" />
                </div>
                <h6 className="fw-bold mb-2">Staff Management</h6>
                <p className="text-muted small mb-0">Attendance tracking and payroll management</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="text-center p-4 bg-white rounded-3 shadow h-100">
                <div className="bg-warning rounded-circle p-4 d-inline-flex mb-3 border border-5 border-dark">
                  <BarChart3 size={64} className="text-black" />
                </div>
                <h6 className="fw-bold mb-2">Analytics & Reports</h6>
                <p className="text-muted small mb-0">Detailed performance and revenue insights</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="text-center p-4 bg-white rounded-3 shadow h-100">
                <div className="bg-warning rounded-circle p-4 d-inline-flex mb-3 border border-5 border-dark">
                  <Wrench size={64} className="text-black" />
                </div>
                <h6 className="fw-bold mb-2">Maintenance Alerts</h6>
                <p className="text-muted small mb-0">Automated reminders for vehicle servicing</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="text-center p-4 bg-white rounded-3 shadow h-100">
                <div className="bg-warning rounded-circle p-4 d-inline-flex mb-3 border border-5 border-dark">
                  <Clock size={64} className="text-black" />
                </div>
                <h6 className="fw-bold mb-2">Real-Time Updates</h6>
                <p className="text-muted small mb-0">Live availability and booking status</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-5">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold mb-3">Trusted by many students</h2>
            <div className="d-flex justify-content-center align-items-center mb-4">
              <div className="d-flex me-3">
                {[1,2,3,4,5].map((star) => (
                  <Star key={star} size={20} className="text-warning" fill="currentColor" />
                ))}
              </div>
              <h4 className="text-muted mt-2">4.9/5</h4>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="d-flex mb-3">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} size={16} className="text-warning me-1" fill="currentColor" />
                    ))}
                  </div>
                  <p className="mb-4">"Customer support is exceptional. The platform is intuitive and the booking system is great."</p>
                  <div className="d-flex align-items-center">
                    <div className="me-2">
                      <img 
                        src="https://images.unsplash.com/photo-1515073838964-4d4d56a58b21?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                        alt="Sarah Mitchell" 
                        className="rounded-circle" 
                        style={{width: '50px', height: '50px', objectFit: 'cover'}} 
                      />
                    </div>
                    <div>
                      <h6 className="mb-0">Sarah Mitchell</h6>
                      <small className="text-muted">Student</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="d-flex mb-3">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} size={16} className="text-warning me-1" fill="currentColor" />
                    ))}
                  </div>
                  <p className="mb-4">"The scheduling and payment system has made my tasks so much smoother. Highly recommend!"</p>
                  <div className="d-flex align-items-center">
                    <div className="me-2">
                      <img 
                        src="https://images.unsplash.com/photo-1544576960-2faac32c5dd1?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjZ8fHN0dWRlbnQlMjBwcm9maWxlJTIwcGljdHVyZXxlbnwwfDB8MHx8fDI%3D" 
                        alt="Mark Johnson" 
                        className="rounded-circle" 
                        style={{width: '50px', height: '50px', objectFit: 'cover'}} 
                      />
                    </div>
                    <div>
                      <h6 className="mb-0">Mark Johnson</h6>
                      <small className="text-muted">Student</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="d-flex mb-3">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} size={16} className="text-warning me-1" fill="currentColor" />
                    ))}
                  </div>
                  <p className="mb-4">"The dashboard was easy to navigate and also the time slot selection is perfect."</p>
                  <div className="d-flex align-items-center">
                    <div className="me-2">
                      <img 
                        src="https://images.unsplash.com/photo-1727450395991-d76222e6c985?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzV8fHN0dWRlbnQlMjBwcm9maWxlJTIwcGljdHVyZXxlbnwwfDB8MHx8fDI%3D" 
                        alt="Lisa Chen" 
                        className="rounded-circle" 
                        style={{width: '50px', height: '50px', objectFit: 'cover'}} 
                      />
                    </div>
                    <div>
                      <h6 className="mb-0">Lisa Chen</h6>
                      <small className="text-muted">Student</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black text-white py-5">
        <div className="container py-4">
          <div className="row align-items-center">
            <div className="col-lg-8 text-center text-lg-start">
              <h2 className="display-6 fw-bold mb-3">Ready to modernize your driving?</h2>
              <p className="lead mb-0">Join hundreds of students who are already using DrivePro to streamline their operations.</p>
            </div>
            <div className="col-lg-4 text-center text-lg-end mt-4 mt-lg-0">
              <Link to="/register" className="btn btn-light btn-lg me-3">
                Get Started
                <ArrowRight size={20} className="ms-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-light py-4">
        <div className="container">
          <div className="d-flex align-items-center justify-content-center">
            <div className="col-md-6 text-center">
              <small className="text-muted">© 2025 DrivePro - All Rights Reserved</small>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .hover-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
        .fixed-top {
          backdrop-filter: blur(10px);
        }  
      `}</style>
    </div>
  );
}

export default LandingPage;