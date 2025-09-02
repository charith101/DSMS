import React, { useState } from 'react';
import axios from 'axios';

export default function VehicleForm({ onSaved }) {
  const [form, setForm] = useState({
    vehicleNumber: '',
    make: '', model: '', year: '', transmission: 'Manual',
    engineCC: '', registrationDate: ''
  });
  const [photo, setPhoto] = useState(null);

  const change = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    const fd = new FormData();
    fd.append('data', JSON.stringify({
      ...form,
      year: Number(form.year),
      engineCC: Number(form.engineCC),
      registrationDate: new Date(form.registrationDate)
    }));
    if (photo) fd.append('photo', photo);
    await axios.post('/api/vehicles', fd, { headers: { 'Content-Type': 'multipart/form-data' }});
    alert('Vehicle registered');
    setForm({ vehicleNumber:'', make:'', model:'', year:'', transmission:'Manual', engineCC:'', registrationDate:'' });
    setPhoto(null);
    onSaved?.();
  };

  return (
    <div>
      <h3>Register Vehicle</h3>
      <input placeholder="Vehicle Number" name="vehicleNumber" value={form.vehicleNumber} onChange={change} />
      <input placeholder="Make" name="make" value={form.make} onChange={change} />
      <input placeholder="Model" name="model" value={form.model} onChange={change} />
      <input placeholder="Year" name="year" value={form.year} onChange={change} type="number" />
      <select name="transmission" value={form.transmission} onChange={change}>
        <option>Manual</option><option>Auto</option>
      </select>
      <input placeholder="Engine CC" name="engineCC" value={form.engineCC} onChange={change} type="number" />
      <input name="registrationDate" value={form.registrationDate} onChange={change} type="date" />
      <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0])} />
      <button onClick={submit}>Save</button>
    </div>
  );
}
