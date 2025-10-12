import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Modal } from 'react-bootstrap';
import axios from 'axios';
import FinancialManagerNav from './FinancialManagerNav';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';

const SalaryManagement = () => {
  const [salaryPayments, setSalaryPayments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentPayment, setCurrentPayment] = useState({
    employeeId: '',
    month: new Date().toISOString().slice(0, 7), // YYYY-MM format
    totalHours: '',
    hourlyRate: '',
    salary: '',
    paidDate: '',
    status: 'Pending'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');

  const statusOptions = ['Pending', 'Paid', 'Cancelled'];
  const employeeRoles = ['instructor', 'financial_manager', 'receptionist', 'manager', 'officer'];

  useEffect(() => {
    // Check authentication
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'financial_manager') {
      window.location.href = '/login';
      return;
    }

    fetchSalaryPayments();
    fetchEmployees();
  }, []);

  const fetchSalaryPayments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3005/api/finance/payroll');
      console.log('Payroll response:', response.data); // Debug log
      setSalaryPayments(Array.isArray(response.data.data) ? response.data.data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching salary payments:', error);
      setSalaryPayments([]); // Set empty array on error
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:3005/api/finance/employees');
      console.log('Employees response:', response.data); // Debug log
      setEmployees(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setCurrentPayment({
      employeeId: '',
      month: new Date().toISOString().slice(0, 7), // YYYY-MM format
      totalHours: '',
      hourlyRate: '',
      salary: '',
      paidDate: '',
      status: 'Pending'
    });
    setIsEditing(false);
  };

  const handleModalShow = (payment = null) => {
    if (payment) {
      setCurrentPayment({
        ...payment,
        month: payment.month,
        paidDate: payment.paidDate ? new Date(payment.paidDate).toISOString().split('T')[0] : ''
      });
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updatedPayment = {
      ...currentPayment,
      [name]: value
    };

    // Calculate salary automatically when hours or rate changes
    if (name === 'totalHours' || name === 'hourlyRate') {
      const hours = name === 'totalHours' ? parseFloat(value) || 0 : parseFloat(currentPayment.totalHours) || 0;
      const rate = name === 'hourlyRate' ? parseFloat(value) || 0 : parseFloat(currentPayment.hourlyRate) || 0;
      updatedPayment.salary = (hours * rate).toFixed(2);
    }

    setCurrentPayment(updatedPayment);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payrollData = {
        employeeId: currentPayment.employeeId,
        month: currentPayment.month,
        totalHours: parseFloat(currentPayment.totalHours),
        hourlyRate: parseFloat(currentPayment.hourlyRate),
        paidDate: currentPayment.paidDate ? new Date(currentPayment.paidDate) : null,
        status: currentPayment.status
      };

      if (isEditing) {
        await axios.put(`http://localhost:3005/api/finance/payroll/${currentPayment._id}`, payrollData);
      } else {
        await axios.post('http://localhost:3005/api/finance/payroll', payrollData);
      }
      handleModalClose();
      fetchSalaryPayments();
    } catch (error) {
      console.error('Error saving salary payment:', error);
      alert('Error saving salary payment: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this salary payment?')) {
      try {
        await axios.delete(`http://localhost:3005/api/finance/payroll/${id}`);
        fetchSalaryPayments();
      } catch (error) {
        console.error('Error deleting salary payment:', error);
        alert('Error deleting salary payment: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const filteredPayments = salaryPayments.filter(payment => {
    const employeeName = payment.employeeId?.name || '';
    const employeeRole = payment.employeeId?.role || '';
    
    return (employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employeeRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.month.includes(searchTerm)) &&
           (filterStatus === '' || payment.status === filterStatus);
  });

  return (
    <div className="dashboard-container">
      <FinancialManagerNav />
      <Container fluid className="mt-4">
        <h2 className="mb-4">Employee Salary Payment</h2>
        
        <Row className="mb-4">
          <Col md={4}>
            <div className="d-flex">
              <Form.Control
                type="text"
                placeholder="Search by employee name, role, or month..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="me-2"
              />
              <Button variant="primary" className="d-flex align-items-center">
                <FaSearch className="me-1" /> Search
              </Button>
            </div>
          </Col>
          <Col md={3}>
            <Form.Select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Status</option>
              {statusOptions.map((status, index) => (
                <option key={index} value={status}>{status}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={5} className="text-end">
            <Button variant="success" onClick={() => handleModalShow()}>
              <FaPlus className="me-1" /> New Salary Payment
            </Button>
          </Col>
        </Row>
        
        {loading ? (
          <p>Loading salary payments...</p>
        ) : (
          <Card>
            <Card.Body>
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Employee</th>
                      <th>Role</th>
                      <th>Month</th>
                      <th>Hours</th>
                      <th>Rate (LKR)</th>
                      <th>Salary (LKR)</th>
                      <th>Paid Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.length > 0 ? (
                      filteredPayments.map((payment) => (
                        <tr key={payment._id}>
                          <td>{payment._id.substring(0, 8)}</td>
                          <td>{payment.employeeId?.name || 'Unknown Employee'}</td>
                          <td>
                            <span className="badge bg-info">
                              {payment.employeeId?.role || 'No Role'}
                            </span>
                          </td>
                          <td>{payment.month}</td>
                          <td>{payment.totalHours}</td>
                          <td>{payment.hourlyRate.toLocaleString()}</td>
                          <td>{payment.salary.toLocaleString()}</td>
                          <td>
                            {payment.paidDate ? 
                              new Date(payment.paidDate).toLocaleDateString() : 
                              'Not Paid'
                            }
                          </td>
                          <td>
                            <span className={`badge ${
                              payment.status === 'Paid' ? 'bg-success' : 
                              payment.status === 'Pending' ? 'bg-warning' : 'bg-danger'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                          <td>
                            <Button variant="primary" size="sm" className="me-1" onClick={() => handleModalShow(payment)}>
                              <FaEdit />
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => handleDelete(payment._id)}>
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="10" className="text-center">No salary payments found</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}
        
        {/* Salary Payment Form Modal */}
        <Modal show={showModal} onHide={handleModalClose} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>{isEditing ? 'Edit Salary Payment' : 'Add New Salary Payment'}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Employee *</Form.Label>
                    <Form.Select
                      name="employeeId"
                      value={currentPayment.employeeId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Employee</option>
                      {employees.map((employee) => (
                        <option key={employee._id} value={employee._id}>
                          {employee.name} ({employee.role})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Month *</Form.Label>
                    <Form.Control
                      type="month"
                      name="month"
                      value={currentPayment.month}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Total Hours *</Form.Label>
                    <Form.Control
                      type="number"
                      name="totalHours"
                      value={currentPayment.totalHours}
                      onChange={handleInputChange}
                      min="0"
                      step="0.1"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Hourly Rate (LKR) *</Form.Label>
                    <Form.Control
                      type="number"
                      name="hourlyRate"
                      value={currentPayment.hourlyRate}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Calculated Salary (LKR)</Form.Label>
                    <Form.Control
                      type="text"
                      value={currentPayment.salary ? `LKR ${parseFloat(currentPayment.salary).toLocaleString()}` : 'LKR 0'}
                      readOnly
                      className="bg-light"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Paid Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="paidDate"
                      value={currentPayment.paidDate}
                      onChange={handleInputChange}
                    />
                    <Form.Text className="text-muted">
                      Leave empty if not yet paid
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status *</Form.Label>
                    <Form.Select
                      name="status"
                      value={currentPayment.status}
                      onChange={handleInputChange}
                      required
                    >
                      {statusOptions.map((status, index) => (
                        <option key={index} value={status}>{status}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleModalClose}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {isEditing ? 'Update' : 'Save'} Salary Payment
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </div>
  );
};

export default SalaryManagement;