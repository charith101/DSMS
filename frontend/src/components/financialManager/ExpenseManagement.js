import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Modal } from 'react-bootstrap';
import axios from 'axios';
import FinancialManagerNav from './FinancialManagerNav';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFileExport } from 'react-icons/fa';

const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentExpense, setCurrentExpense] = useState({
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    paymentMethod: 'cash',
    status: 'completed'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');

  const expenseCategories = [
    'Salaries',
    'Utilities',
    'Rent',
    'Vehicle Maintenance',
    'Office Supplies',
    'Insurance',
    'Marketing',
    'Other'
  ];

  useEffect(() => {
    // Check authentication
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'financial_manager') {
      window.location.href = '/login';
      return;
    }

    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/finance/expenses');
      setExpenses(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setCurrentExpense({
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      paymentMethod: 'cash',
      status: 'completed'
    });
    setIsEditing(false);
  };

  const handleModalShow = (expense = null) => {
    if (expense) {
      setCurrentExpense({
        ...expense,
        date: new Date(expense.date).toISOString().split('T')[0]
      });
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentExpense({
      ...currentExpense,
      [name]: name === 'amount' ? parseFloat(value) || '' : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`/api/finance/expenses/${currentExpense._id}`, currentExpense);
      } else {
        await axios.post('/api/finance/expenses', currentExpense);
      }
      handleModalClose();
      fetchExpenses();
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await axios.delete(`/api/finance/expenses/${id}`);
        fetchExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const exportExpenses = () => {
    // Convert expenses to CSV
    const headers = ['ID', 'Category', 'Amount', 'Date', 'Description', 'Payment Method', 'Status'];
    const csvData = [
      headers.join(','),
      ...filteredExpenses.map(expense => [
        expense._id,
        expense.category,
        expense.amount,
        new Date(expense.date).toLocaleDateString(),
        `"${expense.description.replace(/"/g, '""')}"`,
        expense.paymentMethod,
        expense.status
      ].join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const filteredExpenses = expenses.filter(expense => 
    (expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterCategory === '' || expense.category === filterCategory)
  );

  return (
    <div className="dashboard-container">
      <FinancialManagerNav />
      <Container fluid className="mt-4">
        <h2 className="mb-4">Expense Management</h2>
        
        <Row className="mb-4">
          <Col md={4}>
            <div className="d-flex">
              <Form.Control
                type="text"
                placeholder="Search expenses..."
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
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {expenseCategories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={5} className="text-end">
            <Button variant="success" onClick={() => handleModalShow()} className="me-2">
              <FaPlus className="me-1" /> New Expense
            </Button>
            <Button variant="secondary" onClick={exportExpenses}>
              <FaFileExport className="me-1" /> Export
            </Button>
          </Col>
        </Row>
        
        {loading ? (
          <p>Loading expenses...</p>
        ) : (
          <Card>
            <Card.Body>
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Description</th>
                      <th>Payment Method</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.length > 0 ? (
                      filteredExpenses.map((expense) => (
                        <tr key={expense._id}>
                          <td>{expense._id.substring(0, 8)}</td>
                          <td>{expense.category}</td>
                          <td>{new Date(expense.date).toLocaleDateString()}</td>
                          <td>Rs. {expense.amount.toLocaleString()}</td>
                          <td>{expense.description}</td>
                          <td>{expense.paymentMethod}</td>
                          <td>
                            <span className={`badge ${expense.status === 'completed' ? 'bg-success' : expense.status === 'pending' ? 'bg-warning' : 'bg-danger'}`}>
                              {expense.status}
                            </span>
                          </td>
                          <td>
                            <Button variant="primary" size="sm" className="me-1" onClick={() => handleModalShow(expense)}>
                              <FaEdit />
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => handleDelete(expense._id)}>
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center">No expenses found</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}
        
        {/* Expense Form Modal */}
        <Modal show={showModal} onHide={handleModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>{isEditing ? 'Edit Expense' : 'Add New Expense'}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  name="category"
                  value={currentExpense.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Category</option>
                  {expenseCategories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Amount (Rs.)</Form.Label>
                <Form.Control
                  type="number"
                  name="amount"
                  value={currentExpense.amount}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={currentExpense.date}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={currentExpense.description}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Payment Method</Form.Label>
                <Form.Select
                  name="paymentMethod"
                  value={currentExpense.paymentMethod}
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
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={currentExpense.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleModalClose}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {isEditing ? 'Update' : 'Save'} Expense
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </div>
  );
};

export default ExpenseManagement;