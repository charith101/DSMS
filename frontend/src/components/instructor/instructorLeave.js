import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Plus, Calendar, Edit, AlertCircle } from 'lucide-react';
import InstructorNav from './InstructorNav';
import ErrorHandle from "../errorHandle";

const InstructorLeave = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newLeave, setNewLeave] = useState({
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [editLeaveId, setEditLeaveId] = useState(null);
  const [editLeave, setEditLeave] = useState({
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteLeaveId, setDeleteLeaveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState("");
  
  const userId = localStorage.getItem('userId'); // Assuming userId is stored after login

  useEffect(() => {
    if (userId) {
      fetchLeaveRequests();
    } else {
      setErrorMsg("User not authenticated. Please login again.");
      setLoading(false);
    }
  }, [userId]);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const response = await axios.get(`http://localhost:3001/employee/getMyLeaves/${userId}`);
      setLeaveRequests(response.data);
    } catch (err) {
      console.error('Error fetching leave requests:', err);
      setErrorMsg(err.response?.data?.error || "Failed to fetch leave requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAddLeave = async () => {
    // Validation
    if (!newLeave.startDate || !newLeave.endDate || !newLeave.reason.trim()) {
      setFormError("All fields are required");
      return;
    }
    
    if (new Date(newLeave.startDate) > new Date(newLeave.endDate)) {
      setFormError("Start date cannot be after end date");
      return;
    }

    if (newLeave.reason.length < 10) {
      setFormError("Reason must be at least 10 characters long");
      return;
    }

    const leaveData = { 
      startDate: newLeave.startDate,
      endDate: newLeave.endDate,
      reason: newLeave.reason.trim(),
      instructorId: userId
    };
    
    try {
      setFormError("");
      const result = await axios.post('http://localhost:3001/employee/addInstructorLeave', leaveData);
      setLeaveRequests([...leaveRequests, result.data]);
      setNewLeave({
        startDate: '',
        endDate: '',
        reason: '',
      });
      setShowModal(false);
      setSuccessMsg("Leave request submitted successfully");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error('Error adding leave:', err);
      if (err.response?.status === 400) {
        setFormError(err.response.data.error || "Invalid request data");
      } else {
        setFormError("Something went wrong while submitting the request");
      }
    }
  };

  const handleEditLeave = (id) => {
    const leave = leaveRequests.find((l) => l._id === id);
    if (leave && leave.status === 'Pending') {
      setEditLeave({
        startDate: leave.startDate ? leave.startDate.split('T')[0] : '',
        endDate: leave.endDate ? leave.endDate.split('T')[0] : '',
        reason: leave.reason || '',
      });
      setEditLeaveId(id);
      setEditMode(true);
      setShowModal(true);
      setFormError("");
    } else {
      setErrorMsg("Cannot edit approved or rejected leave requests");
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  const handleSaveEdit = async () => {
    // Validation
    if (!editLeave.startDate || !editLeave.endDate || !editLeave.reason.trim()) {
      setFormError("All fields are required");
      return;
    }
    
    if (new Date(editLeave.startDate) > new Date(editLeave.endDate)) {
      setFormError("Start date cannot be after end date");
      return;
    }

    if (editLeave.reason.length < 10) {
      setFormError("Reason must be at least 10 characters long");
      return;
    }

    try {
      setFormError("");
      const result = await axios.put(`http://localhost:3001/employee/updateInstructorLeave/${editLeaveId}`, editLeave);
      setLeaveRequests(leaveRequests.map((l) => (l._id === editLeaveId ? result.data : l)));
      setEditMode(false);
      setEditLeaveId(null);
      setEditLeave({
        startDate: '',
        endDate: '',
        reason: '',
      });
      setShowModal(false);
      setSuccessMsg("Leave request updated successfully");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error('Error updating leave:', err);
      if (err.response?.status === 400) {
        setFormError(err.response.data.error || "Invalid update data");
      } else {
        setFormError("Something went wrong while updating the request");
      }
    }
  };

  const handleDeleteLeave = (id) => {
    const leave = leaveRequests.find((l) => l._id === id);
    if (leave && (leave.status === 'Pending' || leave.status === 'Rejected')) {
      setDeleteLeaveId(id);
      setShowConfirmDelete(true);
    } else {
      setErrorMsg("Cannot delete approved leave requests");
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:3001/employee/deleteLeave/${deleteLeaveId}`);
      setLeaveRequests(leaveRequests.filter((l) => l._id !== deleteLeaveId));
      setSuccessMsg("Leave request deleted successfully");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error('Error deleting leave:', err);
      setErrorMsg(err.response?.data?.error || "Failed to delete leave request");
      setTimeout(() => setErrorMsg(""), 3000);
    }
    setShowConfirmDelete(false);
    setDeleteLeaveId(null);
  };

  const cancelDelete = () => {
    setShowConfirmDelete(false);
    setDeleteLeaveId(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewLeave({
      startDate: '',
      endDate: '',
      reason: '',
    });
    setEditMode(false);
    setEditLeaveId(null);
    setEditLeave({
      startDate: '',
      endDate: '',
      reason: '',
    });
    setFormError("");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="badge bg-success">Approved</span>;
      case 'Rejected':
        return <span className="badge bg-danger">Rejected</span>;
      case 'Pending':
      default:
        return <span className="badge bg-warning">Pending</span>;
    }
  };

  return (
    <div>
      {/* Navbar - Updated to match dashboard */}
      <InstructorNav page="leave-requests" />

      {/* Header Section - Updated to match dashboard styling */}
      <section
        className="text-white pb-5"
        style={{
          background: `linear-gradient(90deg, rgba(13,81,253,1) 20%, rgba(10,132,202,0.3) 100%), url('https://images.unsplash.com/photo-1516862523118-a3724eb136d7?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D') center/cover no-repeat`,
          marginTop: "76px",
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div className="container py-5 mt-5">
          <h1 className="fw-bold display-5 mb-3 mx-1">My Leave Management</h1>
          <h6 className="fs-6 lead opacity-90">
            Submit and track your leave requests for the driving school
          </h6>
        </div>
      </section>

      {/* Main Content - Updated to match StudentManagement layout */}
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
              {/* Add New Leave Request Card - Matches StudentManagement style */}
              <div className="col-12">
                <div className="card border-2 shadow-sm p-3">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                        <Plus size={64} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="mb-1 fw-bold">Add New Leave Request</h3>
                        <small className="text-muted">Click below to submit a new leave request</small>
                      </div>
                    </div>
                    <button
                      className="btn btn-primary"
                      style={{ padding: '6px 12px', fontSize: '16px', maxWidth: '200px' }}
                      onClick={() => setShowModal(true)}
                    >
                      <Plus className="me-2" size={20} /> Add Request
                    </button>
                  </div>
                </div>
              </div>

              {/* Leave Requests Table Card - Matches StudentManagement style */}
              <div className="col-12">
                <div className="card border-2 shadow-sm p-3">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-info bg-opacity-10 rounded-circle p-3 me-3">
                        <Calendar size={64} className="text-info" />
                      </div>
                      <div>
                        <h3 className="mb-1 fw-bold">My Leave Requests</h3>
                        <small className="text-muted">View and manage your submitted requests</small>
                      </div>
                    </div>
                    
                    {leaveRequests.length === 0 ? (
                      <div className="text-center py-5">
                        <Calendar size={64} className="text-muted mb-3" />
                        <h5 className="text-muted">No leave requests found</h5>
                        <p className="text-muted">Create your first leave request to get started</p>
                        <button
                          className="btn btn-primary mt-3"
                          onClick={() => setShowModal(true)}
                        >
                          <Plus className="me-2" size={16} /> Create First Request
                        </button>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-striped">
                          <thead>
                            <tr>
                              <th scope="col">Start Date</th>
                              <th scope="col">End Date</th>
                              <th scope="col">Reason</th>
                              <th scope="col">Status</th>
                              <th scope="col">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {leaveRequests.map((request) => (
                              <tr key={request._id}>
                                <td>
                                  <strong>{new Date(request.startDate).toLocaleDateString()}</strong>
                                </td>
                                <td>
                                  <strong>{new Date(request.endDate).toLocaleDateString()}</strong>
                                </td>
                                <td className="text-truncate" style={{ maxWidth: '200px' }} title={request.reason}>
                                  {request.reason ? request.reason.substring(0, 50) + (request.reason.length > 50 ? '...' : '') : 'N/A'}
                                </td>
                                <td>
                                  {getStatusBadge(request.status)}
                                </td>
                                <td>
                                  {(request.status === 'Pending' || request.status === 'Rejected') && (
                                    <div className="btn-group" role="group">
                                      {request.status === 'Pending' && (
                                        <button
                                          className="btn btn-sm btn-warning me-2"
                                          onClick={() => handleEditLeave(request._id)}
                                          title="Edit leave request"
                                        >
                                          <Edit size={18} />
                                        </button>
                                      )}
                                      <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDeleteLeave(request._id)}
                                        title="Delete leave request"
                                      >
                                        <Trash2 size={18} />
                                      </button>
                                    </div>
                                  )}
                                  {request.status === 'Approved' && (
                                    <div className="text-muted small">
                                      <i className="bi bi-lock-fill me-1"></i>Locked
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Leave Policy Card - Similar to dashboard info section */}
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-light rounded-circle p-2 me-3">
                        <AlertCircle size={24} className="text-warning" />
                      </div>
                      <div>
                        <h6 className="mb-1 fw-bold text-dark">Leave Policy</h6>
                        <small className="text-muted">Important information</small>
                      </div>
                    </div>
                    <div className="text-muted small">
                      <ul className="mb-0 ps-3">
                        <li className="mb-1">Submit requests at least 48 hours in advance</li>
                        <li className="mb-1">Maximum 7 consecutive days per request</li>
                        <li className="mb-1">Annual leave: 14 working days</li>
                        <li className="mb-1">Emergency leave: 3 days per year</li>
                        <li>Status updates within 24 hours of submission</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add/Edit Leave Modal - Matches StudentManagement style */}
        <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showModal ? 'rgba(0,0,0,0.5)' : 'transparent' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {editMode ? 'Edit Leave Request' : 'New Leave Request'}
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                {formError && (
                  <div className="alert alert-danger" role="alert">
                    {formError}
                  </div>
                )}
                <div className="d-flex flex-column gap-2">
                  <div className="mb-2">
                    <label className="form-label fw-semibold">Start Date <span className="text-danger">*</span></label>
                    <input
                      type="date"
                      className="form-control"
                      value={editMode ? editLeave.startDate : newLeave.startDate}
                      onChange={(e) => {
                        const value = e.target.value;
                        editMode ? 
                          setEditLeave({ ...editLeave, startDate: value }) : 
                          setNewLeave({ ...newLeave, startDate: value });
                        setFormError("");
                      }}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  
                  <div className="mb-2">
                    <label className="form-label fw-semibold">End Date <span className="text-danger">*</span></label>
                    <input
                      type="date"
                      className="form-control"
                      value={editMode ? editLeave.endDate : newLeave.endDate}
                      onChange={(e) => {
                        const value = e.target.value;
                        editMode ? 
                          setEditLeave({ ...editLeave, endDate: value }) : 
                          setNewLeave({ ...newLeave, endDate: value });
                        setFormError("");
                      }}
                      min={editMode ? editLeave.startDate : newLeave.startDate}
                      required
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label fw-semibold">Reason for Leave <span className="text-danger">*</span></label>
                    <textarea
                      className="form-control"
                      rows={4}
                      placeholder="Please provide a detailed reason for your leave request (minimum 10 characters)"
                      value={editMode ? editLeave.reason : newLeave.reason}
                      onChange={(e) => {
                        const value = e.target.value;
                        editMode ? 
                          setEditLeave({ ...editLeave, reason: value }) : 
                          setNewLeave({ ...newLeave, reason: value });
                        setFormError("");
                      }}
                      required
                    />
                    <div className="form-text">
                      Minimum 10 characters required
                    </div>
                  </div>

                  {editMode && (
                    <div className="alert alert-info border-0">
                      <div className="d-flex align-items-center">
                        <AlertCircle size={16} className="me-2 text-info flex-shrink-0" />
                        <div>
                          <strong>Current Status:</strong> {editLeave.status} <br/>
                          <small className="text-muted">Status can only be changed by Admin</small>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  <i className="bi bi-x-circle me-1"></i>Cancel
                </button>
                {editMode ? (
                  <button 
                    type="button" 
                    className={`btn btn-primary ${!editLeave.startDate || !editLeave.endDate || !editLeave.reason.trim() ? 'disabled' : ''}`} 
                    onClick={handleSaveEdit}
                    disabled={!editLeave.startDate || !editLeave.endDate || !editLeave.reason.trim()}
                  >
                    <i className="bi bi-check-circle me-1"></i>Save Changes
                  </button>
                ) : (
                  <button 
                    type="button" 
                    className={`btn btn-primary ${!newLeave.startDate || !newLeave.endDate || !newLeave.reason.trim() ? 'disabled' : ''}`} 
                    onClick={handleAddLeave}
                    disabled={!newLeave.startDate || !newLeave.endDate || !newLeave.reason.trim()}
                  >
                    <i className="bi bi-send me-1"></i>Submit Request
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Confirm Delete Modal - Enhanced styling */}
        <div className={`modal fade ${showConfirmDelete ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showConfirmDelete ? 'rgba(0,0,0,0.5)' : 'transparent' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  <Trash2 size={20} className="me-2" />
                  Confirm Deletion
                </h5>
                <button type="button" className="btn-close" onClick={cancelDelete}></button>
              </div>
              <div className="modal-body">
                <div className="text-center mb-3">
                  <Trash2 size={64} className="text-danger mb-3" />
                </div>
                <p className="text-center mb-0">
                  Are you sure you want to delete this leave request? 
                  <br />
                  <small className="text-muted">This action cannot be undone.</small>
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={cancelDelete}>
                  <i className="bi bi-x-circle me-1"></i>Cancel
                </button>
                <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                  <i className="bi bi-trash me-1"></i>Delete Request
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorLeave;