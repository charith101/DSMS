import React from 'react'
import { Link, useNavigate } from "react-router-dom";
import { Car,ArrowRight, User2,} from 'lucide-react';

function StudentNav() {

    const navigate = useNavigate()
    
    const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userId");
    }; 

  return (
    <div>
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
              <Link to="/student-dashboard" className="fw-medium nav-link active m-2">
                Home
              </Link>
              <Link to="/login" className="fw-medium nav-link active m-2">
                Pick Time Slot
              </Link>
              <Link to="/register" className="fw-medium nav-link active m-2">
                Mock Exam
              </Link>
              <Link to="/register" className="fw-medium nav-link active m-2">
                Profile 
              </Link>
              <button className="fw-medium btn btn-dark " onClick={() => {handleLogout(); navigate("/login");}}>Logout <ArrowRight size={16} className="ms-1" /></button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}

export default StudentNav;