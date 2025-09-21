import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Car, ArrowRight } from 'lucide-react';

function StudentNav({ page }) {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userId");
  };

  // Map page prop to nav item text for comparison
  const pageMap = {
    home: "Home",
    timeslot: "Pick Time Slot",
    mockexam: "Mock Exam",
    feedback: "Feedback",
    profile: "Profile"
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light shadow-sm fixed-top" style={{
        backgroundColor: 'rgba(255, 255, 255, 0.65)',
            backdropFilter: 'saturate(180%) blur(20px)',
            WebkitBackdropFilter: 'saturate(180%) blur(10px)',
            boxShadow: '0 0.125rem 0.25rem rgb(0 0 0 / 0.075)'
      }}>
        <div className="container-fluid">
          <Link className="navbar-brand fw-bold fs-3 text-primary d-flex align-items-center" to="/student-dashboard">
            <Car className="me-2" size={32} />
            DrivePro
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <div className="ms-auto d-flex flex-column flex-lg-row gap-2 mt-3 mt-lg-0">
              <Link to="/student-dashboard" className={`fw-medium mx-2 my-auto relative text-black ${page === 'home' ? 'border-b border-black' : ''}`}>
                Home
              </Link>
              <Link to="/Time-Slot" className={`fw-medium mx-2 my-auto relative text-black ${page === 'timeslot' ? 'border-b border-black' : ''}`}>
                Pick Time Slot
              </Link>
              <Link to="/Mock-Exam" className={`fw-medium mx-2 my-auto relative text-black ${page === 'mockexam' ? 'border-b border-black' : ''}`}>
                Mock Exam
              </Link>
              <Link to="/student-feedback" className={`fw-medium mx-2 my-auto relative text-black ${page === 'feedback' ? 'border-b border-black' : ''}`}>
                Feedback
              </Link>
              <Link to="/Student-Profile" className={`fw-medium mx-2 my-auto relative text-black ${page === 'profile' ? 'border-b border-black' : ''}`}>
                Profile
              </Link>
              <button 
                className="fw-medium btn btn-dark m-2" 
                onClick={() => {handleLogout(); navigate("/login");}}
              >
                Logout <ArrowRight size={16} className="ms-1" />
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default StudentNav;