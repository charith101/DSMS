import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, Car, Users, AlertCircle, RefreshCw } from 'lucide-react';
import InstructorNav from './InstructorNav';
import ErrorHandle from "../errorHandle";

const InstructorSchedule = () => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showPast, setShowPast] = useState(false);
  
  const userId = localStorage.getItem('userId'); // Assuming userId is stored after login

  useEffect(() => {
    if (userId) {
      fetchTimeSlots();
    } else {
      setErrorMsg("User not authenticated. Please login again.");
      setLoading(false);
    }
  }, [userId, showPast]);

  const fetchTimeSlots = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setErrorMsg("");
      setRefreshing(true);
      
      const params = new URLSearchParams();
      
      // Only add date filter for upcoming lessons if showPast is false
      if (!showPast) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        params.append('dateFrom', today.toISOString().split('T')[0]);
      }
      
      const response = await axios.get(
        `http://localhost:3001/employee/getMyTimeSlots?userId=${userId}`,
        { params }
      );
      
      setTimeSlots(response.data);
    } catch (err) {
      console.error('Error fetching time slots:', err);
      setErrorMsg(err.response?.data?.error || "Failed to fetch schedule");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour}:${minutes} ${period || ''}`;
  };

  const getCapacityBadge = (bookedCount, maxCapacity) => {
    const percentage = Math.round((bookedCount / maxCapacity) * 100);
    const badgeClass = percentage < 70 ? 'bg-success' : percentage < 90 ? 'bg-warning' : 'bg-danger';
    
    return (
      <span className={`badge ${badgeClass}`}>
        {bookedCount}/{maxCapacity} ({percentage}%)
      </span>
    );
  };

  const handleRefresh = () => {
    fetchTimeSlots();
  };

  const toggleShowPast = () => {
    setShowPast(!showPast);
  };

  const getStudentNames = (students) => {
    if (!students || students.length === 0) return 'No students';
    return students.map(s => s.name).join(', ');
  };

  const getDateDisplay = (date) => {
    const slotDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    slotDate.setHours(0, 0, 0, 0);
    
    if (slotDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (slotDate >= today) {
      return slotDate.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    } else {
      return `Past - ${slotDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })}`;
    }
  };

  const calculateDuration = (startTime, endTime) => {
    try {
      const start = new Date(`1970-01-01T${startTime}:00`);
      const end = new Date(`1970-01-01T${endTime}:00`);
      const diff = (end - start) / (1000 * 60);
      return Math.round(diff);
    } catch (error) {
      return 'N/A';
    }
  };

  // Helper function for pluralization
  const pluralize = (count, singular, plural) => {
    return count === 1 ? singular : plural;
  };

  // Group time slots by date for better organization
  const groupByDate = (slots) => {
    const grouped = {};
    slots.forEach(slot => {
      const dateKey = new Date(slot.date).toLocaleDateString('en-CA'); // YYYY-MM-DD format
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(slot);
    });

    // Sort dates: upcoming first (including today), then past
    const today = new Date().toLocaleDateString('en-CA');
    const sortedDates = Object.keys(grouped).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      const isAFutureOrToday = dateA >= new Date(today);
      const isBFutureOrToday = dateB >= new Date(today);

      if (isAFutureOrToday && isBFutureOrToday) {
        return dateA - dateB; // Sort upcoming dates ascending
      } else if (!isAFutureOrToday && !isBFutureOrToday) {
        return dateB - dateA; // Sort past dates descending
      } else {
        return isAFutureOrToday ? -1 : 1; // Upcoming before past
      }
    });

    return sortedDates.map(date => ({
      date,
      slots: grouped[date].sort((a, b) => 
        new Date(`1970-01-01T${a.startTime}:00`) - new Date(`1970-01-01T${b.startTime}:00`)
      )
    }));
  };

  const groupedSlots = groupByDate(timeSlots);

  // Separate upcoming and past slots
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingSlots = groupedSlots.filter(group => new Date(group.date) >= today);
  const pastSlots = groupedSlots.filter(group => new Date(group.date) < today);

  return (
    <div>
      {/* Navbar */}
      <InstructorNav page="schedule" />

      {/* Header Section */}
      <section
        className="text-white pb-5"
        style={{
          background: `linear-gradient(90deg, rgba(13,81,253,1) 20%, rgba(10,132,202,0.3) 100%), url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D') center/cover no-repeat`,
          marginTop: "76px",
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div className="container py-5 mt-5">
          <h1 className="fw-bold display-5 mb-3 mx-1">My Schedule</h1>
          <h6 className="fs-6 lead opacity-90">
            View all your upcoming and past driving lesson timetable
          </h6>
        </div>
      </section>

      {/* Main Content */}
      <div className="ms-auto" style={{ marginLeft: '250px', paddingTop: '40px' }}>
        <div className="py-5 bg-light">
          <div className="container">
            {/* Success and Error Messages */}
            {successMsg && (
              <div className="alert alert-success alert-dismissible fade show" role="alert">
                <AlertCircle size={20} className="me-2" />
                {successMsg}
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setSuccessMsg("")}
                  aria-label="Close"
                ></button>
              </div>
            )}

            {errorMsg && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <AlertCircle size={20} className="me-2" />
                {errorMsg}
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setErrorMsg("")}
                  aria-label="Close"
                ></button>
              </div>
            )}

            <div className="row g-4">
              {/* Toggle Control */}
              <div className="col-12">
                <div className="card border-2 shadow-sm p-3">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center justify-content-between mb-4">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="showPast"
                          checked={showPast}
                          onChange={toggleShowPast}
                        />
                        <label className="form-check-label fw-semibold" htmlFor="showPast">
                          Show past lessons
                        </label>
                      </div>
                    </div>
                    
                    <div className="border-top pt-3">
                      <small className="text-muted">
                        Showing {timeSlots.length} {pluralize(timeSlots.length, 'lesson', 'lessons')} across {groupedSlots.length} {pluralize(groupedSlots.length, 'day', 'days')}
                        {showPast ? ' (past lessons)' : ' (upcoming lessons)'}
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule Display Card */}
              <div className="col-12">
                <div className="card border-2 shadow-sm p-3">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-4">
                      <div className="bg-info bg-opacity-10 rounded-circle p-3 me-3">
                        <Calendar size={64} className="text-info" />
                      </div>
                      <div>
                        <h3 className="mb-1 fw-bold">{showPast ? 'Past Lessons' : 'Upcoming Lessons'}</h3>
                        <small className="text-muted">
                          {loading ? 'Loading...' : 
                            `${timeSlots.length} ${pluralize(timeSlots.length, 'lesson', 'lessons')} across ${groupedSlots.length} ${pluralize(groupedSlots.length, 'day', 'days')}`}
                        </small>
                      </div>
                    </div>
                    
                    {loading ? (
                      <div className="text-center py-5">
                        <RefreshCw className="animate-spin text-primary mb-3" size={64} />
                        <h5 className="text-muted">Loading your {showPast ? 'past' : 'upcoming'} schedule...</h5>
                        <p className="text-muted">Please wait while we fetch your lessons</p>
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : timeSlots.length === 0 ? (
                      <div className="text-center py-5">
                        <Calendar size={64} className="text-muted mb-4" />
                        <h5 className="text-muted mb-4">No lessons found</h5>
                        <p className="text-muted mb-4">
                          {showPast 
                            ? "You don't have any past lessons." 
                            : "No upcoming lessons found. Try showing past lessons or check with receptionist."
                          }
                        </p>
                        
                        <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center align-items-center">
                          {!showPast && (
                            <button
                              className="btn btn-outline-primary px-4 py-2 flex-fill"
                              style={{ minWidth: '180px' }}
                              onClick={toggleShowPast}
                            >
                              <Clock className="me-2" size={16} /> Show Past Lessons
                            </button>
                          )}
                          <button
                            className="btn btn-primary px-4 py-2 flex-fill"
                            style={{ minWidth: '180px' }}
                            onClick={handleRefresh}
                            disabled={refreshing}
                          >
                            {refreshing ? (
                              <>
                                <RefreshCw className="me-2 animate-spin" size={16} />
                                Refreshing...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="me-2" size={16} /> Refresh Schedule
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="schedule-container">
                        {(showPast ? pastSlots : upcomingSlots).map((dateGroup) => (
                          <div key={dateGroup.date} className="mb-4">
                            {/* Date Header */}
                            <div className="date-header mb-3 p-3 rounded bg-light border">
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center">
                                  <Calendar size={20} className="me-2 text-primary" />
                                  <div>
                                    <h5 className="mb-0 fw-bold">
                                      {getDateDisplay(dateGroup.date)}
                                    </h5>
                                    <small className="text-muted">
                                      {dateGroup.slots.length} {pluralize(dateGroup.slots.length, 'lesson', 'lessons')} scheduled
                                    </small>
                                  </div>
                                </div>
                                <span className={`badge bg-${new Date(dateGroup.date) >= today ? 'info' : 'secondary'}`}>
                                  {new Date(dateGroup.date) >= today ? 'Upcoming' : 'Past'}
                                </span>
                              </div>
                            </div>

                            {/* Lessons for this date */}
                            <div className="table-responsive">
                              <table className="table table-striped table-hover perfectly-aligned">
                                <thead className="table-light">
                                  <tr>
                                    <th scope="col" className="time-col">
                                      <div className="column-header">
                                        <Clock size={16} className="me-2 header-icon" />
                                        <span className="header-text">Time</span>
                                      </div>
                                    </th>
                                    <th scope="col" className="duration-col text-center">
                                      <div className="column-header">
                                        <Clock size={14} className="me-1 header-icon duration-icon" />
                                        <span className="header-text duration-header">Duration</span>
                                      </div>
                                    </th>
                                    <th scope="col" className="vehicle-col">
                                      <div className="column-header">
                                        <Car size={16} className="me-2 header-icon text-success" />
                                        <span className="header-text">Vehicle</span>
                                      </div>
                                    </th>
                                    <th scope="col" className="students-col">
                                      <div className="column-header">
                                        <Users size={16} className="me-2 header-icon text-info" />
                                        <span className="header-text">Students</span>
                                      </div>
                                    </th>
                                    <th scope="col" className="capacity-col text-center">
                                      <div className="column-header">
                                        <Users size={16} className="me-1 header-icon text-info" />
                                        <span className="header-text capacity-header">Capacity</span>
                                      </div>
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {dateGroup.slots.map((slot) => (
                                    <tr key={slot._id} className="align-middle">
                                      <td className="time-col">
                                        <div className="column-content">
                                          <Clock size={16} className="me-2 content-icon text-primary" />
                                          <div className="time-content">
                                            <div className="time-primary">{formatTime(slot.startTime)}</div>
                                            <div className="time-secondary">to {formatTime(slot.endTime)}</div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="duration-col text-center">
                                        <div className="column-content duration-content">
                                          <div className="duration-value">
                                            {calculateDuration(slot.startTime, slot.endTime)}m
                                          </div>
                                        </div>
                                      </td>
                                      <td className="vehicle-col">
                                        <div className="column-content">
                                          <Car size={16} className="me-2 content-icon text-success" />
                                          <div className="vehicle-content">
                                            <div className="vehicle-primary" title={slot.vehicleId?.make}>
                                              {slot.vehicleId?.make}
                                            </div>
                                            <div className="vehicle-secondary" title={`${slot.vehicleId?.model} ${slot.vehicleId?.year || ''}${slot.vehicleId?.licensePlate ? `, ${slot.vehicleId.licensePlate}` : ''}`}>
                                              {slot.vehicleId?.model || ''} {slot.vehicleId?.year || ''}
                                              {slot.vehicleId?.licensePlate && <>, {slot.vehicleId.licensePlate}</>}
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="students-col">
                                        <div className="column-content">
                                          <Users size={16} className="me-2 content-icon text-info" />
                                          <div className="students-content">
                                            {slot.bookedStudents && slot.bookedStudents.length > 0 ? (
                                              <>
                                                <div className="students-primary" title={getStudentNames(slot.bookedStudents)}>
                                                  {getStudentNames(slot.bookedStudents).substring(0, 40)}
                                                  {getStudentNames(slot.bookedStudents).length > 40 && '...'}
                                                </div>
                                                <div className="students-secondary">
                                                  {slot.bookedStudents.length} {pluralize(slot.bookedStudents.length, 'student', 'students')}
                                                </div>
                                              </>
                                            ) : (
                                              <>
                                                <div className="students-primary">No students</div>
                                                <div className="students-secondary">0 students</div>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="capacity-col text-center">
                                        <div className="column-content capacity-content">
                                          <div className="capacity-value">
                                            {getCapacityBadge(
                                              slot.bookedStudents?.length || 0, 
                                              slot.maxCapacity || 0
                                            )}
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Schedule Summary Card */}
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-light rounded-circle p-2 me-3">
                        <AlertCircle size={24} className="text-info" />
                      </div>
                      <div>
                        <h6 className="mb-1 fw-bold text-dark">Schedule Summary</h6>
                        <small className="text-muted">Quick overview of your teaching load</small>
                      </div>
                    </div>
                    
                    <div className="row text-center g-4">
                      <div className="col-md-4">
                        <div className="fw-bold text-primary fs-2">{timeSlots.length}</div>
                        <div className="text-muted">{pluralize(timeSlots.length, 'Total Lesson', 'Total Lessons')}</div>
                      </div>
                      <div className="col-md-4">
                        <div className="fw-bold text-success fs-2">
                          {showPast ? 0 : upcomingSlots.reduce((sum, group) => sum + group.slots.length, 0)}
                        </div>
                        <div className="text-muted">{pluralize(upcomingSlots.reduce((sum, group) => sum + group.slots.length, 0), 'Upcoming', 'Upcoming')}</div>
                      </div>
                      <div className="col-md-4">
                        <div className="fw-bold text-secondary fs-2">
                          {showPast ? pastSlots.reduce((sum, group) => sum + group.slots.length, 0) : 0}
                        </div>
                        <div className="text-muted">{pluralize(pastSlots.reduce((sum, group) => sum + group.slots.length, 0), 'Past', 'Past')}</div>
                      </div>
                    </div>
                    
                    <hr className="my-4" />
                    
                    <div className="row">
                      <div className="col-md-6">
                        <div className="text-muted small">
                          <h6 className="fw-bold mb-2">Lesson Guidelines</h6>
                          <ul className="mb-0 ps-3">
                            <li className="mb-1"><strong>Preparation:</strong> Arrive 15 minutes early for each lesson</li>
                            <li className="mb-1"><strong>Vehicle Check:</strong> Inspect vehicle before each session</li>
                            <li className="mb-1"><strong>Documentation:</strong> Complete logs immediately after lessons</li>
                          </ul>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="text-muted small">
                          <h6 className="fw-bold mb-2">Support</h6>
                          <ul className="mb-0 ps-3">
                            <li className="mb-1"><strong>Issues:</strong> Contact reception immediately for any problems</li>
                            <li className="mb-1"><strong>Cancellations:</strong> Notify admin 24 hours in advance</li>
                            <li><strong>Questions:</strong> Schedule availability managed by reception</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .schedule-container {
          max-height: 800px;
          overflow-y: auto;
        }
        
        .date-header {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-left: 4px solid #0d6efd;
        }
        
        .table-hover tbody tr:hover {
          background-color: rgba(13, 110, 253, 0.05);
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .form-check-input:checked {
          background-color: #0d6efd;
          border-color: #0d6efd;
        }
        
        /* Perfect table alignment */
        .perfectly-aligned {
          table-layout: fixed;
          width: 100%;
          border-collapse: collapse;
        }
        
        .perfectly-aligned th,
        .perfectly-aligned td {
          vertical-align: middle !important;
          padding: 0.75rem 0.5rem !important;
          border: 1px solid #dee2e6;
          word-wrap: break-word;
        }
        
        /* Column specific widths and alignment */
        .time-col { width: 25% !important; }
        .duration-col { width: 10% !important; text-align: center !important; }
        .vehicle-col { width: 21.66% !important; }
        .students-col { width: 21.66% !important; }
        .capacity-col { width: 21.66% !important; text-align: center !important; }
        
        /* Header styling */
        .column-header {
          display: flex;
          align-items: center;
          min-height: 2.5rem;
          justify-content: flex-start;
        }
        
        .time-col .column-header,
        .vehicle-col .column-header,
        .students-col .column-header {
          justify-content: flex-start;
        }
        
        .duration-col .column-header,
        .capacity-col .column-header {
          justify-content: center;
        }
        
        .header-icon {
          flex-shrink: 0;
          margin-right: 0.5rem !important;
        }
        
        .duration-icon {
          width: 14px !important;
          height: 14px !important;
        }
        
        .capacity-col .header-icon {
          margin-right: 0.25rem !important;
        }
        
        .header-text {
          font-size: 0.875rem;
          font-weight: 600;
          color: #495057;
          white-space: nowrap;
        }
        
        .duration-header,
        .capacity-header {
          font-size: 0.8rem;
        }
        
        /* Content styling */
        .column-content {
          display: flex;
          align-items: center;
          min-height: 3rem;
          width: 100%;
        }
        
        .time-col .column-content,
        .vehicle-col .column-content,
        .students-col .column-content {
          justify-content: flex-start;
        }
        
        .duration-col .column-content,
        .capacity-col .column-content {
          justify-content: center;
        }
        
        .content-icon {
          flex-shrink: 0;
          margin-right: 0.5rem !important;
          width: 16px !important;
          height: 16px !important;
        }
        
        /* Time column content */
        .time-content {
          flex-grow: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }
        
        .time-primary {
          font-weight: 600;
          font-size: 0.9rem;
          color: #212529;
          line-height: 1.2;
        }
        
        .time-secondary {
          font-size: 0.75rem;
          color: #6c757d;
          line-height: 1.1;
        }
        
        /* Duration column content */
        .duration-content {
          padding: 0 !important;
        }
        
        .duration-value {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 2.5rem;
          width: 100%;
          font-size: 0.95rem;
          font-weight: 700;
          color: #0d6efd;
          line-height: 1.2;
          text-align: center;
        }
        
        /* Vehicle column content */
        .vehicle-content {
          flex-grow: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }
        
        .vehicle-primary {
          font-weight: 600;
          font-size: 0.9rem;
          color: #212529;
          line-height: 1.2;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .vehicle-secondary {
          font-size: 0.75rem;
          color: #6c757d;
          line-height: 1.1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        /* Students column content */
        .students-content {
          flex-grow: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }
        
        .students-primary {
          font-weight: 500;
          font-size: 0.85rem;
          color: #212529;
          line-height: 1.2;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-height: 1.25rem;
        }
        
        .students-secondary {
          font-size: 0.7rem;
          color: #6c757d;
          line-height: 1.1;
          font-weight: 500;
        }
        
        /* Capacity column content */
        .capacity-content {
          padding: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          min-height: 2.5rem;
        }
        
        .capacity-value {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          line-height: 1.2;
        }
        
        .capacity-value .badge {
          font-size: 0.75rem;
          padding: 0.375rem 0.5rem;
          min-width: 70px;
          text-align: center;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .schedule-container {
            max-height: 600px;
          }
          
          .date-header {
            margin: -1rem -1rem 1rem -1rem;
          }
          
          .perfectly-aligned th,
          .perfectly-aligned td {
            padding: 0.5rem 0.25rem !important;
          }
          
          /* Mobile column widths */
          .time-col { width: 28% !important; }
          .duration-col { width: 8% !important; }
          .vehicle-col { width: 21.33% !important; }
          .students-col { width: 21.33% !important; }
          .capacity-col { width: 21.33% !important; }
          
          .header-text {
            font-size: 0.75rem;
          }
          
          .duration-header,
          .capacity-header {
            font-size: 0.7rem;
          }
          
          .content-icon {
            width: 14px !important;
            height: 14px !important;
            margin-right: 0.375rem !important;
          }
          
          .duration-icon {
            width: 12px !important;
            height: 12px !important;
          }
          
          .time-primary {
            font-size: 0.85rem;
          }
          
          .time-secondary,
          .vehicle-primary,
          .students-primary {
            font-size: 0.7rem;
          }
          
          .vehicle-secondary,
          .students-secondary {
            font-size: 0.65rem;
          }
          
          .duration-value {
            font-size: 0.85rem;
            min-height: 2rem;
          }
          
          .capacity-value .badge {
            font-size: 0.7rem;
            padding: 0.25rem 0.375rem;
            min-width: 60px;
          }
        }
        
        @media (max-width: 576px) {
          .perfectly-aligned th,
          .perfectly-aligned td {
            padding: 0.375rem 0.125rem !important;
          }
          
          .column-header,
          .column-content {
            min-height: 2.25rem;
          }
          
          .time-col { width: 30% !important; }
          .duration-col { width: 10% !important; }
          .vehicle-col { width: 20% !important; }
          .students-col { width: 20% !important; }
          .capacity-col { width: 20% !important; }
          
          /* Mobile button adjustments */
          .d-flex.flex-column.flex-sm-row .btn {
            min-width: 150px !important;
            margin-bottom: 0.5rem;
          }
          
          .d-flex.flex-column.flex-sm-row {
            gap: 0.75rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default InstructorSchedule;