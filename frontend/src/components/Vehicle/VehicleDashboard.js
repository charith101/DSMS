import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale } from 'chart.js';
ChartJS.register(BarElement, CategoryScale, LinearScale);

export default function FuelTracking() {
  const [vehicles, setVehicles] = useState([]);
  const [vehicle, setVehicle] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState([]);

  const [form, setForm] = useState({ date:'', liters:'', cost:'', odometer:'' });
  const change = e => setForm({ ...form, [e.target.name]: e.target.value });

  useEffect(() => { axios.get('/api/vehicles').then(r => setVehicles(r.data)); }, []);

  const load = async () => {
    if (!vehicle) return;
    const L = await axios.get(`/api/fuel/${vehicle}`);
    setLogs(L.data);
    const S = await axios.get(`/api/fuel/${vehicle}/summary`, { params: { year } });
    setSummary(S.data);
  };

  useEffect(() => { load(); }, [vehicle, year]);

  const add = async () => {
    if (!vehicle) return alert('Select vehicle');
    await axios.post('/api/fuel', {
      vehicle, date: new Date(form.date), liters: Number(form.liters),
      cost: Number(form.cost), odometer: Number(form.odometer)
    });
    setForm({ date:'', liters:'', cost:'', odometer:'' });
    load();
  };

  return (
    <div>
      <h3>Fuel Tracking</h3>
      <select value={vehicle} onChange={e => setVehicle(e.target.value)}>
        <option value="">Select Vehicle</option>
        {vehicles.map(v => <option key={v._id} value={v._id}>{v.vehicleNumber}</option>)}
      </select>
      <input type="number" value={year} onChange={e => setYear(e.target.value)} placeholder="Year" />

      <div style={{ marginTop: 10 }}>
        <input type="date" name="date" value={form.date} onChange={change} />
        <input placeholder="Liters" name="liters" value={form.liters} onChange={change} type="number" />
        <input placeholder="Cost" name="cost" value={form.cost} onChange={change} type="number" />
        <input placeholder="Odometer" name="odometer" value={form.odometer} onChange={change} type="number" />
        <button onClick={add}>Add Refill</button>
      </div>

      <h4>Logs</h4>
      <table>
        <thead><tr><th>Date</th><th>Liters</th><th>Cost</th><th>Odometer</th></tr></thead>
        <tbody>
          {logs.map(l => (
            <tr key={l._id}>
              <td>{new Date(l.date).toLocaleDateString()}</td>
              <td>{l.liters}</td>
              <td>{l.cost}</td>
              <td>{l.odometer}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4>Monthly Efficiency (Km/L)</h4>
      <Bar data={{
        labels: summary.map(s => s.month),
        datasets: [{ label: 'Km/L', data: summary.map(s => s.efficiency) }]
      }} />
    </div>
  );
}
