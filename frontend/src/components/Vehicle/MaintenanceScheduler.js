import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; // For dateClick, eventClick
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './MaintenanceScheduler.css'; // Basic styling for modal

const MaintenanceScheduler = () => {
  const [events, setEvents] = useState([]); // Calendar events
  const [vehicles, setVehicles] = useState([]); // List of vehicles for dropdown
  const [showModal, setShowModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null); // For editing
  const [formData, setFormData] = useState({
    vehicleId: '',
    task: '',
    scheduledDate: new Date(),
    status: 'Scheduled',
    cost: '',
    notes: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMaintenanceAndVehicles();
  }, []);

  const fetchMaintenanceAndVehicles = async () => {
    try {
      const [maintenanceRes, vehiclesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/maintenance'),
        axios.get('http://localhost:5000/api/vehicles')
      ]);

      setVehicles(vehiclesRes.data);
      const calendarEvents = maintenanceRes.data.map(maint => ({
        id: maint._id,
        title: `${maint.vehicle.vehicleNumber} - ${maint.task}`,
        start: new Date(maint.scheduledDate),
        allDay: true, // or false if you add time
        backgroundColor: maint.status === 'Completed' ? 'green' : (maint.scheduledDate < new Date() && maint.status === 'Scheduled' ? 'red' : 'blue'),
        extendedProps: { ...maint } // Store full maintenance object
      }));
      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage('Failed to load maintenance or vehicles.');
    }
  };

  const handleDateClick = (arg) => {
    // Open modal to add new maintenance for this date
    setFormData({
      vehicleId: '',
      task: '',
      scheduledDate: arg.date,
      status: 'Scheduled',
      cost: '',
      notes: ''
    });
    setCurrentEvent(null);
    setShowModal(true);
  };

  const handleEventClick = (arg) => {
    // Open modal to view/edit existing maintenance
    const maint = arg.event.extendedProps;
    setFormData({
      vehicleId: maint.vehicle._id,
      task: maint.task,
      scheduledDate: new Date(maint.scheduledDate),
      status: maint.status,
      cost: maint.cost || '',
      notes: maint.notes || ''
    });
    setCurrentEvent(maint);
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({ ...prev, scheduledDate: date }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      if (currentEvent) {
        // Update existing
        await axios.put(`http://localhost:5000/api/maintenance/${currentEvent._id}`, formData);
        setMessage('Maintenance updated successfully!');
      } else {
        // Add new
        await axios.post('http://localhost:5000/api/maintenance', formData);
        setMessage('Maintenance scheduled successfully!');
      }
      setShowModal(false);
      fetchMaintenanceAndVehicles(); // Refresh calendar
    } catch (error) {
      setMessage('Error saving maintenance: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="maintenance-scheduler-container">
      <h2>Maintenance Scheduler</h2>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        height="700px"
      />

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{currentEvent ? 'Edit Maintenance' : 'Schedule New Maintenance'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Vehicle:</label>
                <select
                  name="vehicleId"
                  value={formData.vehicleId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.vehicleNumber} - {v.makeModelYear}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Task:</label>
                <input
                  type="text"
                  name="task"
                  value={formData.task}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Scheduled Date:</label>
                <DatePicker
                  selected={formData.scheduledDate}
                  onChange={handleDateChange}
                  dateFormat="yyyy/MM/dd"
                  required
                />
              </div>
              <div className="form-group">
                <label>Status:</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Canceled">Canceled</option>
                </select>
              </div>
              {formData.status === 'Completed' && (
                <div className="form-group">
                  <label>Cost:</label>
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleChange}
                  />
                </div>
              )}
              <div className="form-group">
                <label>Notes:</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                ></textarea>
              </div>
              <button type="submit">{currentEvent ? 'Update' : 'Schedule'}</button>
              <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
            </form>
            {message && <p className="message">{message}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceScheduler;