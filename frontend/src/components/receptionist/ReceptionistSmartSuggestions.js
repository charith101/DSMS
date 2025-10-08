import React, { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";
import ReceptionistNav from "./ReceptionistNav";
import { useNavigate } from "react-router-dom";

function ReceptionistSmartSuggestions() {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") {
      navigate("/login");
    }
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await fetch('/receptionist/smartSuggestions');
      const data = await response.json();
      setSuggestions(data);
    } catch (err) {
      console.error('Error fetching suggestions');
    }
  };

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