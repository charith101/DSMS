import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from "@fullcalendar/interaction";
import axios from 'axios';


export default function CalendarScheduler() {
  const [events, setEvents] = useState([]);

  // useEffect(() => {
  //   axios.get('/api/receptionist/classes').then(res => {
  //     const transformed = res.data.map(cls => ({
  //       id: cls._id,
  //       title: cls.student,
  //       start: cls.date
  //     }));
  //     setEvents(transformed);
  //   });
  // }, []);

  // const handleDateChange = async (info) => {
  //   await axios.put(`/api/receptionist/class/${info.event.id}/reschedule`, {
  //     date: info.event.start
  //   });
  //   alert('Class rescheduled!');
  // };

  return (
    <div className="container mt-5">
      <div className="card shadow">
        <div className="card-body">
          <h3 className="card-title mb-4">Class Schedule</h3>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            editable={true}
            eventDrop={handleDateChange}
          />
        </div>
      </div>
    </div>
  );
}
