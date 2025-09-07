import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Plus, Users, Edit } from 'lucide-react';
import AdminNav from './AdminNav';
import ErrorHandle from "../errorHandle";

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    age: '',
    nic: '',
    password: '',
    level: '', 
    licenseType: ['', '', ''], 
    role: 'student',
  });
  const [editMode, setEditMode] = useState(false);
  const [editStudentId, setEditStudentId] = useState(null);
  const [editStudent, setEditStudent] = useState({
    name: '',
    email: '',
    age: '',
    nic: '',
    level: '',
    licenseType: ['', '', ''], 
  });
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteStudentId, setDeleteStudentId] = useState(null);

  useEffect(() => {
    axios
      .get('http://localhost:3001/student')
      .then((result) => setStudents(result.data))
      .catch((err) => console.log(err));
  }, []);

  const handleAddStudent = () => {
    axios
      .post('http://localhost:3001/student/registerUser', newStudent)
      .then((result) => {
        setStudents([...students, result.data]);
        setNewStudent({
          name: '',
          email: '',
          age: '',
          nic: '',
          password: '',
          level: '', 
          licenseType: ['', '', ''], 
          role: 'student',
        });
        setShowModal(false);
        setErrorMsg("");
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          setErrorMsg(err.response.data.error);
        } else {
          console.error(err);
          setErrorMsg("Something went wrong");
        }
      });
  };

  const handleEditStudent = (id) => {
    const student = students.find((s) => s._id === id);
    setEditStudent({
      name: student.name,
      email: student.email,
      age: student.age,
      nic: student.nic,
      level: student.level,
      licenseType: student.licenseType.slice(0, 3) || ['', '', ''], 
    });
    setEditStudentId(id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleSaveEdit = () => {
    axios
      .put(`http://localhost:3001/student/updateUser/${editStudentId}`, editStudent)
      .then((result) => {
        setStudents(students.map((s) => (s._id === editStudentId ? result.data : s)));
        setEditMode(false);
        setEditStudentId(null);
        setEditStudent({
          name: '',
          email: '',
          age: '',
          nic: '',
          level: '',
          licenseType: ['', '', ''], 
        });
        setShowModal(false);
        setErrorMsg("");
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          setErrorMsg(err.response.data.error);
        } else {
          console.error(err);
          setErrorMsg("Something went wrong");
        }
      });
  };

  const handleDeleteStudent = (id) => {
    setDeleteStudentId(id);
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    axios
      .delete(`http://localhost:3001/student/deleteUser/${deleteStudentId}`)
      .then(() => setStudents(students.filter((s) => s._id !== deleteStudentId)))
      .catch((err) => console.log(err));
    setShowConfirmDelete(false);
    setDeleteStudentId(null);
  };

  const cancelDelete = () => {
    setShowConfirmDelete(false);
    setDeleteStudentId(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewStudent({
      name: '',
      email: '',
      age: '',
      nic: '',
      password: '',
      level: '', 
      licenseType: ['', '', ''],
      role: 'student',
    });
    setEditMode(false);
    setEditStudentId(null);
    setEditStudent({
      name: '',
      email: '',
      age: '',
      nic: '',
      level: '',
      licenseType: ['', '', ''], 
    });
    setErrorMsg("");
  };

  return (
    <div>
      {/* Navbar */}
      <AdminNav page="students" />

      {/* Header Section */}
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
          <h1 className="fw-bold display-5 mb-3 mx-1">Student Management</h1>
          <h6 className="fs-6 lead opacity-90">
            Add, view, and manage student records for the driving school.
          </h6>
        </div>
      </section>

      {/* Main Content */}
      <div className="ms-auto" style={{ marginLeft: '250px', paddingTop: '40px' }}>
        <div className="py-5 bg-light">
          <div className="container">
            <div className="row g-4">
              {/* Add New Student Button */}
              <div className="col-12">
                <div className="card border-2 shadow-sm p-3">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                        <Plus size={64} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="mb-1 fw-bold">Add New Student</h3>
                        <small className="text-muted">Click below to register a new student</small>
                      </div>
                    </div>
                    <button
                      className="btn btn-primary w-100 text-start p-3 fs-5"
                      onClick={() => setShowModal(true)}
                    >
                      <Plus className="me-2" size={24} /> Add Student
                    </button>
                  </div>
                </div>
              </div>

              {/* Students Table Card */}
              <div className="col-12">
                <div className="card border-2 shadow-sm p-3">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-info bg-opacity-10 rounded-circle p-3 me-3">
                        <Users size={64} className="text-info" />
                      </div>
                      <div>
                        <h3 className="mb-1 fw-bold">Student List</h3>
                        <small className="text-muted">View and manage all students</small>
                      </div>
                    </div>
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th scope="col">Name</th>
                            <th scope="col">Email</th>
                            <th scope="col">Age</th>
                            <th scope="col">NIC</th>
                            <th scope="col">Level</th>
                            <th scope="col">License Type</th>
                            <th scope="col">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.map((student) => (
                            <tr key={student._id}>
                              <td>{student.name}</td>
                              <td>{student.email}</td>
                              <td>{student.age}</td>
                              <td>{student.nic}</td>
                              <td>{student.level}</td>
                              <td>{student.licenseType.join(', ')}</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-warning me-2"
                                  onClick={() => handleEditStudent(student._id)}
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleDeleteStudent(student._id)}
                                >
                                  <Trash2 size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add/Edit Student Modal */}
        <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showModal ? 'rgba(0,0,0,0.5)' : 'transparent' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editMode ? 'Edit Student' : 'Add New Student'}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <div className="d-flex flex-column gap-2">
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Name"
                    value={editMode ? editStudent.name : newStudent.name}
                    onChange={(e) => editMode ? setEditStudent({ ...editStudent, name: e.target.value }) : setNewStudent({ ...newStudent, name: e.target.value })}
                  />
                  <ErrorHandle for="name" error={errorMsg}/>
                  <input
                    type="email"
                    className="form-control mb-2"
                    placeholder="Email"
                    value={editMode ? editStudent.email : newStudent.email}
                    onChange={(e) => editMode ? setEditStudent({ ...editStudent, email: e.target.value }) : setNewStudent({ ...newStudent, email: e.target.value })}
                  />
                  <ErrorHandle for="email" error={errorMsg}/>
                  <input
                    type="number"
                    className="form-control mb-2"
                    placeholder="Age"
                    value={editMode ? editStudent.age : newStudent.age}
                    onChange={(e) => editMode ? setEditStudent({ ...editStudent, age: e.target.value }) : setNewStudent({ ...newStudent, age: e.target.value })}
                  />
                  <ErrorHandle for="age" error={errorMsg}/>
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="NIC"
                    value={editMode ? editStudent.nic : newStudent.nic}
                    onChange={(e) => editMode ? setEditStudent({ ...editStudent, nic: e.target.value }) : setNewStudent({ ...newStudent, nic: e.target.value })}
                  />
                  <ErrorHandle for="nic" error={errorMsg}/>
                  {editMode && (
                    <input
                      type="password"
                      className="form-control mb-2"
                      placeholder="Password (not editable)"
                      value=""
                      disabled
                    />
                  )}
                  {!editMode && (
                    <input
                      type="password"
                      className="form-control mb-2"
                      placeholder="Password"
                      value={newStudent.password}
                      onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                    />
                  )}
                  <ErrorHandle for="password" error={errorMsg}/>
                  <select
                    className="form-control mb-2"
                    value={editMode ? editStudent.level : newStudent.level}
                    onChange={(e) => editMode ? setEditStudent({ ...editStudent, level: e.target.value }) : setNewStudent({ ...newStudent, level: e.target.value })}
                  >
                    <option value="">Select Level</option>
                    <option value="1">Level 1</option>
                    <option value="2">Level 2</option>
                    <option value="3">Level 3</option>
                  </select>
                  <select
                    className="form-control mb-2"
                    value={editMode ? editStudent.licenseType[0] || '' : newStudent.licenseType[0] || ''}
                    onChange={(e) => {
                      const updatedLicenseType = [...(editMode ? editStudent.licenseType : newStudent.licenseType)];
                      updatedLicenseType[0] = e.target.value;
                      editMode ? setEditStudent({ ...editStudent, licenseType: updatedLicenseType }) : setNewStudent({ ...newStudent, licenseType: updatedLicenseType });
                    }}
                  >
                    <option value="">Select Vehicle 1</option>
                    <option value="Car">Car</option>
                    <option value="Bike">Bike</option>
                    <option value="Three-Wheel">Three-Wheel</option>
                    <option value="Van">Van</option>
                  </select>
                  <select
                    className="form-control mb-2"
                    value={editMode ? editStudent.licenseType[1] || '' : newStudent.licenseType[1] || ''}
                    onChange={(e) => {
                      const updatedLicenseType = [...(editMode ? editStudent.licenseType : newStudent.licenseType)];
                      updatedLicenseType[1] = e.target.value;
                      editMode ? setEditStudent({ ...editStudent, licenseType: updatedLicenseType }) : setNewStudent({ ...newStudent, licenseType: updatedLicenseType });
                    }}
                  >
                    <option value="">Select Vehicle 2</option>
                    <option value="Car">Car</option>
                    <option value="Bike">Bike</option>
                    <option value="Three-Wheel">Three-Wheel</option>
                    <option value="Van">Van</option>
                  </select>
                  <select
                    className="form-control mb-2"
                    value={editMode ? editStudent.licenseType[2] || '' : newStudent.licenseType[2] || ''}
                    onChange={(e) => {
                      const updatedLicenseType = [...(editMode ? editStudent.licenseType : newStudent.licenseType)];
                      updatedLicenseType[2] = e.target.value;
                      editMode ? setEditStudent({ ...editStudent, licenseType: updatedLicenseType }) : setNewStudent({ ...newStudent, licenseType: updatedLicenseType });
                    }}
                  >
                    <option value="">Select Vehicle 3</option>
                    <option value="Car">Car</option>
                    <option value="Bike">Bike</option>
                    <option value="Three-Wheel">Three-Wheel</option>
                    <option value="Van">Van</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
                {editMode ? (
                  <button type="button" className="btn btn-primary" onClick={handleSaveEdit}>Save Changes</button>
                ) : (
                  <button type="button" className="btn btn-primary" onClick={handleAddStudent}>Add Student</button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Confirm Delete Modal */}
        <div className={`modal fade ${showConfirmDelete ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showConfirmDelete ? 'rgba(0,0,0,0.5)' : 'transparent' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button type="button" className="btn-close" onClick={cancelDelete}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this student record? This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={cancelDelete}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={confirmDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;