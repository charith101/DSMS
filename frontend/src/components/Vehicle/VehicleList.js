import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './VehicleList.css'; // Assume basic styling

const VehicleList = ({ refreshTrigger }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/vehicles');
      setVehicles(response.data);
    } catch (err) {
      setError('Failed to fetch vehicles: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [refreshTrigger]); // Re-fetch when refreshTrigger changes (e.g., after new vehicle added)

  if (loading) return <p>Loading vehicles...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="vehicle-list-container">
      <h2>Registered Vehicles</h2>
      {vehicles.length === 0 ? (
        <p>No vehicles registered yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Vehicle No.</th>
              <th>Make/Model/Year</th>
              <th>Transmission</th>
              <th>Engine</th>
              <th>Reg. Date</th>
              <th>Photo</th>
              <th>Status</th>
              {/* Add more columns as needed */}
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle._id}>
                <td>{vehicle.vehicleNumber}</td>
                <td>{vehicle.makeModelYear}</td>
                <td>{vehicle.transmissionType}</td>
                <td>{vehicle.engineCapacity}</td>
                <td>{new Date(vehicle.registrationDate).toLocaleDateString()}</td>
                <td>
                  {vehicle.vehiclePhoto ? (
                    <img
                      src={`http://localhost:5000/${vehicle.vehiclePhoto}`} // Assumes backend serves static files
                      alt="Vehicle"
                      className="vehicle-thumbnail"
                    />
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>{vehicle.isAvailable ? 'Available' : 'Assigned'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default VehicleList;