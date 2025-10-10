import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReceptionistNav from "./ReceptionistNav";
import { ClipboardList } from "lucide-react";

function ReceptionistDashboard() {
  const navigate = useNavigate();
  const [timeSlots, setTimeSlots] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [createTimeSlot, setCreateTimeSlot] = useState({
    date: "",
    startTime: "",
    endTime: "",
    status: "active",
    instructorId: "",
    vehicleId: "",
    maxCapacity: 1,
  });
  const [editingTimeSlot, setEditingTimeSlot] = useState(null);
  const [editTimeSlotData, setEditTimeSlotData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    status: "active",
    instructorId: "",
    vehicleId: "",
    maxCapacity: 1,
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteSlotId, setDeleteSlotId] = useState(null);
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
      const response = await fetch("http://localhost:3001/receptionist/getTimeSlots");
      if (!response.ok) throw new Error("Failed to fetch time slots");
      const data = await response.json();
      // console.log("Time slots data:", JSON.stringify(data, null, 2)); // Debug log
      setTimeSlots(data);
    } catch (error) {
      console.error("Error fetching time slots:", error);
      setError("Failed to load time slots. Please try again.");
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await fetch("http://localhost:3001/receptionist/getInstructors");
      if (!response.ok) throw new Error("Failed to fetch instructors");
      const data = await response.json();
      // console.log("Instructors data:", JSON.stringify(data, null, 2)); // Debug log
      setInstructors(data);
    } catch (error) {
      console.error("Error fetching instructors:", error);
      setError("Failed to load instructors. Please try again.");
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await fetch("http://localhost:3001/receptionist/getVehicles");
      if (!response.ok) throw new Error("Failed to fetch vehicles");
      const data = await response.json();
      // console.log("Vehicles data:", JSON.stringify(data, null, 2)); // Debug log
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
      const response = await fetch("http://localhost:3001/receptionist/createTimeSlot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createTimeSlot),
      });
      if (response.ok) {
        await fetchTimeSlots();
        setCreateTimeSlot({
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
        setError(errorData.error || "Error creating time slot");
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
      const response = await fetch(`http://localhost:3001/receptionist/updateTimeSlot/${editingTimeSlot._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editTimeSlotData),
      });
      if (response.ok) {
        await fetchTimeSlots();
        setShowEditModal(false);
        setEditingTimeSlot(null);
        setEditTimeSlotData({
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
        setError(errorData.error || "Error updating time slot");
      }
    } catch (error) {
      console.error("Error updating time slot:", error);
      setError("Failed to update time slot. Please try again.");
    }
  };

  const handleDeleteTimeSlot = async (id) => {
    setError(null);
    try {
      const response = await fetch(`http://localhost:3001/receptionist/deleteTimeSlot/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await fetchTimeSlots();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Error deleting time slot");
      }
    } catch (error) {
      console.error("Error deleting time slot:", error);
      setError("Failed to delete time slot. Please try again.");
    }
  };

  const startEditing = (slot) => {
    setEditingTimeSlot(slot);
    setEditTimeSlotData({
      date: new Date(slot.date).toISOString().split("T")[0],
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: slot.status,
      instructorId: slot.instructorId?._id || slot.instructorId || "",
      vehicleId: slot.vehicleId?._id || slot.vehicleId || "",
      maxCapacity: slot.maxCapacity,
    });
    setShowEditModal(true);
    setError(null);
  };

  const handleDeleteConfirm = () => {
    if (deleteSlotId) {
      handleDeleteTimeSlot(deleteSlotId);
      setDeleteSlotId(null);
    }
    setShowDeleteModal(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteSlotId(null);
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingTimeSlot(null);
    setEditTimeSlotData({
      date: "",
      startTime: "",
      endTime: "",
      status: "active",
      instructorId: "",
      vehicleId: "",
      maxCapacity: 1,
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

                  {/* Create Time Slot Form */}
                  <div className="mb-4">
                    <h5>Create New Time Slot</h5>
                    <form onSubmit={handleCreateTimeSlot} className="row g-3">
                      <div className="col-md-3">
                        <label className="form-label">Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={createTimeSlot.date}
                          onChange={(e) => setCreateTimeSlot({ ...createTimeSlot, date: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Start Time</label>
                        <input
                          type="time"
                          className="form-control"
                          value={createTimeSlot.startTime}
                          onChange={(e) => setCreateTimeSlot({ ...createTimeSlot, startTime: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">End Time</label>
                        <input
                          type="time"
                          className="form-control"
                          value={createTimeSlot.endTime}
                          onChange={(e) => setCreateTimeSlot({ ...createTimeSlot, endTime: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Status</label>
                        <select
                          className="form-select"
                          value={createTimeSlot.status}
                          onChange={(e) => setCreateTimeSlot({ ...createTimeSlot, status: e.target.value })}
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
                          value={createTimeSlot.instructorId}
                          onChange={(e) => setCreateTimeSlot({ ...createTimeSlot, instructorId: e.target.value })}
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
                          value={createTimeSlot.vehicleId}
                          onChange={(e) => setCreateTimeSlot({ ...createTimeSlot, vehicleId: e.target.value })}
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
                          value={createTimeSlot.maxCapacity}
                          onChange={(e) => setCreateTimeSlot({ ...createTimeSlot, maxCapacity: parseInt(e.target.value) })}
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
                          Create Time Slot
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Time Slots List */}
                  <div className="d-flex flex-column gap-2">
                    {timeSlots.length > 0 ? (
                      timeSlots.map((slot) => (
                        <div key={slot._id} className="bg-info bg-opacity-10 border rounded-3 p-3">
                          <strong>Date:</strong> {new Date(slot.date).toLocaleDateString()}<br />
                          <strong>Time:</strong> {slot.startTime} - {slot.endTime}<br />
                          <strong>Status:</strong> {slot.status}<br />
                          <strong>Instructor:</strong> {slot.instructorId?.name || "N/A"}<br />
                          <strong>Vehicle:</strong> {slot.vehicleId?.model || "N/A"}<br />
                          <strong>Capacity:</strong> {slot.bookedStudents?.length || 0} / {slot.maxCapacity}<br />
                          <button
                            className="btn btn-sm btn-outline-primary me-2 mt-2"
                            onClick={() => startEditing(slot)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger mt-2"
                            onClick={() => { setDeleteSlotId(slot._id); setShowDeleteModal(true); }}
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

      {/* Edit Time Slot Modal */}
      <div 
        className={`modal fade ${showEditModal ? 'show' : ''}`} 
        tabIndex="-1" 
        style={{ 
          display: showEditModal ? 'block' : 'none', 
          backgroundColor: 'rgba(0,0,0,0.5)' 
        }}
        onClick={handleCancelEdit}
      >
        <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Time Slot</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={handleCancelEdit}
                aria-label="Close"
              ></button>
            </div>
            <form onSubmit={handleEditTimeSlot}>
              <div className="modal-body">
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={editTimeSlotData.date}
                      onChange={(e) => setEditTimeSlotData({ ...editTimeSlotData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Start Time</label>
                    <input
                      type="time"
                      className="form-control"
                      value={editTimeSlotData.startTime}
                      onChange={(e) => setEditTimeSlotData({ ...editTimeSlotData, startTime: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label">End Time</label>
                    <input
                      type="time"
                      className="form-control"
                      value={editTimeSlotData.endTime}
                      onChange={(e) => setEditTimeSlotData({ ...editTimeSlotData, endTime: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={editTimeSlotData.status}
                      onChange={(e) => setEditTimeSlotData({ ...editTimeSlotData, status: e.target.value })}
                      required
                    >
                      <option value="active">Active</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label">Instructor</label>
                    <select
                      className="form-select"
                      value={editTimeSlotData.instructorId}
                      onChange={(e) => setEditTimeSlotData({ ...editTimeSlotData, instructorId: e.target.value })}
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
                  </div>
                  <div className="col-6">
                    <label className="form-label">Vehicle</label>
                    <select
                      className="form-select"
                      value={editTimeSlotData.vehicleId}
                      onChange={(e) => setEditTimeSlotData({ ...editTimeSlotData, vehicleId: e.target.value })}
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
                  </div>
                  <div className="col-6">
                    <label className="form-label">Max Capacity</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editTimeSlotData.maxCapacity}
                      onChange={(e) => setEditTimeSlotData({ ...editTimeSlotData, maxCapacity: parseInt(e.target.value) })}
                      min="1"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Time Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <div 
        className={`modal fade ${showDeleteModal ? 'show' : ''}`} 
        tabIndex="-1" 
        style={{ 
          display: showDeleteModal ? 'block' : 'none', 
          backgroundColor: 'rgba(0,0,0,0.5)' 
        }}
        onClick={handleCancelDelete}
      >
        <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Confirm Delete</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={handleCancelDelete}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete this time slot? This action cannot be undone.
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleCancelDelete}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={handleDeleteConfirm}>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReceptionistDashboard;