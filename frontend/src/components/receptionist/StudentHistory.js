import React, { useState } from 'react';
import axios from 'axios';


export default function StudentHistory() {
  const [name, setName] = useState('');
  const [records, setRecords] = useState([]);

  // const search = async () => {
  //   const res = await axios.get(`/api/receptionist/student/${name}/history`);
  //   setRecords(res.data);
  // };

  return (
    <div className="container mt-4">
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Enter Student Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <button className="btn btn-primary mb-4" onClick={search}>Search</button>

      {records.length > 0 && (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="thead-dark">
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Instructor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r._id}>
                  <td>{new Date(r.date).toLocaleDateString()}</td>
                  <td>{r.timeSlot}</td>
                  <td>{r.instructor}</td>
                  <td>{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
