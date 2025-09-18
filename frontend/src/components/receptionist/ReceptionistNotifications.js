import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import ReceptionistNav from "./ReceptionistNav";
import { useNavigate } from "react-router-dom";

function ReceptionistNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Class canceled due to rain", read: false },
    { id: 2, message: "New instructor Angela White joined", read: false },
    { id: 3, message: "Student Sarah rescheduled appointment", read: true },
  ]);

  const markAsRead = (id) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
  };

  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") {
      navigate("/login");
    }
  }, []);

  return (
    <div>
      <ReceptionistNav page="notifications" />
      <div className="container" style={{ marginTop: "100px" }}>
        <h2 className="fw-bold mb-4">
          <Bell size={28} className="me-2 text-warning" />
          Notification Center
        </h2>

        <ul className="list-group">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`list-group-item d-flex justify-content-between align-items-center ${
                n.read ? "bg-light" : "bg-warning bg-opacity-25"
              }`}
            >
              <span>{n.message}</span>
              {!n.read && (
                <button
                  className="btn btn-sm btn-outline-dark"
                  onClick={() => markAsRead(n.id)}
                >
                  Mark as Read
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ReceptionistNotifications;