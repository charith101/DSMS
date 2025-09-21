import React from 'react';

function FuelTable({ refills }) {
  const calculateEfficiency = (index) => {
    if (index === 0 || !refills[index - 1]) return 'N/A'; // Cannot calculate for the first entry

    const currentRefill = refills[index];
    const previousRefill = refills[index - 1];

    const distance = currentRefill.odometer - previousRefill.odometer;
    const litersUsed = currentRefill.liters; // Assuming liters logged are for the distance *since last refill*

    if (distance <= 0 || litersUsed <= 0) return 'N/A';
    return (distance / litersUsed).toFixed(2) + ' Km/L';
  };

  return (
    <div className="fuel-table-container">
      <h3>Fuel Refill History</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Cost (€)</th>
            <th>Liters</th>
            <th>Odometer (Km)</th>
            <th>Efficiency (Km/L)</th>
          </tr>
        </thead>
        <tbody>
          {refills.map((refill, index) => (
            <tr key={refill.id}>
              <td>{refill.date}</td>
              <td>{refill.cost.toFixed(2)}</td>
              <td>{refill.liters.toFixed(2)}</td>
              <td>{refill.odometer}</td>
              <td>{calculateEfficiency(index)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FuelTable;