import React, { useEffect, useState } from 'react';
import axios from 'axios';


export default function RescheduleClass() {
  const [classes, setClasses] = useState([]);

  // useEffect(() => {
  //   axios.get('/api/receptionist/classes').then(res => setClasses(res.data));
  // }, []);

  // const reschedule = async (id) => {
  //   const newDate = prompt('Enter new date (YYYY-MM-DD)');
  //   const newTime = prompt('Enter new time slot');
  //   await axios.put(`/api/receptionist/class/${id}/reschedule`, { date: newDate, timeSlot: newTime });
  //   alert('Rescheduled');
  // };

  // const cancel = async (id) => {
  //   await axios.put(`/api/receptionist/class/${id}/cancel`);
  //   alert('Cancelled');
  // };

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Manage Scheduled Classes</h3>
      <table className="table table-striped table-bordered">
        <thead className="thead-dark">
          <tr>
            <th>Student</th>
            <th>Time</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {classes.map(cls => (
            <tr key={cls._id}>
              <td>{cls.student}</td>
              <td>{cls.timeSlot}</td>
              <td>{new Date(cls.date).toLocaleDateString()}</td>
              <td>
                <button
                  className="btn btn-sm btn-primary me-2"
                  onClick={() => reschedule(cls._id)}
                >
                  Reschedule
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => cancel(cls._id)}
                >
                  Cancel
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
