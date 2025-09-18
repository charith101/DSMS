import React, { useEffect } from "react";
import { Car } from "lucide-react";
import ReceptionistNav from "./ReceptionistNav";
import { useNavigate } from "react-router-dom";

function ReceptionistVehicleUsage() {
  const navigate = useNavigate();
  const vehicles = [
    { name: "Car A", status: "In Use", time: "10:00 - 11:00 AM" },
    { name: "Car B", status: "Free", time: "—" },
    { name: "Car C", status: "In Use", time: "9:00 - 10:30 AM" },
  ];

  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") {
      navigate("/login");
    }
  }, []);

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