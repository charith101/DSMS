import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InstructorNav from './AdminNav';
import { User2, Edit } from 'lucide-react';
import ErrorHandle from '../errorHandle';

function AdminProfile() {
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    nic: '',
    password: '',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/users/profile/${userId}`);
        const data = response.data;
        setUser(data);
        setFormData({
          name: data.name,
          age: data.age,
          nic: data.nic,
          password: '',
        });
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setErrorMsg('User not found');
        } else {
          console.error(err);
          setErrorMsg('Something went wrong');
        }
      }
    };

    if (userId) {
      fetchUser();
    } else {
      setErrorMsg('User ID not found');
    }
  }, [userId]);

  const handleEditClick = () => {
    setShowModal(true);
    setErrorMsg('');
  };

  const handleModalClose = () => {
    setShowModal(false);
    setFormData({
      name: user.name,
      age: user.age,
      nic: user.nic,
      password: '',
    });
    setErrorMsg('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setUpdateLoading(true);
    const cleanedFormData = {
      name: formData.name,
      age: parseInt(formData.age),
      nic: formData.nic,
    };
    if (formData.password) cleanedFormData.password = formData.password;
    try {
      const response = await axios.put(`http://localhost:3001/users/profile/${userId}`, cleanedFormData);
      setUser(response.data.user);
      setShowModal(false);
      setUpdateLoading(false);
    } catch (err) {
      console.error('Update profile error:', err.response);
      if (err.response && err.response.status === 400) {
        setErrorMsg(err.response.data.message || 'Validation error occurred');
      } else if (err.response && err.response.status === 500) {
        setErrorMsg('Server error - please try again');
      } else {
        setErrorMsg('Something went wrong');
      }
      setUpdateLoading(false);
    }
  };

  if (errorMsg) {
    return (
      <div className="d-flex flex-column bg-body-tertiary justify-content-center align-items-center min-vh-100">
        <InstructorNav page="profile" />
        <div className="container my-4 px-3 px-sm-0" style={{ maxWidth: '900px' }}>
          <div className="alert alert-danger text-center">{errorMsg}</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="d-flex flex-column bg-body-tertiary justify-content-center align-items-center min-vh-100">
        <InstructorNav page="profile" />
        <section
          className="text-white pb-5"
          style={{
            background: `linear-gradient(90deg, rgba(13,81,253,1) 20%, rgba(10,132,202,0.3) 100%), url('https://images.unsplash.com/photo-1496185106368-308ed96f204b?q=80&w=2121&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D') center/cover no-repeat`,
            marginTop: '76px',
            minHeight: '50vh',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <div className="container py-5">
            <h1 className="fw-bold display-5 mb-3 mx-1">Your Profile</h1>
            <h6 className="fs-6 lead opacity-90">View and manage your personal information.</h6>
          </div>
        </section>
        <div className="container my-4 px-3 px-sm-0" style={{ maxWidth: '900px' }}>
          <div className="card p-4 rounded-3 shadow-sm border-0" style={{ background: '#ffffff' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column bg-body-tertiary justify-content-center align-items-center min-vh-100">
      <InstructorNav page="profile" />
      <section
        className="text-white pb-5"
        style={{
          background: `linear-gradient(90deg, rgba(13,81,253,1) 20%, rgba(10,132,202,0.3) 100%), url('https://images.unsplash.com/photo-1496185106368-308ed96f204b?q=80&w=2121&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D') center/cover no-repeat`,
          marginTop: '76px',
          minHeight: '50vh',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <div className="container py-5">
          <h1 className="fw-bold display-5 mb-3 mx-1">Your Profile</h1>
          <h6 className="fs-6 lead opacity-90">View and manage your personal information.</h6>
        </div>
      </section>
      <div className="container my-4 px-3 px-sm-0" style={{ maxWidth: '900px' }}>
        <div className="card p-4 rounded-3 shadow-sm border-0" style={{ background: '#ffffff' }}>
          <div className="text-center">
            <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-flex mb-2 text-center">
              <User2 size={50} className="text-primary text-center" />
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
                <h6 className="fw-bold text-muted mb-1">Joined</h6>
                <p className="mb-0 text-dark">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          <div className="d-flex flex-column mt-4 gap-2">
            <button
              className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
              onClick={handleEditClick}
            >
              <Edit size={18} /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content" style={{ borderRadius: '12px', border: 'none' }}>
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
                      required
                    />
                    <ErrorHandle for="name" error={errorMsg} />
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
                      required
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
                      required
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
                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-4 py-2"
                      style={{ borderRadius: '8px', fontWeight: '500' }}
                      onClick={handleModalClose}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary px-4 py-2"
                      style={{
                        borderRadius: '8px',
                        fontWeight: '500',
                        background: 'linear-gradient(135deg, #0d51fdff, #0a84caff)',
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

export default AdminProfile;