import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReceptionistNav from "./ReceptionistNav";

function AppointmentForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    student: "",
    instructor: "",
    date: "",
    time: "",
    recurring: false,
    weeks: 1,
    vehicleId: "" // Added for backend requirement
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/receptionist/bookAppointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        alert(`Appointment booked for ${formData.student}${formData.recurring ? ` weekly for ${formData.weeks} weeks` : ""}!`);
      } else {
        alert('Error booking appointment');
      }
    } catch (err) {
      alert('Server error');
    }
  };

  return (
    <div>
      <ReceptionistNav page="appointments" />
      <div className="container" style={{ marginTop: "100px", maxWidth: "600px" }}>
        <h2 className="fw-bold mb-4">Book Appointment</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="student" className="form-control mb-3" placeholder="Student Name" onChange={handleChange} required />
          <input type="text" name="instructor" className="form-control mb-3" placeholder="Instructor Name" onChange={handleChange} required />
          <input type="date" name="date" className="form-control mb-3" onChange={handleChange} required />
          <input type="time" name="time" className="form-control mb-3" onChange={handleChange} required />
          <input type="text" name="vehicleId" className="form-control mb-3" placeholder="Vehicle ID" onChange={handleChange} required /> {/* Added */}
          
          <div className="form-check mb-3">
            <input type="checkbox" className="form-check-input" name="recurring" onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })} />
            <label className="form-check-label">Recurring Weekly</label>
          </div>

          {formData.recurring && (
            <input type="number" name="weeks" className="form-control mb-3" placeholder="Number of weeks" min="1" onChange={handleChange} />
          )}

          <button className="btn btn-success w-100">Book Appointment</button>
        </form>
      </div>
    </div>
  );
}

export default AppointmentForm;