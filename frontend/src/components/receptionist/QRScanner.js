import React, { useState } from 'react';
import QrReader from 'react-qr-reader';
import axios from 'axios';


export default function QRScanner() {
  const [result, setResult] = useState('');

  // const handleScan = async (data) => {
  //   if (data) {
  //     const parsed = JSON.parse(data);
  //     setResult(`Student: ${parsed.studentId}, Class: ${parsed.classId}`);
  //     await axios.post('/api/receptionist/attendance', {
  //       student: parsed.studentId,
  //       classId: parsed.classId,
  //       status: 'Present'
  //     });
  //     alert("Attendance marked via QR!");
  //   }
  // };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4">
        <h3 className="mb-4 text-center">Scan Student QR Code</h3>
        <div className="d-flex justify-content-center mb-3">
          <QrReader
            onScan={handleScan}
            onError={(err) => console.error(err)}
            style={{ width: '300px' }}
          />
        </div>
        <p className="text-center text-success fw-bold">{result}</p>
      </div>
    </div>
  );
}
