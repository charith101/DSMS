import React, { useState } from 'react';
import { Card, Button, Table, Modal, Input, Select } from '../../components/shared';

/**
 * Invoice Management Page - Create, view, and manage invoices
 */
const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState([
    {
      id: 'INV-001',
      studentName: 'John Doe',
      studentEmail: 'john@example.com',
      amount: 500,
      description: 'Basic Package - 10 Driving Lessons',
      dueDate: '2024-02-15',
      status: 'pending',
      createdDate: '2024-01-15',
      sentDate: '2024-01-15'
    },
    {
      id: 'INV-002',
      studentName: 'Jane Smith',
      studentEmail: 'jane@example.com',
      amount: 100,
      description: 'Additional Lesson',
      dueDate: '2024-02-10',
      status: 'paid',
      createdDate: '2024-01-10',
      sentDate: '2024-01-10'
    },
    {
      id: 'INV-003',
      studentName: 'Mike Johnson',
      studentEmail: 'mike@example.com',
      amount: 900,
      description: 'Premium Package - 20 Driving Lessons',
      dueDate: '2024-02-20',
      status: 'overdue',
      createdDate: '2024-01-05',
      sentDate: '2024-01-05'
    }
  ]);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    studentId: '',
    studentName: '',
    studentEmail: '',
    amount: '',
    description: '',
    dueDate: ''
  });
  
  const students = [
    { value: '1', label: 'John Doe', email: 'john@example.com' },
    { value: '2', label: 'Jane Smith', email: 'jane@example.com' },
    { value: '3', label: 'Mike Johnson', email: 'mike@example.com' },
    { value: '4', label: 'Sarah Wilson', email: 'sarah@example.com' }
  ];
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'table-badge-warning', text: 'Pending' },
      paid: { class: 'table-badge-success', text: 'Paid' },
      overdue: { class: 'table-badge-error', text: 'Overdue' },
      cancelled: { class: 'table-badge', text: 'Cancelled' }
    };
    
    const config = statusConfig[status] || { class: 'table-badge', text: status };
    return <span className={`table-badge ${config.class}`}>{config.text}</span>;
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewInvoice(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Auto-fill student details when student is selected
    if (name === 'studentId') {
      const selectedStudent = students.find(s => s.value === value);
      if (selectedStudent) {
        setNewInvoice(prev => ({
          ...prev,
          studentName: selectedStudent.label,
          studentEmail: selectedStudent.email
        }));
      }
    }
  };
  
  const handleCreateInvoice = (e) => {
    e.preventDefault();
    
    const invoice = {
      id: `INV-${String(invoices.length + 1).padStart(3, '0')}`,
      ...newInvoice,
      status: 'pending',
      createdDate: new Date().toISOString().split('T')[0],
      sentDate: new Date().toISOString().split('T')[0]
    };
    
    setInvoices(prev => [invoice, ...prev]);
    setNewInvoice({
      studentId: '',
      studentName: '',
      studentEmail: '',
      amount: '',
      description: '',
      dueDate: ''
    });
    setShowCreateModal(false);
  };
  
  const sendInvoice = (invoice) => {
    // Mock sending invoice
    console.log('Sending invoice:', invoice.id);
    // In a real app, this would send an email
  };
  
  const downloadInvoice = (invoice) => {
    // Mock download
    console.log('Downloading invoice:', invoice.id);
    // In a real app, this would generate and download a PDF
  };
  
  const markAsPaid = (invoiceId) => {
    setInvoices(prev => 
      prev.map(invoice => 
        invoice.id === invoiceId 
          ? { ...invoice, status: 'paid' }
          : invoice
      )
    );
  };
  
  const columns = [
    {
      key: 'id',
      title: 'Invoice ID',
      render: (value) => (
        <span className="font-mono text-sm font-medium">
          {value}
        </span>
      )
    },
    {
      key: 'studentName',
      title: 'Student',
      render: (value, invoice) => (
        <div>
          <div className="font-medium text-sm">{value}</div>
          <div className="text-xs text-secondary">{invoice.studentEmail}</div>
        </div>
      )
    },
    {
      key: 'description',
      title: 'Description',
      render: (value) => (
        <span className="text-sm">{value}</span>
      )
    },
    {
      key: 'amount',
      title: 'Amount',
      render: (value) => (
        <span className="font-semibold">
          {formatAmount(value)}
        </span>
      )
    },
    {
      key: 'dueDate',
      title: 'Due Date',
      render: (value) => formatDate(value)
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, invoice) => (
        <div className="table-actions">
          <Button
            size="sm"
            variant="outline"
            onClick={() => sendInvoice(invoice)}
          >
            Send
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => downloadInvoice(invoice)}
          >
            Download
          </Button>
          {invoice.status === 'pending' && (
            <Button
              size="sm"
              variant="success"
              onClick={() => markAsPaid(invoice.id)}
            >
              Mark Paid
            </Button>
          )}
        </div>
      )
    }
  ];
  
  const pendingInvoices = invoices.filter(inv => inv.status === 'pending');
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');
  const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="content-header">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="content-title">Invoice Management</h1>
            <p className="content-description">
              Create, send, and manage student invoices.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
          >
            Create Invoice
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <Card.Body className="text-center">
            <div className="text-2xl font-bold text-primary-color mb-1">
              {invoices.length}
            </div>
            <div className="text-sm text-secondary">Total Invoices</div>
          </Card.Body>
        </Card>
        
        <Card>
          <Card.Body className="text-center">
            <div className="text-2xl font-bold text-warning-color mb-1">
              {pendingInvoices.length}
            </div>
            <div className="text-sm text-secondary">Pending</div>
          </Card.Body>
        </Card>
        
        <Card>
          <Card.Body className="text-center">
            <div className="text-2xl font-bold text-error-color mb-1">
              {overdueInvoices.length}
            </div>
            <div className="text-sm text-secondary">Overdue</div>
          </Card.Body>
        </Card>
        
        <Card>
          <Card.Body className="text-center">
            <div className="text-2xl font-bold text-success-color mb-1">
              {formatAmount(totalPending)}
            </div>
            <div className="text-sm text-secondary">Total Pending</div>
          </Card.Body>
        </Card>
      </div>
      
      {/* Invoices Table */}
      <Card>
        <Card.Header 
          title={`All Invoices (${invoices.length})`}
          actions={
            <Button variant="outline" size="sm">
              Export CSV
            </Button>
          }
        />
        <Card.Body className="p-0">
          <Table
            data={invoices}
            columns={columns}
            sortable
            striped
            responsive
            emptyMessage="No invoices found"
          />
        </Card.Body>
      </Card>
      
      {/* Create Invoice Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Invoice"
        size="lg"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              name="studentId"
              label="Select Student"
              value={newInvoice.studentId}
              onChange={handleInputChange}
              options={students.map(student => ({
                value: student.value,
                label: student.label
              }))}
              placeholder="Choose a student..."
              required
            />
            
            <Input
              name="studentEmail"
              label="Student Email"
              type="email"
              value={newInvoice.studentEmail}
              onChange={handleInputChange}
              placeholder="Auto-filled when student selected"
              readOnly
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="amount"
              label="Invoice Amount"
              type="number"
              step="0.01"
              min="0"
              value={newInvoice.amount}
              onChange={handleInputChange}
              placeholder="0.00"
              required
            />
            
            <Input
              name="dueDate"
              label="Due Date"
              type="date"
              value={newInvoice.dueDate}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <Input
            name="description"
            label="Description"
            value={newInvoice.description}
            onChange={handleInputChange}
            placeholder="e.g., Basic Package - 10 Driving Lessons"
            required
          />
          
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Invoice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InvoiceManagement;