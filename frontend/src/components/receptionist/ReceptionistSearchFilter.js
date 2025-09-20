import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import ReceptionistNav from "./ReceptionistNav";
import { useNavigate } from "react-router-dom";

function ReceptionistSearchFilter() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([
    { name: "Emma Watson", status: "Active" },
    { name: "Harry Potter", status: "Completed" },
    { name: "John Lee", status: "Active" },
  ]);

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") {
      navigate("/login");
    }
  }, []);

  return (
    <div>
      <ReceptionistNav page="search" />
      <div className="container" style={{ marginTop: "100px", maxWidth: "700px" }}>
        <h2 className="fw-bold mb-4">
          <Search size={28} className="me-2 text-info" />
          Search & Filter Students
        </h2>

        <input
          type="text"
          className="form-control mb-4"
          placeholder="Search by student name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {filteredStudents.length > 0 ? (
          <ul className="list-group">
            {filteredStudents.map((s, index) => (
              <li key={index} className="list-group-item d-flex justify-content-between">
                <span>{s.name}</span>
                <span className="badge bg-secondary">{s.status}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">No matching students found.</p>
        )}
      </div>
    </div>
  );
}

export default ReceptionistSearchFilter;