import React, { useEffect } from "react";
import { Lightbulb } from "lucide-react";
import ReceptionistNav from "./ReceptionistNav";
import { useNavigate } from "react-router-dom";

function ReceptionistSmartSuggestions() {
  const navigate = useNavigate();
  const suggestions = [
    "10:00 AM Monday is the most preferred slot.",
    "Avoid scheduling on Friday evenings – high cancellation rate.",
    "Angela White has best feedback – schedule peak hours with her.",
  ];

  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") {
      navigate("/login");
    }
  }, []);

  return (
    <div>
      <ReceptionistNav page="suggestions" />
      <div className="container" style={{ marginTop: "100px" }}>
        <h2 className="fw-bold mb-4">
          <Lightbulb size={28} className="me-2 text-warning" />
          Smart Suggestions
        </h2>

        <ul className="list-group">
          {suggestions.map((s, index) => (
            <li key={index} className="list-group-item">
              💡 {s}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ReceptionistSmartSuggestions;