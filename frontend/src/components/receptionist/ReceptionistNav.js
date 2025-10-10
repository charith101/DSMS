import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { UsersRound, ArrowRight } from "lucide-react";

function ReceptionistNav({ page }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-light shadow-sm fixed-top"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.65)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(10px)",
        boxShadow: "0 0.125rem 0.25rem rgb(0 0 0 / 0.075)",
      }}>
      <div className="container-fluid">
        <Link
          className="navbar-brand fw-bold fs-3 text-success d-flex align-items-center"
          to="/receptionist-dashboard">
          <UsersRound
            className="me-2"
            size={32}
          />
          DrivePro
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavReceptionist"
          aria-controls="navbarNavReceptionist"
          aria-expanded="false"
          aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className="collapse navbar-collapse"
          id="navbarNavReceptionist">
          <div className="ms-auto d-flex flex-column flex-lg-row gap-2 mt-3 mt-lg-0">
            <Link
              to="/receptionist-dashboard"
              className={`fw-medium text-black mx-2 my-auto ${page === "home" ? "border-bottom border-success" : ""}`}>
              Time Slot
            </Link>

            <Link
              to="/receptionist-attendance"
              className={`fw-medium text-black mx-2 my-auto ${page === "attendance" ? "border-bottom border-success" : ""}`}>
              Student Attendance
            </Link>

            <Link
              to="/receptionist-classes"
              className={`fw-medium text-black mx-2 my-auto ${page === "classes" ? "border-bottom border-success" : ""}`}>
              Class Timetable
            </Link>

            <Link
              to="/receptionist-students"
              className={`fw-medium text-black mx-2 my-auto ${page === "students" ? "border-bottom border-success" : ""}`}>
              Students
            </Link>

            <Link
              to="/receptionist-late-students"
              className={`fw-medium text-black mx-2 my-auto ${page === "late" ? "border-bottom border-success" : ""}`}>
              Late Students
            </Link>

            <Link
              to="/receptionist-feedback"
              className={`fw-medium text-black mx-2 my-auto ${page === "feedback" ? "border-bottom border-success" : ""}`}>
              Feedback
            </Link>

            <button
              className="fw-medium btn btn-dark m-2"
              onClick={handleLogout}>
              Logout{" "}
              <ArrowRight
                size={16}
                className="ms-1"
              />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default ReceptionistNav;
