import React, { useState, useEffect } from 'react';
// import Navbar from './Navbar';
import ThemeToggle from './ThemeToggle';
import AnnouncementBanner from './AnnouncementBanner';
import ChatBot from './ChatBot';
import ClassTimetable from './ClassTimetable';
// import Appointments from './Appointments';
import RescheduleClass from './RescheduleClass';
import Attendance from './Attendance';
import QRScanner from './QRScanner';
import CalendarScheduler from './CalendarScheduler';
import DashboardChart from './DashboardChart';
import Notifications from './Notifications';
import StudentHistory from './StudentHistory';


export default function Dashboard({ theme, toggleTheme }) {
  const [view, setView] = useState('timetable');

  const renderComponent = () => {
    switch (view) {
      // case 'appointments': return <Appointments />;
      case 'reschedule': return <RescheduleClass />;
      case 'attendance': return <Attendance />;
      case 'scanner': return <QRScanner />;
      case 'calendar': return <CalendarScheduler />;
      case 'chart': return <DashboardChart />;
      case 'notifications': return <Notifications />;
      case 'studentHistory': return <StudentHistory />;
      default: return <ClassTimetable />;
    }
  };

  // Auto logout (10 mins)
  useEffect(() => {
    let timer = setTimeout(() => {
      alert("Logged out due to inactivity");
      window.location.reload();
    }, 10 * 60 * 1000);

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        alert("Logged out due to inactivity");
        window.location.reload();
      }, 10 * 60 * 1000);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      <AnnouncementBanner />
      {/* <Navbar /> */}
      <div className="d-flex justify-content-end p-2">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>
      <ChatBot onCommand={setView} />

      <div className="container-fluid mt-3">
        <div className="row">
          {/* Sidebar */}
          <aside className="col-md-3 col-lg-2 bg-light p-3 border rounded">
            <div className="d-grid gap-2">
              <button className="btn btn-outline-primary" onClick={() => setView('timetable')}>📅 Timetable</button>
              <button className="btn btn-outline-primary" onClick={() => setView('appointments')}>📋 Appointments</button>
              <button className="btn btn-outline-primary" onClick={() => setView('reschedule')}>🔁 Reschedule</button>
              <button className="btn btn-outline-primary" onClick={() => setView('attendance')}>✅ Attendance</button>
              <button className="btn btn-outline-primary" onClick={() => setView('scanner')}>📷 QR Scanner</button>
              <button className="btn btn-outline-primary" onClick={() => setView('calendar')}>📆 Calendar</button>
              <button className="btn btn-outline-primary" onClick={() => setView('chart')}>📊 Stats</button>
              <button className="btn btn-outline-primary" onClick={() => setView('studentHistory')}>🧍 History</button>
              <button className="btn btn-outline-primary" onClick={() => setView('notifications')}>🔔 Notifications</button>
            </div>
          </aside>

          {/* Main content */}
          <main className="col-md-9 col-lg-10 mt-3 mt-md-0">
            <div className="card p-3 shadow-sm">
              {renderComponent()}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
