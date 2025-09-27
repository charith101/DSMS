import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StudentNav from "./StudentNav";
import { Star } from "lucide-react";

function StudentFeedback() {
  const userId = localStorage.getItem("userId");
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [previousFeedbacks, setPreviousFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editInstructorName, setEditInstructorName] = useState("");
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");

  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/student/getFeedbacks/${userId}`);
      setPreviousFeedbacks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const res = await axios.get('http://localhost:3001/student/getInstructors');
        setInstructors(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchData = async () => {
      if (userId) {
        setLoading(true);
        await Promise.all([fetchInstructors(), fetchFeedbacks()]);
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleStarClick = (value) => {
    setRating(value);
  };

  const handleEditStarClick = (value) => {
    setEditRating(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedInstructor && rating > 0) {
      try {
        await axios.post('http://localhost:3001/student/createFeedback', {
          studentId: userId,
          instructorId: selectedInstructor,
          rating,
          comment
        });
        setSubmitted(true);
        await fetchFeedbacks();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleReset = () => {
    setSelectedInstructor("");
    setRating(0);
    setComment("");
    setSubmitted(false);
  };

  const openEditModal = (feedback) => {
    setEditId(feedback._id);
    setEditInstructorName(feedback.instructorId.name);
    setEditRating(feedback.rating);
    setEditComment(feedback.comment || "");
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:3001/student/updateFeedback/${editId}`, {
        rating: editRating,
        comment: editComment
      });
      setShowEditModal(false);
      await fetchFeedbacks();
    } catch (err) {
      console.error(err);
    }
  };

  const openDeleteModal = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3001/student/deleteFeedback/${deleteId}`);
      setShowDeleteModal(false);
      await fetchFeedbacks();
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toISOString().split('T')[0];
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

  return (
    <div>
      <StudentNav page="feedback"/>
      <section
        className="text-white pb-5"
        style={{
          background: `linear-gradient(90deg, rgba(13,81,253,1) 20%, rgba(10,132,202,0.3) 100%), url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D') center/cover no-repeat`,
          marginTop: "76px",
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div className="container py-5">
          <h1 className="fw-bold display-5 mb-3 mx-1">Instructor Feedback</h1>
          <h6 className="fs-6 lead opacity-90">
            Share your feedback about your driving instructors to help us improve.
          </h6>
        </div>
      </section>

      <div className="py-5 bg-light">
        <div className="container">
          <div className="row g-4">
            <div className="col-12">
              <div className="card border-0 shadow-lg p-4" style={{ borderRadius: "12px", background: "#ffffff" }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-4">
                    <div>
                      <h3 className="mb-1 fw-bold text-primary">Provide Your Feedback</h3>
                      <small className="text-muted">Select an instructor and share your experience</small>
                    </div>
                  </div>
                  {submitted ? (
                    <div className="text-center py-5">
                      <h4 className="fw-bold text-success mb-3">Thank You for Your Feedback!</h4>
                      <p className="text-muted">Your feedback has been submitted successfully.</p>
                      <button
                        className="btn btn-primary px-4 py-2"
                        style={{ borderRadius: "8px", fontWeight: "500" }}
                        onClick={handleReset}
                      >
                        Submit Another Feedback
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      <div className="mb-4">
                        <h4 className="fw-bold text-dark" style={{ fontSize: "1.5rem" }}>
                          Select Instructor
                        </h4>
                        <div className="dropdown">
                          <button
                            className="dropdown-toggle w-100 text-start border bg-white fs-5"
                            type="button"
                            id="instructorDropdown"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            style={{ borderRadius: "10px", padding: "12px" }}
                          >
                            {selectedInstructor ? instructors.find(inst => inst._id === selectedInstructor)?.name : "Choose an instructor"}
                          </button>
                          <ul className="dropdown-menu w-100" aria-labelledby="instructorDropdown">
                            {instructors.map((instructor) => (
                              <li key={instructor._id}>
                                <button
                                  className="dropdown-item fs-5"
                                  type="button"
                                  onClick={() => setSelectedInstructor(instructor._id)}
                                >
                                  {instructor.name}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="mb-4">
                        <h4 className="fw-bold text-dark" style={{ fontSize: "1.5rem" }}>
                          Rate Your Experience
                        </h4>
                        <div className="d-flex gap-2">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <Star
                              key={value}
                              size={30}
                              fill={value <= rating ? "#ffc107" : "none"}
                              stroke={value <= rating ? "#ffc107" : "#6c757d"}
                              className="cursor-pointer"
                              onClick={() => handleStarClick(value)}
                              style={{ transition: "all 0.3s ease" }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="mb-4">
                        <h4 className="fw-bold text-dark" style={{ fontSize: "1.5rem" }}>
                          Comment
                        </h4>
                        <textarea
                          className="form-control"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Share your thoughts about the instructor..."
                          rows="5"
                          style={{ borderRadius: "10px", padding: "12px" }}
                        ></textarea>
                      </div>
                      <div className="d-flex justify-content-end mt-5">
                        <button
                          type="submit"
                          className="btn btn-primary d-flex align-items-center px-4 py-2"
                          style={{
                            borderRadius: "8px",
                            fontWeight: "500",
                            background: "linear-gradient(135deg, #0d51fdff, #0a84caff)"
                          }}
                          disabled={!selectedInstructor || rating === 0}
                        >
                          Submit Feedback
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
            {previousFeedbacks.length > 0 && (
              <div className="col-12 mt-4">
                <div className="card border-0 shadow-lg p-4" style={{ borderRadius: "12px", background: "#ffffff" }}>
                  <div className="card-body p-4">
                    <h3 className="mb-4 fw-bold text-primary">Previous Feedback</h3>
                    <div className="d-flex flex-column gap-4">
                      {previousFeedbacks.map((feedback) => (
                        <div key={feedback._id} className="border-bottom pb-3">
                          <h5 className="fw-bold text-dark">{feedback.instructorId.name}</h5>
                          <div className="d-flex gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((value) => (
                              <Star
                                key={value}
                                size={20}
                                fill={value <= feedback.rating ? "#ffc107" : "none"}
                                stroke={value <= feedback.rating ? "#ffc107" : "#6c757d"}
                              />
                            ))}
                          </div>
                          <p className="text-muted mb-2">{feedback.comment}</p>
                          <small className="text-muted">Submitted on {formatDate(feedback.date)}</small>
                          <div className="mt-2">
                            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEditModal(feedback)}>Edit</button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => openDeleteModal(feedback._id)}>Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Feedback</h5>
                  <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Instructor</label>
                    <input type="text" className="form-control" value={editInstructorName} disabled />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Rate Your Experience</label>
                    <div className="d-flex gap-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Star
                          key={value}
                          size={30}
                          fill={value <= editRating ? "#ffc107" : "none"}
                          stroke={value <= editRating ? "#ffc107" : "#6c757d"}
                          className="cursor-pointer"
                          onClick={() => handleEditStarClick(value)}
                          style={{ transition: "all 0.3s ease" }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Comment</label>
                    <textarea
                      className="form-control"
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      rows="5"
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                  <button type="button" className="btn btn-primary" onClick={handleUpdate} disabled={editRating === 0}>Save Changes</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Deletion</h5>
                  <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this feedback?</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>No</button>
                  <button type="button" className="btn btn-danger" onClick={handleDelete}>Yes</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
}

export default StudentFeedback;