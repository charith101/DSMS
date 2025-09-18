import React, { useEffect, useState } from "react";
import { RotateCcw, Check, X } from "lucide-react";
import ReceptionistNav from "./ReceptionistNav";
import { useNavigate } from "react-router-dom";

function ReceptionistRescheduleRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([
    { id: 1, student: "Emma Watson", oldTime: "10:00 AM", newTime: "2:00 PM", approved: null },
    { id: 2, student: "Harry Potter", oldTime: "9:00 AM", newTime: "11:00 AM", approved: null },
  ]);

  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") {
      navigate("/login");
    }
  }, []);

  const handleDecision = (id, approve) => {
    const updated = requests.map(r => r.id === id ? { ...r, approved: approve } : r);
    setRequests(updated);
  };

  return (
    <div>
      <ReceptionistNav page="reschedule" />
      <div className="container" style={{ marginTop: "100px" }}>
        <h2 className="fw-bold mb-4">
          <RotateCcw size={28} className="me-2" />
          Reschedule Requests
        </h2>

        <div className="row g-3">
          {requests.map((r) => (
            <div key={r.id} className="col-md-6">
              <div className="card p-3 shadow-sm d-flex justify-content-between">
                <p>
                  <strong>{r.student}</strong> requests change from <b>{r.oldTime}</b> to <b>{r.newTime}</b>
                </p>
                <div className="d-flex gap-2">
                  <button onClick={() => handleDecision(r.id, true)} className="btn btn-success btn-sm">
                    <Check />
                  </button>
                  <button onClick={() => handleDecision(r.id, false)} className="btn btn-danger btn-sm">
                    <X />
                  </button>
                </div>
                {r.approved !== null && (
                  <span className={`mt-2 badge ${r.approved ? 'bg-success' : 'bg-danger'}`}>
                    {r.approved ? 'Approved' : 'Rejected'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ReceptionistRescheduleRequests;