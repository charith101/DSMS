import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AssignmentDashboard() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));
  const [vehicles, setVehicles] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [form, setForm] = useState({ vehicle:'', instructor:'', student:'', timeSlot:'09:00-10:00' });

  useEffect(() => { axios.get('/api/vehicles').then(r => setVehicles(r.data)); }, []);
  const loadAssigned = () => axios.get('/api/assignments/availability', { params: { date } }).then(r => setAssigned(r.data));
  useEffect(() => { loadAssigned(); }, [date]);

  const submit = async () => {
    try {
      await axios.post('/api/assignments', { ...form, date });
      alert('Assigned');
      setForm({ vehicle:'', instructor:'', student:'', timeSlot:'09:00-10:00' });
      loadAssigned();
    } catch (e) {
      alert(e.response?.data?.error || 'Error');
    }
  };

  const assignedIds = new Set(assigned.map(a => a.vehicle?._id + '|' + a.timeSlot));
  return (
    <div>
      <h3>Vehicle Availability & Assignment</h3>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      <div style={{ marginTop: 10 }}>
        <select value={form.vehicle} onChange={e => setForm({ ...form, vehicle: e.target.value })}>
          <option value="">Select Vehicle</option>
          {vehicles.map(v => (
            <option key={v._id} value={v._id} disabled={assignedIds.has(v._id + '|' + form.timeSlot)}>
              {v.vehicleNumber} ({v.make} {v.model})
            </option>
          ))}
        </select>
        <input placeholder="Instructor" value={form.instructor} onChange={e => setForm({ ...form, instructor: e.target.value })}/>
        <input placeholder="Student" value={form.student} onChange={e => setForm({ ...form, student: e.target.value })}/>
        <input placeholder="Time Slot e.g. 09:00-10:00" value={form.timeSlot} onChange={e => setForm({ ...form, timeSlot: e.target.value })}/>
        <button onClick={submit}>Assign</button>
      </div>

      <h4>Assigned (Selected Date)</h4>
      <ul>
        {assigned.map(a => (
          <li key={a._id}>
            {a.vehicle?.vehicleNumber} → {a.student} ({a.instructor}) @ {a.timeSlot}
          </li>
        ))}
      </ul>
    </div>
  );
}
