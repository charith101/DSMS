import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function DocumentManager() {
  const [vehicles, setVehicles] = useState([]);
  const [vehicle, setVehicle] = useState('');
  const [docs, setDocs] = useState([]);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ type:'Insurance', issueDate:'', expiryDate:'', notes:'' });
  const [expiring, setExpiring] = useState([]);

  useEffect(() => { axios.get('/api/vehicles').then(r => setVehicles(r.data)); }, []);
  const load = () => vehicle && axios.get(`/api/documents/${vehicle}`).then(r => setDocs(r.data));
  useEffect(() => { load(); }, [vehicle]);

  useEffect(() => { axios.get('/api/documents/reminders/expiring').then(r => setExpiring(r.data)); }, []);

  const upload = async () => {
    if (!vehicle || !file) return alert('Select vehicle and file');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('data', JSON.stringify({
      vehicle, type: form.type,
      issueDate: form.issueDate ? new Date(form.issueDate) : null,
      expiryDate: form.expiryDate ? new Date(form.expiryDate) : null,
      notes: form.notes
    }));
    await axios.post('/api/documents', fd);
    setFile(null); setForm({ type:'Insurance', issueDate:'', expiryDate:'', notes:'' });
    load();
  };

  return (
    <div>
      <h3>Vehicle Documents</h3>
      <select value={vehicle} onChange={e => setVehicle(e.target.value)}>
        <option value="">Select Vehicle</option>
        {vehicles.map(v => <option key={v._id} value={v._id}>{v.vehicleNumber}</option>)}
      </select>

      <div style={{ marginTop: 10 }}>
        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
          <option>Registration</option><option>Insurance</option><option>Emission</option><option>Permit</option>
        </select>
        <input type="date" value={form.issueDate} onChange={e => setForm({ ...form, issueDate: e.target.value })} />
        <input type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} />
        <input placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        <input type="file" onChange={e => setFile(e.target.files?.[0])} />
        <button onClick={upload}>Upload</button>
      </div>

      <h4>Documents</h4>
      <ul>
        {docs.map(d => (
          <li key={d._id}>
            [{d.type}] {d.fileUrl} — Exp: {d.expiryDate ? new Date(d.expiryDate).toLocaleDateString() : 'N/A'}
          </li>
        ))}
      </ul>

      <h4>Expiring in 30 days</h4>
      <ul>
        {expiring.map(e => (
          <li key={e._id}>
            {e.vehicle?.vehicleNumber} — {e.type} expires on {new Date(e.expiryDate).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
