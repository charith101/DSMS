import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function FuelChart({ refills }) {
  // Process data for monthly usage and efficiency
  const monthlyData = {};
  refills.forEach((refill, index) => {
    const monthYear = new Date(refill.date).toLocaleString('en-US', { month: 'short', year: 'numeric' });
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = { totalLiters: 0, totalDistance: 0, refillsCount: 0, firstOdometer: null, lastOdometer: null };
    }
    
    monthlyData[monthYear].totalLiters += refill.liters;
    monthlyData[monthYear].refillsCount++;

    if (monthlyData[monthYear].firstOdometer === null || refill.odometer < monthlyData[monthYear].firstOdometer) {
      monthlyData[monthYear].firstOdometer = refill.odometer;
    }
    if (monthlyData[monthYear].lastOdometer === null || refill.odometer > monthlyData[monthYear].lastOdometer) {
      monthlyData[monthYear].lastOdometer = refill.odometer;
    }

    // To calculate efficiency accurately for the month, we need the total distance covered within that month.
    // This is a simplified approach, a more robust solution would involve linking refills.
    // For now, let's just sum liters and approximate distance.
    if (index > 0 && new Date(refill.date).getMonth() === new Date(refills[index-1].date).getMonth()) {
        monthlyData[monthYear].totalDistance += (refill.odometer - refills[index-1].odometer);
    }
  });

  const labels = Object.keys(monthlyData).sort((a, b) => new Date(a) - new Date(b));
  const litersPerMonth = labels.map(label => monthlyData[label].totalLiters.toFixed(2));
  const efficiencyPerMonth = labels.map(label => {
    const data = monthlyData[label];
    const totalDistance = data.lastOdometer - data.firstOdometer;
    if (totalDistance > 0 && data.totalLiters > 0) {
      return (totalDistance / data.totalLiters).toFixed(2);
    }
    return 0; // or 'N/A'
  });

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Liters Used per Month',
        data: litersPerMonth,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        yAxisID: 'y',
      },
      {
        label: 'Efficiency (Km/L) per Month',
        data: efficiencyPerMonth,
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: 'Monthly Fuel Usage and Efficiency',
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Liters Used',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Efficiency (Km/L)',
        },
      },
    },
  };

  return (
    <div className="fuel-chart-container">
      <h3>Monthly Fuel Trends</h3>
      <Line data={data} options={options} />
    </div>
  );
}

export default FuelChart;