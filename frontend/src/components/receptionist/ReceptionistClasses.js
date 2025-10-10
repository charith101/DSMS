import React, { useEffect, useState } from "react";
import { CalendarCheck, Edit2 } from "lucide-react";
import ReceptionistNav from "./ReceptionistNav";
import { useNavigate } from "react-router-dom";

function ReceptionistClasses() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState('');
  const [instructorFilter, setInstructorFilter] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');

  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") {
      navigate("/login");
    } else {
      fetchInstructors();
      fetchVehicles();
      fetchClasses();
    }
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("http://localhost:3001/receptionist/getTimeSlots");
      if (!response.ok) {
        throw new Error("Failed to fetch class schedule");
      }
      const data = await response.json();
      setClasses(data);
    } catch (err) {
      console.error("Error fetching classes:", err);
      setError("Failed to load class schedule. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await fetch("http://localhost:3001/receptionist/getInstructors");
      if (!response.ok) throw new Error("Failed to fetch instructors");
      const data = await response.json();
      setInstructors(data);
    } catch (err) {
      console.error("Error fetching instructors:", err);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await fetch("http://localhost:3001/receptionist/getVehicles");
      if (!response.ok) throw new Error("Failed to fetch vehicles");
      const data = await response.json();
      setVehicles(data);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    }
  };

  const filteredClasses = classes.filter((cls) => {
    const dateMatch = !dateFilter || new Date(cls.date).toDateString() === new Date(dateFilter).toDateString();
    const instructorMatch = !instructorFilter || cls.instructorId?._id === instructorFilter;
    const vehicleMatch = !vehicleFilter || cls.vehicleId?._id === vehicleFilter;
    return dateMatch && instructorMatch && vehicleMatch;
  });

  const handleEdit = (classId) => {
    // Navigate to edit page or open modal; for now, log or navigate
    console.log("Edit class:", classId);
    // Example: navigate(`/receptionist/edit-class/${classId}`);
  };

  const clearFilters = () => {
    setDateFilter('');
    setInstructorFilter('');
    setVehicleFilter('');
  };

  if (loading) {
    return (
      <div>
        <ReceptionistNav page="classes" />
        <div className="container" style={{ marginTop: "100px" }}>
          <div className="d-flex justify-content-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ReceptionistNav page="classes" />
      <div className="container" style={{ marginTop: "100px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold mb-0">
            <CalendarCheck size={32} className="me-2 text-primary" />
            Class Schedule
          </h2>
          <button className="btn btn-primary" onClick={fetchClasses}>
            Refresh
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="row mb-3">
          <div className="col-md-3">
            <label className="form-label">Filter by Date</label>
            <input
              type="date"
              className="form-control"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Filter by Instructor</label>
            <select
              className="form-select"
              value={instructorFilter}
              onChange={(e) => setInstructorFilter(e.target.value)}
            >
              <option value="">All Instructors</option>
              {instructors.map((instructor) => (
                <option key={instructor._id} value={instructor._id}>
                  {instructor.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Filter by Vehicle</label>
            <select
              className="form-select"
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
            >
              <option value="">All Vehicles</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle._id} value={vehicle._id}>
                  {vehicle.vehicleNumber} ({vehicle.make} {vehicle.model})
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3 d-flex align-items-end">
            <button className="btn btn-outline-secondary w-100" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>

        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-dark">
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Time</th>
                    <th scope="col">Instructor</th>
                    <th scope="col">Vehicle</th>
                    <th scope="col">Status</th>
                    <th scope="col">Capacity</th>
                    <th scope="col">Booked Students</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClasses.length > 0 ? (
                    filteredClasses.map((cls) => (
                      <tr key={cls._id}>
                        <td>{new Date(cls.date).toLocaleDateString()}</td>
                        <td>{`${cls.startTime} - ${cls.endTime}`}</td>
                        <td>{cls.instructorId?.name || "N/A"}</td>
                        <td>{cls.vehicleId?.model || "N/A"}</td>
                        <td>
                          <span className={`badge ${cls.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                            {cls.status}
                          </span>
                        </td>
                        <td>{cls.bookedStudents?.length || 0} / {cls.maxCapacity}</td>
                        <td>
                          {cls.bookedStudents?.length > 0 ? (
                            <small>
                              {cls.bookedStudents.map((student) => student.name).join(", ")}
                            </small>
                          ) : (
                            "None"
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        No classes matching the filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReceptionistClasses;