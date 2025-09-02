import React, { useEffect, useState } from 'react';
// import { Bar } from 'react-chartjs-2';
import axios from 'axios';


export default function DashboardChart() {
  const [data, setData] = useState({
    labels: [],
    datasets: [{
      label: 'Attendance Count',
      data: [],
      backgroundColor: 'rgba(75, 192, 192, 0.6)'
    }]
  });

  // useEffect(() => {
  //   axios.get('/api/receptionist/attendance-summary').then(res => {
  //     setData({
  //       labels: res.data.map(item => item.date),
  //       datasets: [{
  //         label: 'Attendance Count',
  //         data: res.data.map(item => item.count),
  //         backgroundColor: 'rgba(75, 192, 192, 0.6)'
  //       }]
  //     });
  //   });
  // }, []);

  return (
    <div className="container my-4">
      <div className="card shadow-sm">
        <div className="card-body">
          <h3 className="card-title text-center mb-4">Attendance Overview</h3>
          <div className="chart-container" style={{ position: 'relative', height: '50vh' }}>
            {/* <Bar data={data} /> */}
          </div>
        </div>
      </div>
    </div>
  );
}
