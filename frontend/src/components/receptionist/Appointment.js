import React, { useEffect, useState } from 'react';
import axios from 'axios';


export default function Appointments() {
  const [appointments, setAppointments] = useState([]);

  // useEffect(() => {
  //   axios.get('/api/receptionist/appointments').then(res => setAppointments(res.data));
  // }, []);

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Online Appointment Requests</h3>
      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th>Student</th>
            <th>Instructor</th>
            <th>Time Slot</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map(app => (
            <tr key={app._id}>
              <td>{app.studentName}</td>
              <td>{app.instructorName}</td>
              <td>{app.timeSlot}</td>
              <td>{new Date(app.date).toLocaleDateString()}</td>
              <td>{app.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
