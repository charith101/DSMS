import React, { useEffect, useState } from "react";
import { Car } from "lucide-react";
import ReceptionistNav from "./ReceptionistNav";
import { useNavigate } from "react-router-dom";

function ReceptionistVehicleUsage() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") {
      navigate("/login");
    }
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/receptionist/vehicleUsage');
      const data = await response.json();
      setVehicles(data);
    } catch (err) {
      console.error('Error fetching vehicles');
    }
  };

  return (
    <div>
      <ReceptionistNav page="vehicles" />
      <div className="container" style={{ marginTop: "100px" }}>
        <h2 className="fw-bold mb-4">
          <Car size={28} className="me-2 text-primary" />
          Vehicle Usage Tracker
        </h2>

        <div className="row g-3">
          {vehicles.map((v, index) => (
            <div key={index} className={`card p-3 shadow-sm ${v.status === "In Use" ? "border-warning" : "border-success"}`}>
              <h5>{v.name}</h5>
              <p>Status: <strong>{v.status}</strong></p>
              <p>Time: {v.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ReceptionistVehicleUsage;