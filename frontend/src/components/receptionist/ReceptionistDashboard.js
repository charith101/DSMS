import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReceptionistNav from "./ReceptionistNav";
import { ClipboardList } from "lucide-react";

function ReceptionistDashboard() {
  const navigate = useNavigate();
  const [timeSlots, setTimeSlots] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [newTimeSlot, setNewTimeSlot] = useState({
    date: "",
    startTime: "",
    endTime: "",
    status: "active",
    instructorId: "",
    vehicleId: "",
    maxCapacity: 1,
  });
  const [editingTimeSlot, setEditingTimeSlot] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") {
      navigate("/login");
    } else {
      fetchTimeSlots();
      fetchInstructors();
      fetchVehicles();
    }
  }, []);

  const fetchTimeSlots = async () => {
    try {
      const response = await fetch("http://localhost:3001/receptionist/timeslots");
      if (!response.ok) throw new Error("Failed to fetch time slots");
      const data = await response.json();
      console.log("Time slots data:", JSON.stringify(data, null, 2)); // Debug log
      setTimeSlots(data);
    } catch (error) {
      console.error("Error fetching time slots:", error);
      setError("Failed to load time slots. Please try again.");
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await fetch("http://localhost:3001/employee/instructors");
      if (!response.ok) throw new Error("Failed to fetch instructors");
      const data = await response.json();
      console.log("Instructors data:", JSON.stringify(data, null, 2)); // Debug log
      setInstructors(data);
    } catch (error) {
      console.error("Error fetching instructors:", error);
      setError("Failed to load instructors. Please try again.");
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await fetch("http://localhost:3001/vehicles");
      if (!response.ok) throw new Error("Failed to fetch vehicles");
      const data = await response.json();
      console.log("Vehicles data:", JSON.stringify(data, null, 2)); // Debug log
      setVehicles(data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setError("Failed to load vehicles. Please try again.");
    }
  };

  const handleCreateTimeSlot = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch("http://localhost:3001/receptionist/timeslots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTimeSlot),
      });
      if (response.ok) {
        await fetchTimeSlots();
        setNewTimeSlot({
          date: "",
          startTime: "",
          endTime: "",
          status: "active",
          instructorId: "",
          vehicleId: "",
          maxCapacity: 1,
        });
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error creating time slot");
      }
    } catch (error) {
      console.error("Error creating time slot:", error);
      setError("Failed to create time slot. Please try again.");
    }
  };

  const handleEditTimeSlot = async (e) => {
    e.preventDefault();
    if (!editingTimeSlot) return;
    setError(null);
    try {
      const response = await fetch(`http://localhost:3001/receptionist/timeslots/${editingTimeSlot._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTimeSlot),
      });
      if (response.ok) {
        await fetchTimeSlots();
        setEditingTimeSlot(null);
        setNewTimeSlot({
          date: "",
          startTime: "",
          endTime: "",
          status: "active",
          instructorId: "",
          vehicleId: "",
          maxCapacity: 1,
        });
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error updating time slot");
      }
    } catch (error) {
      console.error("Error updating time slot:", error);
      setError("Failed to update time slot. Please try again.");
    }
  };

  const handleDeleteTimeSlot = async (id) => {
    setError(null);
    try {
      const response = await fetch(`http://localhost:3001/receptionist/timeslots/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await fetchTimeSlots();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error deleting time slot");
      }
    } catch (error) {
      console.error("Error deleting time slot:", error);
      setError("Failed to delete time slot. Please try again.");
    }
  };

  const startEditing = (slot) => {
    setEditingTimeSlot(slot);
    setNewTimeSlot({
      date: new Date(slot.date).toISOString().split("T")[0],
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: slot.status,
      instructorId: slot.instructorId?._id || slot.instructorId || "",
      vehicleId: slot.vehicleId?._id || slot.vehicleId || "",
      maxCapacity: slot.maxCapacity,
    });
    setError(null);
  };

  return (
    <div>
      <ReceptionistNav page="home" />

      <section
        className="text-white pb-5"
        style={{
          background: "linear-gradient(135deg, #097965 0%, #03a9f4 100%)",
          marginTop: "76px",
        }}
      >
        <div className="container py-5">
          <h1 className="fw-bold display-5 mb-3 mx-1">Welcome back, Receptionist</h1>
          <h6 className="fs-6 lead opacity-90">
            Manage time slots efficiently from your dashboard.
          </h6>
        </div>
      </section>

      <div className="py-5 bg-light">
        <div className="container">
          <div className="row g-4">
            {/* Time Slot Management */}
            <div className="col-12">
              <div className="card border-2 shadow-sm p-3">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                      <ClipboardList size={64} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="mb-1 fw-bold">Time Slot Management</h3>
                      <small className="text-muted">View, create, edit, and delete time slots</small>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  {/* Create/Edit Time Slot Form */}
                  <div className="mb-4">
                    <h5>{editingTimeSlot ? "Edit Time Slot" : "Create New Time Slot"}</h5>
                    <form onSubmit={editingTimeSlot ? handleEditTimeSlot : handleCreateTimeSlot} className="row g-3">
                      <div className="col-md-3">
                        <label className="form-label">Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={newTimeSlot.date}
                          onChange={(e) => setNewTimeSlot({ ...newTimeSlot, date: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Start Time</label>
                        <input
                          type="time"
                          className="form-control"
                          value={newTimeSlot.startTime}
                          onChange={(e) => setNewTimeSlot({ ...newTimeSlot, startTime: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">End Time</label>
                        <input
                          type="time"
                          className="form-control"
                          value={newTimeSlot.endTime}
                          onChange={(e) => setNewTimeSlot({ ...newTimeSlot, endTime: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Status</label>
                        <select
                          className="form-select"
                          value={newTimeSlot.status}
                          onChange={(e) => setNewTimeSlot({ ...newTimeSlot, status: e.target.value })}
                          required
                        >
                          <option value="active">Active</option>
                          <option value="disabled">Disabled</option>
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Instructor</label>
                        <select
                          className="form-select"
                          value={newTimeSlot.instructorId}
                          onChange={(e) => setNewTimeSlot({ ...newTimeSlot, instructorId: e.target.value })}
                          required
                          disabled={instructors.length === 0}
                        >
                          <option value="">Select Instructor</option>
                          {instructors.map((instructor) => (
                            <option key={instructor._id} value={instructor._id}>
                              {instructor.name}
                            </option>
                          ))}
                        </select>
                        {instructors.length === 0 && (
                          <small className="text-danger">No instructors available</small>
                        )}
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Vehicle</label>
                        <select
                          className="form-select"
                          value={newTimeSlot.vehicleId}
                          onChange={(e) => setNewTimeSlot({ ...newTimeSlot, vehicleId: e.target.value })}
                          required
                          disabled={vehicles.length === 0}
                        >
                          <option value="">Select Vehicle</option>
                          {vehicles.map((vehicle) => (
                            <option key={vehicle._id} value={vehicle._id}>
                              {vehicle.vehicleNumber} ({vehicle.make} {vehicle.model})
                            </option>
                          ))}
                        </select>
                        {vehicles.length === 0 && (
                          <small className="text-danger">No vehicles available</small>
                        )}
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Max Capacity</label>
                        <input
                          type="number"
                          className="form-control"
                          value={newTimeSlot.maxCapacity}
                          onChange={(e) => setNewTimeSlot({ ...newTimeSlot, maxCapacity: parseInt(e.target.value) })}
                          min="1"
                          required
                        />
                      </div>
                      <div className="col-md-3 d-flex align-items-end">
                        <button
                          type="submit"
                          className="btn btn-primary w-100"
                          disabled={instructors.length === 0 || vehicles.length === 0}
                        >
                          {editingTimeSlot ? "Update Time Slot" : "Create Time Slot"}
                        </button>
                        {editingTimeSlot && (
                          <button
                            type="button"
                            className="btn btn-secondary ms-2"
                            onClick={() => {
                              setEditingTimeSlot(null);
                              setNewTimeSlot({
                                date: "",
                                startTime: "",
                                endTime: "",
                                status: "active",
                                instructorId: "",
                                vehicleId: "",
                                maxCapacity: 1,
                              });
                              setError(null);
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* Time Slots List */}
                  <div className="d-flex flex-column gap-2">
                    {timeSlots.length > 0 ? (
                      timeSlots.map((slot, index) => (
                        <div key={index} className="bg-info bg-opacity-10 border rounded-3 p-3">
                          <strong>Date:</strong> {new Date(slot.date).toLocaleDateString()}<br />
                          <strong>Time:</strong> {slot.startTime} - {slot.endTime}<br />
                          <strong>Status:</strong> {slot.status}<br />
                          <strong>Instructor:</strong> {slot.instructorId?.name || "N/A"}<br />
                          <strong>Vehicle:</strong> {slot.vehicleId?.vehicleNumber || "N/A"}<br />
                          <strong>Max Capacity:</strong> {slot.maxCapacity}<br />
                          <strong>Booked Students:</strong> {slot.bookedStudents?.map(s => s.name || "N/A").join(", ") || "None"}<br />
                          <button
                            className="btn btn-sm btn-outline-primary me-2 mt-2"
                            onClick={() => startEditing(slot)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger mt-2"
                            onClick={() => handleDeleteTimeSlot(slot._id)}
                          >
                            Delete
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="bg-info bg-opacity-10 border rounded-3 p-3">
                        No time slots available.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReceptionistDashboard;