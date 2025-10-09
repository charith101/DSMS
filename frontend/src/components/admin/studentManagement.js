import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import { Trash2, Plus, Users, Edit, Calendar, FileText } from 'lucide-react';
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
    licenseType: [],
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
    licenseType: [],
  });
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteStudentId, setDeleteStudentId] = useState(null);
  const [currentUser, setCurrentUser] = useState({ role: '' });
  const [showTimetableModal, setShowTimetableModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [timetables, setTimetables] = useState([]);

  useEffect(() => {
    setCurrentUser({ role: 'instructor' });
    axios
      .get('http://localhost:3001/student')
      .then((result) => {
        console.log('Fetched students:', result.data);
        if (Array.isArray(result.data)) {
          setStudents(result.data);
        } else {
          setErrorMsg('Invalid student data format from server.');
        }
      })
      .catch((err) => {
        console.error('Fetch students error:', err);
        setErrorMsg('Failed to fetch students. Please check the server.');
      });
  }, []);

  const handleAddStudent = () => {
    const cleanedStudent = {
      ...newStudent,
      licenseType: newStudent.licenseType.filter(type => type && type.trim() !== ''),
      role: 'student'
    };

    axios
      .post('http://localhost:3001/student/registerUser', cleanedStudent)
      .then((result) => {
        setStudents([...students, result.data]);
        setNewStudent({
          name: '',
          email: '',
          age: '',
          nic: '',
          password: '',
          level: '',
          licenseType: [],
          role: 'student',
        });
        setShowModal(false);
        setErrorMsg("");
      })
      .catch((err) => {
        console.error('Add student error:', err.response);
        if (err.response && err.response.status === 400) {
          setErrorMsg(err.response.data.error || 'Validation error occurred');
        } else if (err.response && err.response.status === 500) {
          setErrorMsg('Server error - please try again');
        } else {
          setErrorMsg("Something went wrong - check console for details");
        }
      });
  };

  const handleEditStudent = (id) => {
    if (currentUser.role !== 'instructor') {
      setErrorMsg("Only instructors can edit student records.");
      return;
    }
    const student = students.find((s) => s._id === id);
    if (!student) {
      setErrorMsg("Student not found.");
      return;
    }
    setEditStudent({
      name: student.name || '',
      email: student.email || '',
      age: student.age || '',
      nic: student.nic || '',
      level: student.level || '',
      licenseType: Array.isArray(student.licenseType) ? student.licenseType : [],
    });
    setEditStudentId(id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleSaveEdit = () => {
    if (currentUser.role !== 'instructor') {
      setErrorMsg("Only instructors can edit student records.");
      return;
    }
    const cleanedStudent = {
      ...editStudent,
      licenseType: editStudent.licenseType.filter(type => type && type.trim() !== ''),
    };

    axios
      .put(`http://localhost:3001/student/updateUser/${editStudentId}`, cleanedStudent)
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
          licenseType: [],
        });
        setShowModal(false);
        setErrorMsg("");
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          setErrorMsg(err.response.data.error || 'Validation error occurred');
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
      .catch((err) => {
        console.error('Delete student error:', err);
        setErrorMsg('Failed to delete student. Please try again.');
      });
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
      licenseType: [],
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
      licenseType: [],
    });
    setErrorMsg("");
  };

  const handleViewTimetables = (id) => {
    setSelectedStudentId(id);
    axios
      .get(`http://localhost:3001/student/getStudentTimeSlots/${id}`)
      .then((result) => {
        console.log('Timetable Data:', result.data);
        setTimetables(result.data);
      })
      .catch((err) => {
        console.error('Fetch timetables error:', err);
        setErrorMsg('Failed to fetch timetables. Please try again.');
      });
    setShowTimetableModal(true);
  };

  const handleCloseTimetableModal = () => {
    setShowTimetableModal(false);
    setSelectedStudentId(null);
    setTimetables([]);
  };

  const handleGenerateAllStudentsReport = () => {
    try {
      console.log('Generating PDF with students:', students);
      if (!Array.isArray(students) || students.length === 0) {
        setErrorMsg('No student data available to generate the report.');
        alert('No student data available to generate the report.');
        return;
      }

      const doc = new jsPDF();
      let yPos = 20;

      // Title
      doc.setFontSize(20);
      doc.text('Student List', 20, yPos);
      yPos += 15;

      // Column Headers
      doc.setFontSize(12);
      doc.text('Name', 20, yPos);
      doc.text('Email', 50, yPos);
      doc.text('Age', 100, yPos);
      doc.text('NIC', 120, yPos);
      doc.text('Level', 150, yPos);
      doc.text('License Type', 170, yPos);
      yPos += 10;
      doc.line(20, yPos, 190, yPos); // Horizontal line under headers
      yPos += 5;

      // Student Data
      doc.setFontSize(10);
      students.forEach((student, index) => {
        console.log(`Processing student ${index + 1}:`, student);
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        // Convert all fields to strings and handle undefined/null
        const name = String(student.name || 'N/A').substring(0, 25);
        const email = String(student.email || 'N/A').substring(0, 25);
        const age = String(student.age || 'N/A').substring(0, 10);
        const nic = String(student.nic || 'N/A').substring(0, 15);
        const level = String(student.level || 'N/A').substring(0, 10);
        const licenseType = Array.isArray(student.licenseType) && student.licenseType.length > 0
          ? student.licenseType.join(', ').substring(0, 20)
          : 'N/A';

        doc.text(name, 20, yPos);
        doc.text(email, 50, yPos);
        doc.text(age, 100, yPos);
        doc.text(nic, 120, yPos);
        doc.text(level, 150, yPos);
        doc.text(licenseType, 170, yPos);
        yPos += 7;
      });

      // Save PDF
      doc.save('student-list.pdf');
    } catch (err) {
      console.error('Error generating report:', err);
      setErrorMsg('Failed to generate report. Please check the console for details.');
      alert('Failed to generate report. Please check the console for details.');
    }
  };

  return (
    <div>
      <AdminNav page="students" />
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
            Manage student records for the driving school.
          </h6>
        </div>
      </section>
      <div className="ms-auto" style={{ marginLeft: '250px', paddingTop: '40px' }}>
        <div className="py-5 bg-light">
          <div className="container">
            <div className="row g-4">
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
                      className="btn btn-primary"
                      style={{ padding: '6px 12px', fontSize: '16px', maxWidth: '200px' }}
                      onClick={() => setShowModal(true)}
                    >
                      <Plus className="me-2" size={20} /> Add Student
                    </button>
                  </div>
                </div>
              </div>
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
                    {errorMsg && (
                      <div className="alert alert-danger" role="alert">
                        {errorMsg}
                      </div>
                    )}
                    <button
                      className="btn btn-secondary mb-3"
                      style={{ padding: '6px 12px', fontSize: '16px', maxWidth: '200px' }}
                      onClick={handleGenerateAllStudentsReport}
                    >
                      <FileText className="me-2" size={20} /> Generate PDF
                    </button>
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
                              <td>{Array.isArray(student.licenseType) ? student.licenseType.join(', ') : ''}</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-warning me-2"
                                  onClick={() => handleEditStudent(student._id)}
                                  disabled={currentUser.role !== 'instructor'}
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  className="btn btn-sm btn-danger me-2"
                                  onClick={() => handleDeleteStudent(student._id)}
                                >
                                  <Trash2 size={18} />
                                </button>
                                <button
                                  className="btn btn-sm btn-info"
                                  onClick={() => handleViewTimetables(student._id)}
                                >
                                  <Calendar size={18} />
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
        <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showModal ? 'rgba(0,0,0,0.5)' : 'transparent' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editMode ? 'Edit Student' : 'Add New Student'}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                {errorMsg && (
                  <div className="alert alert-danger" role="alert">
                    {errorMsg}
                  </div>
                )}
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
                    value={editMode ? (editStudent.licenseType[0] || '') : (newStudent.licenseType[0] || '')}
                    onChange={(e) => {
                      const currentLicenseType = editMode ? editStudent.licenseType : newStudent.licenseType;
                      const updatedLicenseType = [...(Array.isArray(currentLicenseType) ? currentLicenseType : [])];
                      updatedLicenseType[0] = e.target.value || '';
                      const cleanedLicenseType = updatedLicenseType.filter(type => type && type.trim() !== '');
                      if (editMode) {
                        setEditStudent({ ...editStudent, licenseType: cleanedLicenseType });
                      } else {
                        setNewStudent({ ...newStudent, licenseType: cleanedLicenseType });
                      }
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
                    value={editMode ? (editStudent.licenseType[1] || '') : (newStudent.licenseType[1] || '')}
                    onChange={(e) => {
                      const currentLicenseType = editMode ? editStudent.licenseType : newStudent.licenseType;
                      const updatedLicenseType = [...(Array.isArray(currentLicenseType) ? currentLicenseType : [])];
                      updatedLicenseType[1] = e.target.value || '';
                      const cleanedLicenseType = updatedLicenseType.filter(type => type && type.trim() !== '');
                      if (editMode) {
                        setEditStudent({ ...editStudent, licenseType: cleanedLicenseType });
                      } else {
                        setNewStudent({ ...newStudent, licenseType: cleanedLicenseType });
                      }
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
                    value={editMode ? (editStudent.licenseType[2] || '') : (newStudent.licenseType[2] || '')}
                    onChange={(e) => {
                      const currentLicenseType = editMode ? editStudent.licenseType : newStudent.licenseType;
                      const updatedLicenseType = [...(Array.isArray(currentLicenseType) ? currentLicenseType : [])];
                      updatedLicenseType[2] = e.target.value || '';
                      const cleanedLicenseType = updatedLicenseType.filter(type => type && type.trim() !== '');
                      if (editMode) {
                        setEditStudent({ ...editStudent, licenseType: cleanedLicenseType });
                      } else {
                        setNewStudent({ ...newStudent, licenseType: cleanedLicenseType });
                      }
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
        <div className={`modal fade ${showTimetableModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showTimetableModal ? 'rgba(0,0,0,0.5)' : 'transparent' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Student Timetables</h5>
                <button type="button" className="btn-close" onClick={handleCloseTimetableModal}></button>
              </div>
              <div className="modal-body">
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th scope="col">Start Time</th>
                        <th scope="col">End Time</th>
                        <th scope="col">Instructor</th>
                        <th scope="col">Vehicle Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timetables.map((timetable, index) => (
                        <tr key={index}>
                          <td>{timetable.startTime}</td>
                          <td>{timetable.endTime}</td>
                          <td>{timetable.instructorId?.name || 'N/A'}</td>
                          <td>{timetable.vehicleId?.type || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseTimetableModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;