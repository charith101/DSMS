import React, { useEffect, useState } from 'react';
import axios from 'axios';


export default function ClassTimetable() {
  const [classes, setClasses] = useState([]);

  // useEffect(() => {
  //   axios.get('/api/receptionist/classes').then(res => setClasses(res.data));
  // }, []);

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Class Timetable</h3>
      <table className="table table-striped table-bordered">
        <thead className="thead-dark">
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Instructor</th>
            <th>Student</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {classes.map(cls => (
            <tr key={cls._id}>
              <td>{new Date(cls.date).toLocaleDateString()}</td>
              <td>{cls.timeSlot}</td>
              <td>{cls.instructor}</td>
              <td>{cls.student}</td>
              <td>{cls.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
