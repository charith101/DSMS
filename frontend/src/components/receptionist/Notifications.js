import React, { useEffect, useState } from 'react';
import axios from 'axios';


export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  // useEffect(() => {
  //   axios.get('/api/receptionist/notifications').then(res => setNotifications(res.data));
  // }, []);

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Receptionist Notifications</h3>
      <ul className="list-group">
        {notifications.map(note => (
          <li key={note._id} className="list-group-item d-flex justify-content-between align-items-center">
            {note.message}
            <span className="text-muted small">{new Date(note.createdAt).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
