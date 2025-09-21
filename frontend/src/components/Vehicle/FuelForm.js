import React, { useState } from 'react';

function FuelForm({ onAddRefill }) {
  const [date, setDate] = useState('');
  const [cost, setCost] = useState('');
  const [liters, setLiters] = useState('');
  const [odometer, setOdometer] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newRefill = {
      id: Date.now(), // Simple unique ID
      date,
      cost: parseFloat(cost),
      liters: parseFloat(liters),
      odometer: parseInt(odometer),
    };
    onAddRefill(newRefill);
    // Clear form
    setDate('');
    setCost('');
        setLiters('');
    setOdometer('');
  };

  return (
    <form onSubmit={handleSubmit} className="fuel-form">
      <h3>Log New Fuel Refill</h3>
      <label>
        Date:
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </label>
      <label>
        Cost (€):
        <input type="number" value={cost} onChange={(e) => setCost(e.target.value)} required step="0.01" />
      </label>
      <label>
        Liters:
        <input type="number" value={liters} onChange={(e) => setLiters(e.target.value)} required step="0.01" />
      </label>
      <label>
        Odometer Reading (Km):
        <input type="number" value={odometer} onChange={(e) => setOdometer(e.target.value)} required />
      </label>
      <button type="submit">Add Refill</button>
    </form>
  );
}

export default FuelForm;