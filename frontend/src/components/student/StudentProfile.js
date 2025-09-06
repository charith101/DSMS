import React, { useState } from 'react';
import StudentNav from "./StudentNav";
import { User } from "lucide-react";

function StudentProfile() {
  // Sample user data
  const [user, setUser] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    phone: "+1 (555) 123-4567",
    joinedDate: "2025-01-15",
    profilePic: "https://via.placeholder.com/150", // Placeholder image
  });

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
  });

  const handleEditClick = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    setUser((prev) => ({
      ...prev,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    }));
    setShowModal(false);
  };

  return (
    <div>
      <StudentNav page="profile" />
      <section
        className="text-white pb-5"
        style={{
          background: `linear-gradient(90deg, rgba(13,81,253,1) 20%, rgba(10,132,202,0.3) 100%), url('https://images.unsplash.com/photo-1496185106368-308ed96f204b?q=80&w=2121&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D') center/cover no-repeat`,
          marginTop: "76px",
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div className="container py-5">
          <h1 className="fw-bold display-5 mb-3 mx-1">Your Profile</h1>
          <h6 className="fs-6 lead opacity-90">
            View and manage your personal information.
          </h6>
        </div>
      </section>

      <div className="py-5 bg-light">
        <div className="container">
          <div className="row g-4">
            {/* Profile Information */}
            <div className="col-lg-6 col-md-8 mx-auto">
              <div className="card border-0 shadow-lg p-4" style={{ borderRadius: "12px", background: "#ffffff" }}>
                <div className="card-body p-4 text-center">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-4 d-inline-flex mb-3">
                    <User size={80} className="text-primary" />
                  </div>
                  <h3 className="fw-bold text-primary mb-2">{user.name}</h3>
                  <p className="text-muted mb-1">{user.email}</p>
                  <p className="text-muted mb-3">{user.phone}</p>
                  <p className="text-muted mb-3">Joined: {user.joinedDate}</p>
                  <button
                    className="btn btn-primary px-4 py-2"
                    style={{
                      borderRadius: "8px",
                      fontWeight: "500",
                      background: "linear-gradient(135deg, #0d51fdff, #0a84caff)",
                    }}
                    onClick={handleEditClick}
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content" style={{ borderRadius: "12px", border: "none" }}>
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold text-primary">Edit Profile</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleModalClose}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handleSaveChanges}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label fw-bold text-dark">
                      Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      style={{ borderRadius: "10px", padding: "12px" }}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-bold text-dark">
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      style={{ borderRadius: "10px", padding: "12px" }}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label fw-bold text-dark">
                      Phone
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      style={{ borderRadius: "10px", padding: "12px" }}
                      required
                    />
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-4 py-2"
                      style={{ borderRadius: "8px", fontWeight: "500" }}
                      onClick={handleModalClose}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary px-4 py-2"
                      style={{
                        borderRadius: "8px",
                        fontWeight: "500",
                        background: "linear-gradient(135deg, #0d51fdff, #0a84caff)",
                      }}
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentProfile;