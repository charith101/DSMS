import React, { useState } from 'react';
import axios from 'axios';


export default function Attendance() {
  const [form, setForm] = useState({ student: '', classId: '', status: 'Present' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // const submit = async () => {
  //   if (!form.student || !form.classId) return alert('All fields required');
  //   await axios.post('/api/receptionist/attendance', form);
  //   alert('Attendance marked');
  //   setForm({ student: '', classId: '', status: 'Present' });
  // };

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Mark Attendance</h3>
      <div className="mb-3">
        <input
          className="form-control"
          name="student"
          value={form.student}
          onChange={handleChange}
          placeholder="Student Name"
        />
      </div>
      <div className="mb-3">
        <input
          className="form-control"
          name="classId"
          value={form.classId}
          onChange={handleChange}
          placeholder="Class ID"
        />
      </div>
      <div className="mb-3">
        <select
          className="form-select"
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          <option value="Present">Present</option>
          <option value="Late">Late</option>
          <option value="Absent">Absent</option>
        </select>
      </div>
      <button className="btn btn-primary" onClick={submit}>Submit</button>
    </div>
  );
}
