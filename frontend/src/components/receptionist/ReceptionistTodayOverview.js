import React, { useEffect, useState } from "react";
import { BarChart } from "lucide-react";
import ReceptionistNav from "./ReceptionistNav";
import { useNavigate } from "react-router-dom";

function ReceptionistTodayOverview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    appointments: 0,
    students: 0,
    classes: 0,
    cancellations: 0,
  });

  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") {
      navigate("/login");
    }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/receptionist/todayOverview');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats');
    }
  };

  return (
    <div>
      <ReceptionistNav page="overview" />
      <div className="container" style={{ marginTop: "100px" }}>
        <h2 className="fw-bold mb-4">
          <BarChart size={32} className="me-2 text-warning" />
          Today’s Overview
        </h2>

        <div className="row g-4">
          {Object.entries(stats).map(([key, value]) => (
            <div className="col-md-3" key={key}>
              <div className="card p-4 shadow-sm text-center">
                <h1 className="display-6 fw-bold">{value}</h1>
                <p className="text-muted text-capitalize">{key}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ReceptionistTodayOverview;