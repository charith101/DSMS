import React, { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import ReceptionistNav from "./ReceptionistNav";
import { useNavigate } from "react-router-dom";

function ReceptionistInstructorAvailability() {
  const navigate = useNavigate();
  const [instructors, setInstructors] = useState([
    { name: "Mike Tyson", available: true },
    { name: "Angela White", available: false },
    { name: "Tom Hardy", available: true },
  ]);

  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") {
      navigate("/login");
    }
  }, []);

  return (
    <div>
      <ReceptionistNav page="availability" />
      <div className="container" style={{ marginTop: "100px" }}>
        <h2 className="fw-bold mb-4">
          <CalendarDays size={32} className="me-2 text-success" />
          Instructor Availability
        </h2>

        <div className="row g-3">
          {instructors.map((i, index) => (
            <div className="col-md-4" key={index}>
              <div className={`card shadow-sm p-3 ${i.available ? "border-success" : "border-danger"}`}>
                <h5 className="fw-bold">{i.name}</h5>
                <span className={`badge ${i.available ? "bg-success" : "bg-danger"}`}>
                  {i.available ? "Available" : "Unavailable"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ReceptionistInstructorAvailability;