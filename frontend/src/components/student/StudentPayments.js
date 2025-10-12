import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Alert, Modal } from 'react-bootstrap';
import axios from 'axios';
import { FaPlus, FaCreditCard, FaMoneyBillWave, FaUniversity, FaEye, FaCalendarAlt } from 'react-icons/fa';
import StudentNav from './StudentNav';

function StudentPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'Cash',
    description: '',
    status: 'Paid'
  });

  const paymentMethods = [
    { value: 'Cash', icon: FaMoneyBillWave, label: 'Cash' },
    { value: 'Card', icon: FaCreditCard, label: 'Card' },
    { value: 'Bank Transfer', icon: FaUniversity, label: 'Bank Transfer' }
  ];

  const statusOptions = ['Paid', 'Pending', 'Failed'];

  useEffect(() => {
    // Check authentication and get student data
    const userId = localStorage.getItem('userId');
    if (!userId) {
      window.location.href = '/login';
      return;
    }
    
    const fetchStudentData = async () => {
      try {
        // First fetch the student data for authentication
        await axios.get(`http://localhost:3001/student/getUser/${userId}`);
        
        // Then fetch the payments
        const paymentsResponse = await axios.get(`http://localhost:3001/student/getPayments/${userId}`);
        setPayments(Array.isArray(paymentsResponse.data) ? paymentsResponse.data : []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching student data:', error);
        setPayments([]);
        setLoading(false);
        showAlertMessage('Error fetching data. Please try again.', 'danger');
      }
    };
    
    fetchStudentData();
  }, []);

  const refetchPayments = async () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3001/student/getPayments/${userId}`);
        setPayments(Array.isArray(response.data) ? response.data : []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching student payments:', error);
        setPayments([]);
        setLoading(false);
        showAlertMessage('Error fetching payments. Please try again.', 'danger');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData({
      ...paymentData,
      [name]: name === 'amount' ? parseFloat(value) || '' : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const userId = localStorage.getItem('userId');
    if (!userId) {
      showAlertMessage('Student information not found. Please login again.', 'danger');
      return;
    }

    try {
      const paymentPayload = {
        studentId: userId,
        amount: parseFloat(paymentData.amount),
        paymentMethod: paymentData.paymentMethod,
        description: paymentData.description,
        status: paymentData.status,
        paymentDate: new Date()
      };

      const response = await axios.post('http://localhost:3001/student/addPayment', paymentPayload);
      
      if (response.status === 201 || response.status === 200) {
        showAlertMessage('Payment added successfully!', 'success');
        setShowModal(false);
        resetForm();
        refetchPayments();
      }
    } catch (error) {
      console.error('Error adding payment:', error);
      const errorMessage = error.response?.data?.error || 'Error adding payment. Please try again.';
      showAlertMessage(errorMessage, 'danger');
    }
  };

  const resetForm = () => {
    setPaymentData({
      amount: '',
      paymentMethod: 'Cash',
      description: '',
      status: 'Paid'
    });
  };

  const showAlertMessage = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };

  const handleModalClose = () => {
    setShowModal(false);
    resetForm();
  };

  const getTotalPaid = () => {
    return payments
      .filter(payment => payment.status === 'Paid')
      .reduce((total, payment) => total + payment.amount, 0);
  };

  const getPendingAmount = () => {
    return payments
      .filter(payment => payment.status === 'Pending')
      .reduce((total, payment) => total + payment.amount, 0);
  };

  return (
    <div>
      <StudentNav page="payments" />
      <Container fluid className="mt-4" style={{ paddingTop: '80px' }}>
        <Row>
          <Col>
            <h2 className="mb-4">
              <FaMoneyBillWave className="me-2 text-success" />
              My Payments
            </h2>
          </Col>
        </Row>

      {showAlert && (
        <Alert variant={alertType} dismissible onClose={() => setShowAlert(false)}>
          {alertMessage}
        </Alert>
      )}

      {/* Payment Summary Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="border-success">
            <Card.Body className="text-center">
              <FaMoneyBillWave className="text-success mb-2" size={30} />
              <h5 className="text-success">Total Paid</h5>
              <h3>LKR {getTotalPaid().toLocaleString()}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-warning">
            <Card.Body className="text-center">
              <FaCalendarAlt className="text-warning mb-2" size={30} />
              <h5 className="text-warning">Pending</h5>
              <h3>LKR {getPendingAmount().toLocaleString()}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-primary">
            <Card.Body className="text-center">
              <FaEye className="text-primary mb-2" size={30} />
              <h5 className="text-primary">Total Payments</h5>
              <h3>{payments.length}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add Payment Button */}
      <Row className="mb-4">
        <Col className="text-end">
          <Button 
            variant="success" 
            size="lg"
            onClick={() => setShowModal(true)}
          >
            <FaPlus className="me-2" />
            Add New Payment
          </Button>
        </Col>
      </Row>

      {/* Payments Table */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Payment History</h5>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading payments...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead className="table-dark">
                  <tr>
                    <th>Date</th>
                    <th>Amount (LKR)</th>
                    <th>Payment Method</th>
                    <th>Description</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length > 0 ? (
                    payments.map((payment) => (
                      <tr key={payment._id}>
                        <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                        <td className="fw-bold">LKR {payment.amount.toLocaleString()}</td>
                        <td>
                          <span className="d-flex align-items-center">
                            {payment.paymentMethod === 'Cash' && <FaMoneyBillWave className="me-2 text-success" />}
                            {payment.paymentMethod === 'Card' && <FaCreditCard className="me-2 text-primary" />}
                            {payment.paymentMethod === 'Bank Transfer' && <FaUniversity className="me-2 text-info" />}
                            {payment.paymentMethod}
                          </span>
                        </td>
                        <td>{payment.description || 'No description'}</td>
                        <td>
                          <span className={`badge ${
                            payment.status === 'Paid' ? 'bg-success' : 
                            payment.status === 'Pending' ? 'bg-warning text-dark' : 'bg-danger'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        <div className="text-muted">
                          <FaMoneyBillWave size={50} className="mb-3 opacity-50" />
                          <p>No payments found. Add your first payment!</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add Payment Modal */}
      <Modal show={showModal} onHide={handleModalClose} size="lg">
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>
            <FaPlus className="me-2" />
            Add New Payment
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    <FaMoneyBillWave className="me-2 text-success" />
                    Amount (LKR) *
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="amount"
                    value={paymentData.amount}
                    onChange={handleInputChange}
                    placeholder="Enter amount"
                    min="0"
                    step="0.01"
                    required
                    size="lg"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Payment Method *</Form.Label>
                  <Form.Select
                    name="paymentMethod"
                    value={paymentData.paymentMethod}
                    onChange={handleInputChange}
                    required
                    size="lg"
                  >
                    {paymentMethods.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={paymentData.description}
                onChange={handleInputChange}
                placeholder="Enter payment description (optional)"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Status *</Form.Label>
              <Form.Select
                name="status"
                value={paymentData.status}
                onChange={handleInputChange}
                required
                size="lg"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Card Payment Button */}
            {paymentData.paymentMethod === 'Card' && (
              <div className="my-3">
                <Button variant="primary" size="lg" onClick={() => {
                  setShowModal(false);
                  window.location.href = '/Student/Payments/Card';
                }}>
                  <FaCreditCard className="me-2" />
                  Pay with Card (Visa/MasterCard)
                </Button>
              </div>
            )}

            <div className="bg-light p-3 rounded">
              <h6 className="text-muted mb-2">Payment Summary:</h6>
              <div className="d-flex justify-content-between">
                <span>Amount:</span>
                <strong>LKR {paymentData.amount ? parseFloat(paymentData.amount).toLocaleString() : '0'}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Method:</span>
                <strong>{paymentData.paymentMethod}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Status:</span>
                <span className={`badge ${
                  paymentData.status === 'Paid' ? 'bg-success' : 
                  paymentData.status === 'Pending' ? 'bg-warning text-dark' : 'bg-danger'
                }`}>
                  {paymentData.status}
                </span>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button variant="success" type="submit" size="lg">
              <FaPlus className="me-2" />
              Add Payment
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
    </div>
  );
}

export default StudentPayments;