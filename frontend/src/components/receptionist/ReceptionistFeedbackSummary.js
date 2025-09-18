import React, { useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import ReceptionistNav from "./ReceptionistNav";
import { useNavigate } from "react-router-dom";

function ReceptionistFeedbackSummary() {
  const navigate = useNavigate();
  const feedback = [
    { student: "Emma Watson", rating: "positive", comment: "Great class!" },
    { student: "Harry Potter", rating: "negative", comment: "Too fast paced" },
    { student: "John Lee", rating: "positive", comment: "Loved the instructor!" },
  ];

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
          Feedback Summary
        </h2>

        <div className="row g-3">
          {feedback.map((f, index) => (
            <div
              key={index}
              className={`card p-3 shadow-sm ${
                f.rating === "positive" ? "border-success" : "border-danger"
              }`}
            >
              <h5 className="mb-1">{f.student}</h5>
              <p className="mb-2 text-muted">{f.comment}</p>
              <div>
                {f.rating === "positive" ? (
                  <ThumbsUp className="text-success" />
                ) : (
                  <ThumbsDown className="text-danger" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ReceptionistFeedbackSummary;