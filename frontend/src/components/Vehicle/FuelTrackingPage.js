import React, { useState, useEffect } from 'react';
import FuelForm from '../components/FuelForm';
import FuelTable from '../components/FuelTable';
import FuelChart from '../components/FuelChart';

function FuelTrackingPage() {
  const [fuelRefills, setFuelRefills] = useState([]);

  // Load from local storage on mount
  useEffect(() => {
    const storedRefills = JSON.parse(localStorage.getItem('fuelRefills'));
    if (storedRefills) {
      setFuelRefills(storedRefills.sort((a, b) => new Date(a.date) - new Date(b.date)));
    }
  }, []);

  // Save to local storage whenever fuelRefills changes
  useEffect(() => {
    localStorage.setItem('fuelRefills', JSON.stringify(fuelRefills));
  }, [fuelRefills]);

  const addRefill = (newRefill) => {
    setFuelRefills((prevRefills) =>
      [...prevRefills, newRefill].sort((a, b) => new Date(a.date) - new Date(b.date))
    );
  };

  return (
    <div className="fuel-tracking-page">
      <h2>Fuel Tracking</h2>
      <FuelForm onAddRefill={addRefill} />
      <FuelTable refills={fuelRefills} />
      {fuelRefills.length > 1 && <FuelChart refills={fuelRefills} />}
    </div>
  );
}

export default FuelTrackingPage;