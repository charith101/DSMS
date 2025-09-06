import React, { useState } from 'react';
import StudentNav from "./StudentNav";
import { Star } from "lucide-react";

function StudentFeedback() {
  const [selectedInstructor, setSelectedInstructor] = useState("");
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [previousFeedbacks, setPreviousFeedbacks] = useState([
    {
      instructor: "John Smith",
      rating: 4,
      comments: "Great instructor, very patient and clear in explanations.",
      date: "2025-08-20"
    },
    {
      instructor: "Sarah Johnson",
      rating: 5,
      comments: "Amazing experience! Made me feel confident behind the wheel.",
      date: "2025-08-15"
    }
  ]);

  // Sample instructor data
  const instructors = [
    "John Smith",
    "Sarah Johnson",
    "Michael Brown",
    "Emily Davis"
  ];

  const handleStarClick = (value) => {
    setRating(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedInstructor && rating > 0) {
      setPreviousFeedbacks([
        ...previousFeedbacks,
        {
          instructor: selectedInstructor,
          rating,
          comments,
          date: new Date().toISOString().split('T')[0]
        }
      ]);
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setSelectedInstructor("");
    setRating(0);
    setComments("");
    setSubmitted(false);
  };

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
                            className=" dropdown-toggle w-100 text-start"
                            type="button"
                            id="instructorDropdown"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            style={{ borderRadius: "10px", padding: "12px" }}
                          >
                            {selectedInstructor || "Choose an instructor"}
                          </button>
                          <ul className="dropdown-menu w-100" aria-labelledby="instructorDropdown">
                            {instructors.map((instructor, index) => (
                              <li key={index}>
                                <button
                                  className="dropdown-item"
                                  type="button"
                                  onClick={() => setSelectedInstructor(instructor)}
                                >
                                  {instructor}
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
                          Comments
                        </h4>
                        <textarea
                          className="form-control"
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
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
                      {previousFeedbacks.map((feedback, index) => (
                        <div key={index} className="border-bottom pb-3">
                          <h5 className="fw-bold text-dark">{feedback.instructor}</h5>
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
                          <p className="text-muted mb-2">{feedback.comments}</p>
                          <small className="text-muted">Submitted on {feedback.date}</small>
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
    </div>
  );
}

export default StudentFeedback;