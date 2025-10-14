import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Modal, Spinner } from 'react-bootstrap';
import axios from 'axios';
import FinancialManagerNav from './FinancialManagerNav';
import { FaPlus, FaEdit, FaSearch, FaTrash } from 'react-icons/fa';

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
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    // Check authentication
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'financial_manager') {
      window.location.href = '/login';
      return;
    }

    fetchPayments();
  }, []);

  //--------------------------------------------------------------------------------
  // fetch data from payment table in database to financial payment management page
  //--------------------------------------------------------------------------------

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3005/api/finance/payments');
      // Handle the API response structure where data is in response.data.data
      const paymentsData = response.data?.data || response.data || [];
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]); // Set empty array on error
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
    // Ensure payments is an array before spreading
    if (!Array.isArray(payments)) {
      return [];
    }
    let sortableItems = [...payments];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        // Handle object values (like populated studentId)
        if (typeof aVal === 'object' && aVal !== null) {
          aVal = aVal.name || aVal.email || aVal._id || '';
        }
        if (typeof bVal === 'object' && bVal !== null) {
          bVal = bVal.name || bVal.email || bVal._id || '';
        }
        
        // Ensure we have strings for comparison
        aVal = String(aVal || '').toLowerCase();
        bVal = String(bVal || '').toLowerCase();
        
        if (aVal < bVal) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aVal > bVal) {
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

  const handleDelete = async (paymentId) => {
    if (!paymentId) return;
    const ok = window.confirm('Are you sure you want to permanently delete this payment?');
    if (!ok) return;

    try {
  setDeletingId(paymentId);
  // Use the same backend base URL used for fetching payments
  await axios.delete(`http://localhost:3005/api/finance/payments/${paymentId}`);
      // Refresh list after deletion
      await fetchPayments();
    } catch (error) {
      console.error('Error deleting payment:', error);
      // Optionally show an alert to the user here
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPayments = Array.isArray(payments) ? payments.filter(payment => {
    try {
      // Handle both string studentId and populated studentId object
      let studentName = '';
      if (payment.studentId) {
        if (typeof payment.studentId === 'string') {
          studentName = payment.studentId;
        } else if (typeof payment.studentId === 'object') {
          studentName = payment.studentId.name || payment.studentId.email || payment.studentId._id || '';
        }
      }
      
      const description = payment.description || '';
      const searchTermLower = (searchTerm || '').toLowerCase();
      
      return (
        studentName.toLowerCase().includes(searchTermLower) ||
        description.toLowerCase().includes(searchTermLower)
      );
    } catch (error) {
      console.error('Error filtering payment:', payment, error);
      return false;
    }
  }) : [];

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
                      <th>Description</th>
                      <th>Transaction Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.length > 0 ? (
                      filteredPayments.map((payment) => {
                        return (
                          <tr key={payment._id}>
                            <td>{typeof payment.studentId === 'object' ? payment.studentId._id : payment.studentId}</td>
                            <td>{typeof payment.studentId === 'object' ? payment.studentId.name : 'N/A'}</td>
                            <td>{new Date(payment.paymentDate || payment.date).toLocaleDateString()}</td>
                            <td>LKR {payment.amount.toLocaleString()}</td>
                            <td>{payment.paymentMethod}</td>
                            <td>{payment.description}</td>
                            <td>
                              <span className={`badge ${payment.status === 'Paid' || payment.status === 'completed' ? 'bg-success' : payment.status === 'Pending' || payment.status === 'pending' ? 'bg-warning' : 'bg-danger'}`}>
                                {payment.status}
                              </span>
                            </td>
                            <td>
                              <Button
                                variant="primary"
                                size="sm"
                                className="me-2 p-1 d-inline-flex align-items-center justify-content-center"
                                onClick={() => handleModalShow(payment)}
                                aria-label="Edit payment"
                                style={{ fontSize: '0.9rem' }}
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(payment._id)}
                                disabled={deletingId === payment._id}
                                aria-label="Delete payment"
                                className="p-1 d-inline-flex align-items-center justify-content-center"
                                style={{ fontSize: '0.9rem' }}
                              >
                                {deletingId === payment._id ? (
                                  <Spinner animation="border" size="sm" />
                                ) : (
                                  <FaTrash />
                                )}
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center">No payments found</td>
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