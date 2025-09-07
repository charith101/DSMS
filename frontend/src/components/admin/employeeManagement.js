import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Plus, Users, Edit } from 'lucide-react';
import AdminNav from './AdminNav';
import ErrorHandle from "../errorHandle";

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    age: '',
    nic: '',
    password: '',
    role: 'receptionist', // Default role, can be changed to 'instructor'
  });
  const [editMode, setEditMode] = useState(false);
  const [editEmployeeId, setEditEmployeeId] = useState(null);
  const [editEmployee, setEditEmployee] = useState({
    name: '',
    email: '',
    age: '',
    nic: '',
  });
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteEmployeeId, setDeleteEmployeeId] = useState(null);

  useEffect(() => {
    axios
      .get('http://localhost:3001/employee')
      .then((result) => setEmployees(result.data))
      .catch((err) => console.log(err));
  }, []);

  const handleAddEmployee = () => {
    axios
      .post('http://localhost:3001/employee/registerEmployee', newEmployee)
      .then((result) => {
        setEmployees([...employees, result.data]);
        setNewEmployee({
          name: '',
          email: '',
          age: '',
          nic: '',
          password: '',
          role: 'receptionist',
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

  const handleEditEmployee = (id) => {
    const employee = employees.find((e) => e._id === id);
    setEditEmployee({
      name: employee.name,
      email: employee.email,
      age: employee.age,
      nic: employee.nic,
    });
    setEditEmployeeId(id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleSaveEdit = () => {
    axios
      .put(`http://localhost:3001/employee/updateEmployee/${editEmployeeId}`, editEmployee)
      .then((result) => {
        setEmployees(employees.map((e) => (e._id === editEmployeeId ? result.data : e)));
        setEditMode(false);
        setEditEmployeeId(null);
        setEditEmployee({
          name: '',
          email: '',
          age: '',
          nic: '',
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

  const handleDeleteEmployee = (id) => {
    setDeleteEmployeeId(id);
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    axios
      .delete(`http://localhost:3001/employee/deleteEmployee/${deleteEmployeeId}`)
      .then(() => setEmployees(employees.filter((e) => e._id !== deleteEmployeeId)))
      .catch((err) => console.log(err));
    setShowConfirmDelete(false);
    setDeleteEmployeeId(null);
  };

  const cancelDelete = () => {
    setShowConfirmDelete(false);
    setDeleteEmployeeId(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewEmployee({
      name: '',
      email: '',
      age: '',
      nic: '',
      password: '',
      role: 'receptionist',
    });
    setEditMode(false);
    setEditEmployeeId(null);
    setEditEmployee({
      name: '',
      email: '',
      age: '',
      nic: '',
    });
    setErrorMsg("");
  };

  return (
    <div>
      {/* Navbar */}
      <AdminNav page="employees" />

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
          <h1 className="fw-bold display-5 mb-3 mx-1">Employee Management</h1>
          <h6 className="fs-6 lead opacity-90">
            Manage employee records for the driving school.
          </h6>
        </div>
      </section>

      {/* Main Content */}
      <div className="ms-auto" style={{ marginLeft: '250px', paddingTop: '40px' }}>
        <div className="py-5 bg-light">
          <div className="container">
            <div className="row g-4">
              {/* Add New Employee Button */}
              <div className="col-12">
                <div className="card border-2 shadow-sm p-3">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                        <Plus size={64} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="mb-1 fw-bold">Add New Employee</h3>
                        <small className="text-muted">Click below to register a new employee</small>
                      </div>
                    </div>
                    <button
                      className="btn btn-primary"
                      style={{ padding: '6px 12px', fontSize: '16px', maxWidth: '200px' }}
                      onClick={() => setShowModal(true)}
                    >
                      <Plus className="me-2" size={20} /> Add Employee
                    </button>
                  </div>
                </div>
              </div>

              {/* Employees Table Card */}
              <div className="col-12">
                <div className="card border-2 shadow-sm p-3">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-info bg-opacity-10 rounded-circle p-3 me-3">
                        <Users size={64} className="text-info" />
                      </div>
                      <div>
                        <h3 className="mb-1 fw-bold">Employee List</h3>
                        <small className="text-muted">View and manage all employees</small>
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
                            <th scope="col">Role</th>
                            <th scope="col">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {employees.map((employee) => (
                            <tr key={employee._id}>
                              <td>{employee.name}</td>
                              <td>{employee.email}</td>
                              <td>{employee.age}</td>
                              <td>{employee.nic}</td>
                              <td>{employee.role}</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-warning me-2"
                                  onClick={() => handleEditEmployee(employee._id)}
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleDeleteEmployee(employee._id)}
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

        {/* Add/Edit Employee Modal */}
        <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showModal ? 'rgba(0,0,0,0.5)' : 'transparent' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editMode ? 'Edit Employee' : 'Add New Employee'}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <div className="d-flex flex-column gap-2">
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Name"
                    value={editMode ? editEmployee.name : newEmployee.name}
                    onChange={(e) => editMode ? setEditEmployee({ ...editEmployee, name: e.target.value }) : setNewEmployee({ ...newEmployee, name: e.target.value })}
                  />
                  <ErrorHandle for="name" error={errorMsg}/>
                  <input
                    type="email"
                    className="form-control mb-2"
                    placeholder="Email"
                    value={editMode ? editEmployee.email : newEmployee.email}
                    onChange={(e) => editMode ? setEditEmployee({ ...editEmployee, email: e.target.value }) : setNewEmployee({ ...newEmployee, email: e.target.value })}
                  />
                  <ErrorHandle for="email" error={errorMsg}/>
                  <input
                    type="number"
                    className="form-control mb-2"
                    placeholder="Age"
                    value={editMode ? editEmployee.age : newEmployee.age}
                    onChange={(e) => editMode ? setEditEmployee({ ...editEmployee, age: e.target.value }) : setNewEmployee({ ...newEmployee, age: e.target.value })}
                  />
                  <ErrorHandle for="age" error={errorMsg}/>
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="NIC"
                    value={editMode ? editEmployee.nic : newEmployee.nic}
                    onChange={(e) => editMode ? setEditEmployee({ ...editEmployee, nic: e.target.value }) : setNewEmployee({ ...newEmployee, nic: e.target.value })}
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
                      value={newEmployee.password}
                      onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                    />
                  )}
                  <ErrorHandle for="password" error={errorMsg}/>
                  <select
                    className="form-control mb-2"
                    value={newEmployee.role}
                    onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                    disabled={editMode} // Disable role change during edit
                  >
                    <option value="receptionist">Receptionist</option>
                    <option value="instructor">Instructor</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
                {editMode ? (
                  <button type="button" className="btn btn-primary" onClick={handleSaveEdit}>Save Changes</button>
                ) : (
                  <button type="button" className="btn btn-primary" onClick={handleAddEmployee}>Add Employee</button>
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
                <p>Are you sure you want to delete this employee record? This action cannot be undone.</p>
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

export default EmployeeManagement;