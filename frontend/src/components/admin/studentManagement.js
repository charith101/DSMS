import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Plus, Users } from 'lucide-react';
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
    password: 12345,
    level: 1,
    licenseType: 'Car',
    role: 'student',
  });

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
          password: 12345,
          level: 1,
          licenseType: 'Car',
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

  const handleDeleteStudent = (id) => {
    axios
      .delete(`http://localhost:3001/student/deleteUser/${id}`)
      .then(() => setStudents(students.filter((s) => s._id !== id)))
      .catch((err) => console.log(err));
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewStudent({
      name: '',
      email: '',
      age: '',
      nic: '',
      password: 12345,
      level: 1,
      licenseType: 'Car',
      role: 'student',
    });
    setErrorMsg("");
  };

  return (
    <div>
      {/* Navbar */}
      <AdminNav />

      {/* Main Content */}
      <div className="ms-auto" style={{ marginLeft: '250px' }}>
        <section
          className="text-white pb-5"
          style={{ background: 'linear-gradient(135deg, #333 0%, #555 100%)', marginTop: '76px' }}
        >
          <div className="container py-5">
            <h1 className="fw-bold display-5 mb-3 mx-1">Student Management</h1>
            <h6 className="fs-6 lead opacity-90">
              Add, view, and manage student records for the driving school.
            </h6>
          </div>
        </section>

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
                              <td>
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

        {/* Add Student Modal */}
        <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showModal ? 'rgba(0,0,0,0.5)' : 'transparent' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Student</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <div className="d-flex flex-column gap-2">
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Name"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  />
                  <ErrorHandle for="name" error={errorMsg}/>
                  <input
                    type="email"
                    className="form-control mb-2"
                    placeholder="Email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  />
                  <ErrorHandle for="email" error={errorMsg}/>
                  <input
                    type="number"
                    className="form-control mb-2"
                    placeholder="Age"
                    value={newStudent.age}
                    onChange={(e) => setNewStudent({ ...newStudent, age: e.target.value })}
                  />
                  <ErrorHandle for="age" error={errorMsg}/>
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="NIC"
                    value={newStudent.nic}
                    onChange={(e) => setNewStudent({ ...newStudent, nic: e.target.value })}
                  />
                  <ErrorHandle for="nic" error={errorMsg}/>
                  
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
                <button type="button" className="btn btn-primary" onClick={handleAddStudent}>Add Student</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;