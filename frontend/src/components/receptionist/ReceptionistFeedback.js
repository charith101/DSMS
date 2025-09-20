import React, { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import ReceptionistNav from "./ReceptionistNav";
import { useNavigate } from "react-router-dom";

function ReceptionistFeedback() {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState([
    { student: "Sarah Williams", class: "Manual Driving", comment: "Great session!", rating: "👍" },
    { student: "John Lee", class: "Highway Practice", comment: "Too short", rating: "👎" },
  ]);

  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") {
      navigate("/login");
    }
  }, []);

  return (
    <div>
      <ReceptionistNav page="feedback" />
      <div className="container" style={{ marginTop: "100px" }}>
        <h2 className="fw-bold mb-4">
          <MessageCircle size={32} className="me-2 text-info" />
          Class Feedback
        </h2>

        <div className="d-flex flex-column gap-3">
          {feedback.map((fb, index) => (
            <div className="card p-3 shadow-sm" key={index}>
              <strong>Student:</strong> {fb.student} <br />
              <strong>Class:</strong> {fb.class} <br />
              <strong>Comment:</strong> {fb.comment} <br />
              <strong>Rating:</strong> {fb.rating}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ReceptionistFeedback;