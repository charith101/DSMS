import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Input, Select } from '../../components/shared';
import { usePayment } from '../../contexts/PaymentContext';

/**
 * Payment History Page - View all past payments and download receipts
 */
const PaymentHistory = () => {
  const { paymentHistory, loadPaymentHistory, isLoading } = usePayment();
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    method: 'all',
    dateFrom: '',
    dateTo: ''
  });
  
  useEffect(() => {
    // Load payment history when component mounts
    loadPaymentHistory('1'); // Current user ID
  }, [loadPaymentHistory]);
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      method: 'all',
      dateFrom: '',
      dateTo: ''
    });
  };
  
  // Filter the payment history based on current filters
  const filteredHistory = paymentHistory.filter(payment => {
    const matchesSearch = filters.search === '' || 
      payment.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      payment.id.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || payment.status === filters.status;
    const matchesMethod = filters.method === 'all' || payment.method === filters.method;
    
    // Date filtering would be implemented here
    // const matchesDate = ...
    
    return matchesSearch && matchesStatus && matchesMethod;
  });
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      completed: { class: 'table-badge-success', text: 'Completed' },
      pending: { class: 'table-badge-warning', text: 'Pending' },
      failed: { class: 'table-badge-error', text: 'Failed' },
      refunded: { class: 'table-badge-info', text: 'Refunded' }
    };
    
    const config = statusConfig[status] || { class: 'table-badge', text: status };
    return <span className={`table-badge ${config.class}`}>{config.text}</span>;
  };
  
  const getMethodDisplay = (method) => {
    const methods = {
      credit_card: 'Credit Card',
      debit_card: 'Debit Card',
      cash: 'Cash',
      bank_transfer: 'Bank Transfer'
    };
    return methods[method] || method;
  };
  
  const downloadReceipt = (payment) => {
    // Mock receipt download
    console.log('Downloading receipt for payment:', payment.id);
    // In a real app, this would trigger a PDF download
  };
  
  const columns = [
    {
      key: 'id',
      title: 'Transaction ID',
      render: (value) => (
        <span className="font-mono text-sm text-secondary">
          {value}
        </span>
      )
    },
    {
      key: 'transactionDate',
      title: 'Date',
      render: (value) => formatDate(value)
    },
    {
      key: 'description',
      title: 'Description'
    },
    {
      key: 'method',
      title: 'Method',
      render: (value) => getMethodDisplay(value)
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
      key: 'status',
      title: 'Status',
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, payment) => (
        <div className="table-actions">
          <Button
            size="sm"
            variant="outline"
            onClick={() => downloadReceipt(payment)}
          >
            Receipt
          </Button>
        </div>
      )
    }
  ];
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="content-header">
        <h1 className="content-title">Payment History</h1>
        <p className="content-description">
          View all your past payments and download receipts.
        </p>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <Card.Body className="text-center">
            <div className="text-2xl font-bold text-primary-color mb-1">
              {paymentHistory.length}
            </div>
            <div className="text-sm text-secondary">Total Payments</div>
          </Card.Body>
        </Card>
        
        <Card>
          <Card.Body className="text-center">
            <div className="text-2xl font-bold text-success-color mb-1">
              {paymentHistory.filter(p => p.status === 'completed').length}
            </div>
            <div className="text-sm text-secondary">Completed</div>
          </Card.Body>
        </Card>
        
        <Card>
          <Card.Body className="text-center">
            <div className="text-2xl font-bold text-warning-color mb-1">
              {paymentHistory.filter(p => p.status === 'pending').length}
            </div>
            <div className="text-sm text-secondary">Pending</div>
          </Card.Body>
        </Card>
        
        <Card>
          <Card.Body className="text-center">
            <div className="text-2xl font-bold text-primary-color mb-1">
              {formatAmount(
                paymentHistory
                  .filter(p => p.status === 'completed')
                  .reduce((sum, p) => sum + p.amount, 0)
              )}
            </div>
            <div className="text-sm text-secondary">Total Paid</div>
          </Card.Body>
        </Card>
      </div>
      
      {/* Filters */}
      <Card>
        <Card.Header title="Filter Payments" />
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              name="search"
              placeholder="Search by ID or description..."
              value={filters.search}
              onChange={handleFilterChange}
            />
            
            <Select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'completed', label: 'Completed' },
                { value: 'pending', label: 'Pending' },
                { value: 'failed', label: 'Failed' },
                { value: 'refunded', label: 'Refunded' }
              ]}
            />
            
            <Select
              name="method"
              value={filters.method}
              onChange={handleFilterChange}
              options={[
                { value: 'all', label: 'All Methods' },
                { value: 'credit_card', label: 'Credit Card' },
                { value: 'debit_card', label: 'Debit Card' },
                { value: 'cash', label: 'Cash' },
                { value: 'bank_transfer', label: 'Bank Transfer' }
              ]}
            />
            
            <Input
              name="dateFrom"
              type="date"
              placeholder="From date"
              value={filters.dateFrom}
              onChange={handleFilterChange}
            />
            
            <div className="flex gap-2">
              <Input
                name="dateTo"
                type="date"
                placeholder="To date"
                value={filters.dateTo}
                onChange={handleFilterChange}
              />
              <Button
                type="button"
                variant="outline"
                onClick={clearFilters}
              >
                Clear
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
      
      {/* Payment History Table */}
      <Card>
        <Card.Header 
          title={`Payment History (${filteredHistory.length})`}
          actions={
            <Button variant="outline" size="sm">
              Export CSV
            </Button>
          }
        />
        <Card.Body className="p-0">
          <Table
            data={filteredHistory}
            columns={columns}
            loading={isLoading}
            sortable
            striped
            responsive
            emptyMessage="No payments found matching your criteria"
          />
        </Card.Body>
      </Card>
    </div>
  );
};

export default PaymentHistory;