import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import dayGrid from '@fullcalendar/daygrid';
import interaction from '@fullcalendar/interaction';

export default function MaintenanceCalendar() {
  const [events, setEvents] = useState([]);
  const [upcoming, setUpcoming] = useState([]);

  const load = async (start, end) => {
    const res = await axios.get('/api/maintenance', { params: { from: start.toISOString(), to: end.toISOString() }});
    setEvents(res.data.map(m => ({ id: m._id, title: `${m.title} (${m.vehicle?.vehicleNumber})`, start: m.date })));
    const rem = await axios.get('/api/maintenance/reminders/upcoming');
    setUpcoming(rem.data);
  };

  return (
    <div>
      <h3>Maintenance Scheduler</h3>
      <FullCalendar
        plugins={[dayGrid, interaction]}
        initialView="dayGridMonth"
        datesSet={(info) => load(info.start, info.end)}
        events={events}
      />
      <h4>Upcoming (7 days)</h4>
      <ul>
        {upcoming.map(u => (
          <li key={u._id}>
            {u.title} - {u.vehicle?.vehicleNumber} on {new Date(u.date).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
