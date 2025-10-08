import React, { useState, useEffect } from "react";
import ReceptionistNav from "./ReceptionistNav";
import { useNavigate } from "react-router-dom";

function ReceptionistSearchStudents() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") {
      navigate("/login");
    }
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/receptionist/searchStudents?query=${searchQuery}`);
      const data = await response.json();
      setStudents(data);
    } catch (err) {
      console.error('Error searching students');
    }
  };

  return (
    <div>
      <ReceptionistNav page="search" />
      <div className="container" style={{ marginTop: "100px" }}>
        <h2 className="fw-bold mb-4">Search Students</h2>
        <form onSubmit={handleSearch} className="d-flex mb-4">
          <input
            type="text"
            className="form-control me-2"
            placeholder="Search by name, email, or NIC"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="btn btn-primary">Search</button>
        </form>

        {students.length > 0 ? (
          <div className="row g-3">
            {students.map((student, index) => (
              <div key={index} className="col-md-4">
                <div className="card p-3 shadow-sm">
                  <h5>{student.name}</h5>
                  <p>Email: {student.email}</p>
                  <p>Age: {student.age}</p>
                  <p>NIC: {student.nic}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted">No matching students found.</p>
        )}
      </div>
    </div>
  );
}

export default ReceptionistSearchStudents;