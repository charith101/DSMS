import React, { useEffect } from "react";
import { UserRoundCheck } from "lucide-react";
import ReceptionistNav from "./ReceptionistNav";
import { useNavigate } from "react-router-dom";

function ReceptionistStudentTimeline() {
  const navigate = useNavigate();
  const timeline = [
    { label: "Registered", date: "2025-09-01" },
    { label: "First Class Attended", date: "2025-09-03" },
    { label: "First Payment Made", date: "2025-09-04" },
    { label: "Class Completed", date: "2025-09-14" },
    { label: "Feedback Given", date: "2025-09-15" },
  ];

  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") {
      navigate("/login");
    }
  }, []);

  return (
    <div>
      <ReceptionistNav page="timeline" />
      <div className="container" style={{ marginTop: "100px", maxWidth: "600px" }}>
        <h2 className="fw-bold mb-4">
          <UserRoundCheck size={32} className="me-2 text-primary" />
          Student Activity Timeline
        </h2>

        <ul className="list-group">
          {timeline.map((t, index) => (
            <li key={index} className="list-group-item d-flex justify-content-between">
              <span>{t.label}</span>
              <span className="text-muted">{t.date}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ReceptionistStudentTimeline;