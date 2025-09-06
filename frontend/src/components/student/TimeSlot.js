import React, { useState, useEffect } from 'react';
import StudentNav from "./StudentNav";
import { Clock, Calendar } from "lucide-react";
import axios from 'axios';

function TimeSlot() {
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentLevel, setStudentLevel] = useState(null);
  const [alert, setAlert] = useState(null);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, availableRes, selectedRes] = await Promise.all([
          axios.get(`http://localhost:3001/student/getUser/${userId}`),
          axios.get(`http://localhost:3001/student/getAvailableTimeSlots/${userId}`),
          axios.get(`http://localhost:3001/student/getStudentTimeSlots/${userId}`)
        ]);
        setStudentLevel(userRes.data.level);
        setAvailableTimeSlots(availableRes.data);
        setSelectedTimeSlots(selectedRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchData();
  }, [userId]);

  const handleSelectSlot = async (slotId) => {
    try {
      await axios.post(`http://localhost:3001/student/bookTimeSlot/${slotId}`, { studentId: userId });
      const updatedAvailable = availableTimeSlots.filter(slot => slot._id !== slotId);
      const newSelectedSlot = availableTimeSlots.find(slot => slot._id === slotId);
      setAvailableTimeSlots(updatedAvailable);
      setSelectedTimeSlots([...selectedTimeSlots, newSelectedSlot]);
      setAlert({ type: 'success', message: 'Time slot booked successfully!' });
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      console.error('Error booking slot:', err);
      setAlert({ type: 'danger', message: 'Failed to book time slot.' });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleCancelSlot = async (slotId) => {
    try {
      await axios.post(`http://localhost:3001/student/cancelTimeSlot/${slotId}`, { studentId: userId });
      const updatedSelected = selectedTimeSlots.filter(slot => slot._id !== slotId);
      const canceledSlot = selectedTimeSlots.find(slot => slot._id === slotId);
      setSelectedTimeSlots(updatedSelected);
      setAvailableTimeSlots([...availableTimeSlots, canceledSlot]);
      setAlert({ type: 'success', message: 'Time slot canceled successfully!' });
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      console.error('Error canceling slot:', err);
      setAlert({ type: 'danger', message: 'Failed to cancel time slot.' });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  if (loading) {
    return (
      <div 
        className="d-flex justify-content-center align-items-center position-fixed top-0 start-0 w-100 vh-100 bg-white bg-opacity-100"
        style={{ zIndex: 2000 }}
      >
        <div
          className="spinner-border text-primary"
          style={{ width: "4rem", height: "4rem" }}
          role="status"
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (studentLevel === 1) {
    return (
      <div>
        <StudentNav page="timeslot"/>
        <section
          className="text-white pb-5"
          style={{
            background: `linear-gradient(90deg, rgba(13,81,253,1) 20%, rgba(10,132,202,0.3) 100%), url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D') center/cover no-repeat`,
            marginTop: "76px",
            minHeight: "50vh",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div className="container py-5">
            <h1 className="fw-bold display-5 mb-3 mx-1">Select Your Time Slots</h1>
            <h6 className="fs-6 lead opacity-90">
              Choose your preferred practice slots with instructors from the available options below.
            </h6>
          </div>
        </section>
        <div className="py-5 bg-light">
          <div className="container">
            <div className="alert alert-warning fs-4" role="alert">
              Please get your learners permit in order to select time slots for training.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <StudentNav page="timeslot"/>
      <section
        className="text-white pb-5"
        style={{
          background: `linear-gradient(90deg, rgba(13,81,253,1) 20%, rgba(10,132,202,0.3) 100%), url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D') center/cover no-repeat`,
          marginTop: "76px",
          minHeight: "65vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div className="container py-5">
          <h1 className="fw-bold display-5 mb-3 mx-1">Select Your Time Slots</h1>
          <h6 className="fs-6 lead opacity-90">
            Choose your preferred practice slots with instructors from the available options below.
          </h6>
        </div>
      </section>

      <div className="py-5 bg-light">
        <div className="container">
          {alert && (
            <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
              {alert.message}
              <button
                type="button"
                className="btn-close"
                onClick={() => setAlert(null)}
                aria-label="Close"
              ></button>
            </div>
          )}
          <div className="row g-4">
            {/* Available Time Slots */}
            <div className="col-12">
              <div className="card border-2 shadow-sm p-3">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                      <Clock size={64} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="mb-1 fw-bold">Available Time Slots</h3>
                      <small className="text-muted">Select your preferred practice slots</small>
                    </div>
                  </div>
                  <div className="d-flex flex-column gap-2">
                    {availableTimeSlots.map(slot => (
                      <div key={slot._id} className="bg-light border-2 border rounded-3 p-3">
                        <div className="d-flex flex-column gap-2">
                          <div><strong>Date:</strong> {new Date(slot.date).toLocaleDateString()}</div>
                          <div><strong>Time:</strong> {slot.startTime} – {slot.endTime}</div>
                          <div><strong>Instructor:</strong> {slot.instructorId.name}</div>
                          <div><strong>Vehicle:</strong> {slot.vehicleId.model} ({slot.vehicleId.type})</div>
                          <div><strong>Available Spots:</strong> {slot.maxCapacity - slot.bookedStudents.length}</div>
                          <button
                            className="btn btn-primary mt-2"
                            onClick={() => handleSelectSlot(slot._id)}
                          >
                            Select Slot
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Time Slots */}
            <div className="col-12">
              <div className="card border-2 shadow-sm p-3">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">
                      <Calendar size={64} className="text-success" />
                    </div>
                    <div>
                      <h3 className="mb-1 fw-bold">Your Selected Time Slots</h3>
                      <small className="text-muted">Your confirmed practice slots</small>
                    </div>
                  </div>
                  <div className="d-flex flex-column gap-2">
                    {selectedTimeSlots.map(slot => (
                      <div key={slot._id} className="bg-success bg-opacity-10 border-2 border rounded-3 p-3">
                        <div className="d-flex flex-column gap-2">
                          <div><strong>Date:</strong> {new Date(slot.date).toLocaleDateString()}</div>
                          <div><strong>Time:</strong> {slot.startTime} – {slot.endTime}</div>
                          <div><strong>Instructor:</strong> {slot.instructorId.name}</div>
                          <div><strong>Vehicle:</strong> {slot.vehicleId.model} ({slot.vehicleId.type})</div>
                          <button
                            className="btn btn-outline-danger mt-2"
                            onClick={() => handleCancelSlot(slot._id)}
                          >
                            Cancel Slot
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TimeSlot;