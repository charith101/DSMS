import React, { useState } from 'react';
import axios from 'axios';
import './VehicleForm.css'; // Assume some basic styling

const VehicleRegistrationForm = ({ onVehicleAdded }) => {
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    makeModelYear: '',
    transmissionType: 'Manual',
    engineCapacity: '',
    registrationDate: '',
    vehiclePhoto: null, // For file input
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prevData) => ({ ...prevData, vehiclePhoto: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }

    try {
      const response = await axios.post('http://localhost:5000/api/vehicles', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('Vehicle registered successfully!');
      setFormData({ // Reset form
        vehicleNumber: '', makeModelYear: '', transmissionType: 'Manual',
        engineCapacity: '', registrationDate: '', vehiclePhoto: null,
      });
      if (onVehicleAdded) onVehicleAdded(response.data); // Notify parent to refresh list
    } catch (error) {
      setMessage('Error registering vehicle: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="vehicle-form-container">
      <h2>Register New Vehicle</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Vehicle Number:</label>
          <input
            type="text"
            name="vehicleNumber"
            value={formData.vehicleNumber}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Make/Model/Year:</label>
          <input
            type="text"
            name="makeModelYear"
            value={formData.makeModelYear}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Transmission Type:</label>
          <select
            name="transmissionType"
            value={formData.transmissionType}
            onChange={handleChange}
            required
          >
            <option value="Manual">Manual</option>
            <option value="Auto">Auto</option>
          </select>
        </div>
        <div className="form-group">
          <label>Engine Capacity:</label>
          <input
            type="text"
            name="engineCapacity"
            value={formData.engineCapacity}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Registration Date:</label>
          <input
            type="date"
            name="registrationDate"
            value={formData.registrationDate}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Vehicle Photo:</label>
          <input
            type="file"
            name="vehiclePhoto"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
        <button type="submit">Register Vehicle</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default VehicleRegistrationForm;