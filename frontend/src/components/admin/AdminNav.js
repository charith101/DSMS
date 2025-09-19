import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Car, ArrowRight } from 'lucide-react';

function AdminNav({ page }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.clear();
    navigate("/login");
  };

  // Map page prop to nav item text for comparison
  const pageMap = {
    home: "Home",
    students: "Students",
    employees: "Employees",
    finance: "Finance",
    vehicles: "Vehicles",
    profile: "Profile"
  };

  return (
    <div>
      <nav
        className="navbar navbar-expand-lg navbar-light shadow-sm fixed-top"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(10px)',
          boxShadow: '0 0.125rem 0.25rem rgb(0 0 0 / 0.075)',
          zIndex: 1000,
        }}
      >
        <div className="container-fluid">
          <Link className="navbar-brand fw-bold fs-3 text-primary d-flex align-items-center" to="/admin-dashboard">
            <Car className="me-2" size={32} />
            DrivePro Admin
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <div className="ms-auto d-flex flex-column flex-lg-row gap-2 mt-3 mt-lg-0">
              <Link
                to="/admin-dashboard"
                className={`fw-medium text-black mx-2 my-auto relative ${page === 'home' ? 'border-b-2 border-primary' : 'nav-link active'}`}
              >
                Home
              </Link>
              <Link
                to="/students"
                className={`fw-medium text-black mx-2 my-auto relative ${page === 'students' ? 'border-b-2 border-primary' : 'nav-link active'}`}
              >
                Students
              </Link>
              <Link
                to="/employees"
                className={`fw-medium text-black mx-2 my-auto relative ${page === 'employees' ? 'border-b-2 border-primary' : 'nav-link active'}`}
              >
                Employees
              </Link>
              <Link
                to="/finance"
                className={`fw-medium text-black mx-2 my-auto relative ${page === 'finance' ? 'border-b-2 border-primary' : 'nav-link active'}`}
              >
                Finance
              </Link>
              <Link
                to="/vehicles"
                className={`fw-medium text-black mx-2 my-auto relative ${page === 'vehicles' ? 'border-b-2 border-primary' : 'nav-link active'}`}
              >
                Vehicles
              </Link>
              <Link
                to="/profile"
                className={`fw-medium text-black mx-2 my-auto relative ${page === 'profile' ? 'border-b-2 border-primary' : 'nav-link active'}`}
              >
                Profile
              </Link>
              <button
                className="fw-medium btn btn-dark m-2"
                onClick={handleLogout}
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

export default AdminNav;