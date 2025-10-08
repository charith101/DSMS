import React, { useEffect, useState } from "react";
import { UserRoundCheck } from "lucide-react";
import ReceptionistNav from "./ReceptionistNav";
import { useNavigate } from "react-router-dom";

function ReceptionistStudentTimeline() {
  const navigate = useNavigate();
  const [timeline, setTimeline] = useState([]);
  const [studentName, setStudentName] = useState("Emma Watson"); // Default or from props/param

  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") {
      navigate("/login");
    }
    fetchTimeline();
  }, [studentName]);

  const fetchTimeline = async () => {
    try {
      const response = await fetch(`/receptionist/studentTimeline/${studentName}`);
      const data = await response.json();
      setTimeline(data);
    } catch (err) {
      console.error('Error fetching timeline');
    }
  };

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