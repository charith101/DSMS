import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StudentNav from "./StudentNav";
import { User2 } from "lucide-react";
import ErrorHandle from "../errorHandle";
import { Link } from "react-router-dom";

function StudentProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    nic: '',
    password: '',
    level: '',
    licenseType: [],
    role: 'student',
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3001/student/getUser/${userId}`);
        const data = response.data;
        setUser(data);
        setFormData({
          name: data.name,
          email: data.email,
          age: data.age,
          nic: data.nic,
          password: '',
          level: data.level,
          licenseType: Array.isArray(data.licenseType) ? data.licenseType : [],
          role: 'student',
        });
        setLoading(false);
      } catch (err) {
        if (err.response && err.response.status === 400) {
          setErrorMsg(err.response.data.error);
          setLoading(false);
        } else {
          console.error(err);
          setLoading(false);
          alert("Something went wrong");
        }
      }
    };

    if (userId) {
      fetchUser();
    } else {
      setErrorMsg('User ID not found');
      setLoading(false);
    }
  }, [userId]);

  const handleEditClick = () => {
    setShowModal(true);
    setErrorMsg("");
  };

  const handleModalClose = () => {
    setShowModal(false);
    setFormData({
      name: user.name,
      email: user.email,
      age: user.age,
      nic: user.nic,
      password: '',
      level: user.level,
      licenseType: user.licenseType,
      role: 'student',
    });
    setErrorMsg("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setUpdateLoading(true);
    const cleanedFormData = {
      ...formData,
      licenseType: formData.licenseType.filter(type => type && type.trim() !== ''),
      age: parseInt(formData.age),
    };
    if (!cleanedFormData.password) {
      delete cleanedFormData.password;
    }
    try {
      const response = await axios.put(`http://localhost:3001/student/updateUser/${userId}`, cleanedFormData);
      setUser(response.data);
      setShowModal(false);
      setUpdateLoading(false);
    } catch (err) {
      console.error('Update profile error:', err.response);
      if (err.response && err.response.status === 400) {
        setErrorMsg(err.response.data.error || 'Validation error occurred');
      } else if (err.response && err.response.status === 500) {
        setErrorMsg('Server error - please try again');
      } else {
        console.error(err);
        setErrorMsg("Something went wrong - check console for details");
      }
      setUpdateLoading(false);
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

  return (
    <div className="d-flex flex-column bg-body-tertiary justify-content-center align-items-center min-vh-100">
      <StudentNav page="profile" />
      <section
        className="text-white pb-5"
        style={{
          background: `linear-gradient(90deg, rgba(13,81,253,1) 20%, rgba(10,132,202,0.3) 100%), url('https://images.unsplash.com/photo-1496185106368-308ed96f204b?q=80&w=2121&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D') center/cover no-repeat`,
          marginTop: "76px",
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          width: "100%",
        }}
      >
        <div className="container py-5">
          <h1 className="fw-bold display-5 mb-3 mx-1">Your Profile</h1>
          <h6 className="fs-6 lead opacity-90">
            View and manage your personal information.
          </h6>
        </div>
      </section>
      <div className="container my-4 px-3 px-sm-0" style={{ maxWidth: "900px" }}>
        <div className="card p-4 rounded-3 shadow-sm border-0" style={{ background: "#ffffff" }}>
          <div className='text-center'>
            <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-flex mb-2 text-center">
                <User2 size={50} className="text-primary text-center"/>
                </div>
          </div>
          <h3 className="mb-4 text-center text-dark fw-semibold">Your Profile</h3>
          <div className="row row-cols-1 row-cols-md-2 g-3">
            <div className="col">
              <div className="p-3 bg-light rounded-3">
                <h6 className="fw-bold text-muted mb-1">Name</h6>
                <p className="mb-0 text-dark">{user.name}</p>
              </div>
            </div>
            <div className="col">
              <div className="p-3 bg-light rounded-3">
                <h6 className="fw-bold text-muted mb-1">Email</h6>
                <p className="mb-0 text-dark">{user.email}</p>
              </div>
            </div>
            <div className="col">
              <div className="p-3 bg-light rounded-3">
                <h6 className="fw-bold text-muted mb-1">Age</h6>
                <p className="mb-0 text-dark">{user.age}</p>
              </div>
            </div>
            <div className="col">
              <div className="p-3 bg-light rounded-3">
                <h6 className="fw-bold text-muted mb-1">NIC</h6>
                <p className="mb-0 text-dark">{user.nic}</p>
              </div>
            </div>
            <div className="col">
              <div className="p-3 bg-light rounded-3">
                <h6 className="fw-bold text-muted mb-1">License Types</h6>
                <p className="mb-0 text-dark">{user.licenseType.join(', ')}</p>
              </div>
            </div>
            <div className="col">
              <div className="p-3 bg-light rounded-3">
                <h6 className="fw-bold text-muted mb-1">Joined</h6>
                <p className="mb-0 text-dark">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          <div className="d-flex flex-column flex-md-row mt-4 gap-2">
          <button
            className="btn btn-primary w-100"
            onClick={handleEditClick}
          >
            Edit Profile
          </button>
          <Link
            to="/Student/Payments"
            className="btn btn-dark w-100"
          >
            View Payments
          </Link>
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
                  <div className="mb-2">
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
                    />
                    <ErrorHandle for="name" error={errorMsg} />
                  </div>
                  <div className="mb-2">
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
                    />
                    <ErrorHandle for="email" error={errorMsg} />
                    <ErrorHandle for="ear" error={errorMsg} />
                  </div>
                  <div className="mb-2">
                    <label htmlFor="age" className="form-label fw-bold text-dark">
                      Age
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="age"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                    />
                    <ErrorHandle for="age" error={errorMsg} />
                  </div>
                  <div className="mb-2">
                    <label htmlFor="nic" className="form-label fw-bold text-dark">
                      NIC
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="nic"
                      name="nic"
                      value={formData.nic}
                      onChange={handleInputChange}
                    />
                    <ErrorHandle for="nic" error={errorMsg} />
                  </div>
                  <div className="mb-2">
                    <label htmlFor="password" className="form-label fw-bold text-dark">
                      Password (leave blank to keep current)
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                    <ErrorHandle for="password" error={errorMsg} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label fw-bold">License Types</label>
                    <p className="form-control bg-light">{user.licenseType.join(', ')}</p>
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
                      disabled={updateLoading}
                    >
                      {updateLoading ? 'Saving...' : 'Save Changes'}
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