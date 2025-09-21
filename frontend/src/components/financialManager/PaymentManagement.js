import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Modal } from 'react-bootstrap';
import axios from 'axios';
import FinancialManagerNav from './FinancialManagerNav';
import { FaPlus, FaEdit, FaSearch } from 'react-icons/fa';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentPayment, setCurrentPayment] = useState({
    studentId: '',
    amount: '',
    paymentMethod: 'cash',
    description: '',
    status: 'pending'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' });

  useEffect(() => {
    // Check authentication
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'financial_manager') {
      window.location.href = '/login';
      return;
    }

    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/finance/payments');
      setPayments(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setCurrentPayment({
      studentId: '',
      amount: '',
      paymentMethod: 'cash',
      description: '',
      status: 'pending'
    });
    setIsEditing(false);
  };

  const handleModalShow = (payment = null) => {
    if (payment) {
      setCurrentPayment(payment);
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentPayment({
      ...currentPayment,
      [name]: name === 'amount' ? parseFloat(value) || '' : value
    });
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
    }
    return null;
  };

  const sortedPayments = React.useMemo(() => {
    let sortableItems = [...payments];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [payments, sortConfig]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`/api/finance/payments/${currentPayment._id}`, currentPayment);
      } else {
        await axios.post('/api/finance/payments', currentPayment);
      }
      handleModalClose();
      fetchPayments();
    } catch (error) {
      console.error('Error saving payment:', error);
    }
  };

  const filteredPayments = payments.filter(payment => 
    payment.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <FinancialManagerNav />
      <Container fluid className="mt-4">
        <h2 className="mb-4">Student Fee Payment</h2>
        
        <Row className="mb-4">
          <Col md={6}>
            <div className="d-flex">
              <Form.Control
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="me-2"
              />
              <Button variant="primary" className="d-flex align-items-center">
                <FaSearch className="me-1" /> Search
              </Button>
            </div>
          </Col>
          <Col md={6} className="text-end">
            <Button variant="success" onClick={() => handleModalShow()}>
              <FaPlus className="me-1" /> New Payment
            </Button>
          </Col>
        </Row>
        
        {loading ? (
          <p>Loading payments...</p>
        ) : (
          <Card>
            <Card.Body>
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Student ID</th>
                      <th onClick={() => requestSort('studentName')}>
                        Student Name {getSortIndicator('studentName')}
                      </th>
                      <th onClick={() => requestSort('date')}>
                        Payment Date {getSortIndicator('date')}
                      </th>
                      <th onClick={() => requestSort('amount')}>
                        Payment Amount {getSortIndicator('amount')}
                      </th>
                      <th>Payment Method</th>
                      <th>Transaction Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.length > 0 ? (
                      filteredPayments.map((payment) => (
                        <tr key={payment._id}>
                          <td>{payment._id.substring(0, 8)}</td>
                          <td>{payment.studentId}</td>
                          <td>{new Date(payment.date).toLocaleDateString()}</td>
                          <td>Rs. {payment.amount.toLocaleString()}</td>
                          <td>{payment.paymentMethod}</td>
                          <td>{payment.description}</td>
                          <td>
                            <span className={`badge ${payment.status === 'completed' ? 'bg-success' : payment.status === 'pending' ? 'bg-warning' : 'bg-danger'}`}>
                              {payment.status}
                            </span>
                          </td>
                          <td>
                            <Button variant="primary" size="sm" onClick={() => handleModalShow(payment)}>
                              <FaEdit /> Edit
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center">No payments found</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}
        
        {/* Payment Form Modal */}
        <Modal show={showModal} onHide={handleModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>{isEditing ? 'Edit Payment' : 'Add New Payment'}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Student ID</Form.Label>
                <Form.Control
                  type="text"
                  name="studentId"
                  value={currentPayment.studentId}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Amount (Rs.)</Form.Label>
                <Form.Control
                  type="number"
                  name="amount"
                  value={currentPayment.amount}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Payment Method</Form.Label>
                <Form.Select
                  name="paymentMethod"
                  value={currentPayment.paymentMethod}
                  onChange={handleInputChange}
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="online">Online Payment</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={currentPayment.description}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={currentPayment.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </Form.Select>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleModalClose}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {isEditing ? 'Update' : 'Save'} Payment
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </div>
  );
};

export default PaymentManagement;