import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './VehicleAvailabilityDashboard.css'; // Basic styling for dashboard

const VehicleAvailabilityDashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [instructors, setInstructors] = useState([]); // Placeholder
  const [students, setStudents] = useState([]);       // Placeholder
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [assignFormData, setAssignFormData] = useState({
    instructorId: '',
    studentId: '',
    startDate: '',
    endDate: '',
  });
  const [assignMessage, setAssignMessage] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [vehiclesRes, assignmentsRes, instructorsRes, studentsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/vehicles'),
        axios.get('http://localhost:5000/api/assignments?status=Active,Scheduled'), // Fetch active/scheduled assignments
        axios.get('http://localhost:5000/api/instructors'), // Placeholder API
        axios.get('http://localhost:5000/api/students')     // Placeholder API
      ]);

      setVehicles(vehiclesRes.data);
      setAssignments(assignmentsRes.data);
      setInstructors(instructorsRes.data); // Assuming instructorsRes.data is an array of instructor objects
      setStudents(studentsRes.data);       // Assuming studentsRes.data is an array of student objects

    } catch (err) {
      setError('Failed to fetch dashboard data: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getVehicleStatus = (vehicleId) => {
    const assigned = assignments.some(
      (assign) =>
        assign.vehicle._id === vehicleId &&
        (assign.status === 'Active' || assign.status === 'Scheduled') &&
        new Date(assign.endDate) >= new Date() // Check if assignment is still valid
    );
    return assigned ? 'Assigned' : 'Available';
  };

  const handleAssignClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setAssignFormData({
      instructorId: '',
      studentId: '',
      startDate: new Date().toISOString().slice(0, 10), // Default to today
      endDate: '',
    });
    setAssignMessage('');
    setShowAssignModal(true);
  };

  const handleAssignFormChange = (e) => {
    const { name, value } = e.target;
    setAssignFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setAssignMessage('');

    if (new Date(assignFormData.startDate) > new Date(assignFormData.endDate)) {
      setAssignMessage('End date cannot be before start date.');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/assignments', {
        vehicle: selectedVehicle._id,
        ...assignFormData,
      });

      // Update vehicle availability on the backend
      await axios.put(`http://localhost:5000/api/vehicles/${selectedVehicle._id}`, { isAvailable: false });

      setAssignMessage('Vehicle assigned successfully!');
      setShowAssignModal(false);
      fetchDashboardData(); // Re-fetch data to update dashboard
    } catch (error) {
      setAssignMessage('Error assigning vehicle: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUnassign = async (assignmentId, vehicleId) => {
    if (!window.confirm('Are you sure you want to unassign this vehicle?')) return;

    try {
      // Mark assignment as completed/canceled
      await axios.put(`http://localhost:5000/api/assignments/${assignmentId}`, { status: 'Completed' });

      // Make vehicle available
      await axios.put(`http://localhost:5000/api/vehicles/${vehicleId}`, { isAvailable: true });

      alert('Vehicle unassigned successfully!');
      fetchDashboardData(); // Re-fetch data
    } catch (error) {
      alert('Error unassigning vehicle: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) return <p>Loading vehicle availability...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="availability-dashboard-container">
      <h2>Vehicle Availability Dashboard</h2>

      <div className="vehicle-grid">
        {vehicles.map((vehicle) => (
          <div key={vehicle._id} className={`vehicle-card ${getVehicleStatus(vehicle._id).toLowerCase()}`}>
            <h3>{vehicle.vehicleNumber}</h3>
            <p>{vehicle.makeModelYear}</p>
            <p>Status: <strong>{getVehicleStatus(vehicle._id)}</strong></p>
            {getVehicleStatus(vehicle._id) === 'Available' ? (
              <button onClick={() => handleAssignClick(vehicle)}>Assign</button>
            ) : (
              assignments
                .filter(assign => assign.vehicle._id === vehicle._id && (assign.status === 'Active' || assign.status === 'Scheduled'))
                .map(assign => (
                  <div key={assign._id} className="current-assignment-details">
                    <p>Assigned to:</p>
                    <p>Instructor: {assign.instructor?.name || 'N/A'}</p>
                    <p>Student: {assign.student?.name || 'N/A'}</p>
                    <p>Dates: {new Date(assign.startDate).toLocaleDateString()} - {new Date(assign.endDate).toLocaleDateString()}</p>
                    <button onClick={() => handleUnassign(assign._id, vehicle._id)} className="unassign-btn">Unassign</button>
                  </div>
                ))
            )}
          </div>
        ))}
      </div>

      {showAssignModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Assign Vehicle: {selectedVehicle?.vehicleNumber}</h3>
            <form onSubmit={handleAssignSubmit}>
              <div className="form-group">
                <label>Instructor:</label>
                <select
                  name="instructorId"
                  value={assignFormData.instructorId}
                  onChange={handleAssignFormChange}
                  required
                >
                  <option value="">Select Instructor</option>
                  {instructors.map((inst) => (
                    <option key={inst._id} value={inst._id}>{inst.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Student:</label>
                <select
                  name="studentId"
                  value={assignFormData.studentId}
                  onChange={handleAssignFormChange}
                  required
                >
                  <option value="">Select Student</option>
                  {students.map((stud) => (
                    <option key={stud._id} value={stud._id}>{stud.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Start Date:</label>
                <input
                  type="date"
                  name="startDate"
                  value={assignFormData.startDate}
                  onChange={handleAssignFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date:</label>
                <input
                  type="date"
                  name="endDate"
                  value={assignFormData.endDate}
                  onChange={handleAssignFormChange}
                  required
                />
              </div>
              <button type="submit">Assign Vehicle</button>
              <button type="button" onClick={() => setShowAssignModal(false)}>Cancel</button>
            </form>
            {assignMessage && <p className="message">{assignMessage}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleAvailabilityDashboard;