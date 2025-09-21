import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MaintenanceHistory.css'; // Basic styling

const MaintenanceHistory = () => {
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [upcomingAlerts, setUpcomingAlerts] = useState([]);
  const [pastHistory, setPastHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMaintenanceRecords();
  }, []);

  const fetchMaintenanceRecords = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/maintenance');
      const records = response.data;

      const now = new Date();
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(now.getDate() + 7);

      const alerts = records.filter(
        (maint) =>
          new Date(maint.scheduledDate) > now &&
          new Date(maint.scheduledDate) <= oneWeekFromNow &&
          maint.status === 'Scheduled'
      );

      const history = records.filter(
        (maint) => maint.status === 'Completed' || new Date(maint.scheduledDate) < now
      );

      setUpcomingAlerts(alerts.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate)));
      setPastHistory(history.sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate))); // Latest first
      setMaintenanceRecords(records);
    } catch (err) {
      setError('Failed to fetch maintenance records: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading maintenance records...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="maintenance-history-container">
      <h2>Maintenance Overview</h2>

      <div className="alerts-section">
        <h3>Upcoming Maintenance Alerts (Next 7 Days)</h3>
        {upcomingAlerts.length === 0 ? (
          <p>No upcoming maintenance alerts.</p>
        ) : (
          <ul>
            {upcomingAlerts.map((alert) => (
              <li key={alert._id} className="alert-item">
                <strong>{alert.vehicle.vehicleNumber}</strong> - {alert.task} on{' '}
                {new Date(alert.scheduledDate).toLocaleDateString()}
                <span className="due-status"> (Due in {Math.ceil((new Date(alert.scheduledDate) - new Date()) / (1000 * 60 * 60 * 24))} days)</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="history-section">
        <h3>Past Maintenance & Repair History</h3>
        {pastHistory.length === 0 ? (
          <p>No past maintenance records.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Vehicle No.</th>
                <th>Task</th>
                <th>Scheduled Date</th>
                <th>Status</th>
                <th>Cost</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {pastHistory.map((record) => (
                <tr key={record._id}>
                  <td>{record.vehicle.vehicleNumber}</td>
                  <td>{record.task}</td>
                  <td>{new Date(record.scheduledDate).toLocaleDateString()}</td>
                  <td>{record.status}</td>
                  <td>{record.cost ? `AED ${record.cost.toFixed(2)}` : 'N/A'}</td>
                  <td>{record.notes || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MaintenanceHistory;