import React, { useState } from 'react';
import { Card, Button, Table, Modal, Input, Select } from '../../components/shared';

/**
 * Refund Processing Page - Handle refund requests and processing
 */
const RefundProcessing = () => {
  const [refunds, setRefunds] = useState([
    {
      id: 'REF-001',
      originalPaymentId: 'PAY-001',
      studentName: 'Mike Johnson',
      studentEmail: 'mike@example.com',
      originalAmount: 500,
      refundAmount: 200,
      reason: 'Package cancellation - partial refund',
      requestDate: '2024-01-20',
      status: 'pending',
      processedBy: null,
      processedDate: null
    },
    {
      id: 'REF-002',
      originalPaymentId: 'PAY-025',
      studentName: 'Sarah Wilson',
      studentEmail: 'sarah@example.com',
      originalAmount: 900,
      refundAmount: 900,
      reason: 'Instructor unavailability - full refund',
      requestDate: '2024-01-18',
      status: 'approved',
      processedBy: 'Admin',
      processedDate: '2024-01-19'
    },
    {
      id: 'REF-003',
      originalPaymentId: 'PAY-018',
      studentName: 'Tom Brown',
      studentEmail: 'tom@example.com',
      originalAmount: 50,
      refundAmount: 50,
      reason: 'Lesson rescheduling conflict',
      requestDate: '2024-01-15',
      status: 'processed',
      processedBy: 'Financial Manager',
      processedDate: '2024-01-16'
    }
  ]);
  
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [processData, setProcessData] = useState({
    action: 'approve',
    notes: ''
  });
  
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
      pending: { class: 'table-badge-warning', text: 'Pending Review' },
      approved: { class: 'table-badge-info', text: 'Approved' },
      processed: { class: 'table-badge-success', text: 'Processed' },
      rejected: { class: 'table-badge-error', text: 'Rejected' }
    };
    
    const config = statusConfig[status] || { class: 'table-badge', text: status };
    return <span className={`table-badge ${config.class}`}>{config.text}</span>;
  };
  
  const handleProcessRefund = (refund) => {
    setSelectedRefund(refund);
    setProcessData({
      action: 'approve',
      notes: ''
    });
    setShowProcessModal(true);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProcessData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const submitRefundDecision = (e) => {
    e.preventDefault();
    
    const updatedRefund = {
      ...selectedRefund,
      status: processData.action === 'approve' ? 'approved' : 'rejected',
      processedBy: 'Financial Manager',
      processedDate: new Date().toISOString().split('T')[0],
      notes: processData.notes
    };
    
    setRefunds(prev => 
      prev.map(refund => 
        refund.id === selectedRefund.id ? updatedRefund : refund
      )
    );
    
    setShowProcessModal(false);
    setSelectedRefund(null);
  };
  
  const processRefund = (refundId) => {
    setRefunds(prev => 
      prev.map(refund => 
        refund.id === refundId 
          ? { 
              ...refund, 
              status: 'processed',
              processedDate: new Date().toISOString().split('T')[0]
            }
          : refund
      )
    );
  };
  
  const columns = [
    {
      key: 'id',
      title: 'Refund ID',
      render: (value) => (
        <span className="font-mono text-sm font-medium">
          {value}
        </span>
      )
    },
    {
      key: 'studentName',
      title: 'Student',
      render: (value, refund) => (
        <div>
          <div className="font-medium text-sm">{value}</div>
          <div className="text-xs text-secondary">{refund.studentEmail}</div>
        </div>
      )
    },
    {
      key: 'originalAmount',
      title: 'Original Amount',
      render: (value) => (
        <span className="text-sm">
          {formatAmount(value)}
        </span>
      )
    },
    {
      key: 'refundAmount',
      title: 'Refund Amount',
      render: (value) => (
        <span className="font-semibold text-error-color">
          {formatAmount(value)}
        </span>
      )
    },
    {
      key: 'reason',
      title: 'Reason',
      render: (value) => (
        <span className="text-sm">{value}</span>
      )
    },
    {
      key: 'requestDate',
      title: 'Request Date',
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
      render: (_, refund) => (
        <div className="table-actions">
          {refund.status === 'pending' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleProcessRefund(refund)}
            >
              Review
            </Button>
          )}
          {refund.status === 'approved' && (
            <Button
              size="sm"
              variant="success"
              onClick={() => processRefund(refund.id)}
            >
              Process
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
          >
            View Details
          </Button>
        </div>
      )
    }
  ];
  
  const pendingRefunds = refunds.filter(r => r.status === 'pending');
  const approvedRefunds = refunds.filter(r => r.status === 'approved');
  const totalRefundAmount = refunds
    .filter(r => r.status === 'processed')
    .reduce((sum, r) => sum + r.refundAmount, 0);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="content-header">
        <h1 className="content-title">Refund Processing</h1>
        <p className="content-description">
          Review and process refund requests from students.
        </p>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <Card.Body className="text-center">
            <div className="text-2xl font-bold text-warning-color mb-1">
              {pendingRefunds.length}
            </div>
            <div className="text-sm text-secondary">Pending Review</div>
          </Card.Body>
        </Card>
        
        <Card>
          <Card.Body className="text-center">
            <div className="text-2xl font-bold text-info-color mb-1">
              {approvedRefunds.length}
            </div>
            <div className="text-sm text-secondary">Approved</div>
          </Card.Body>
        </Card>
        
        <Card>
          <Card.Body className="text-center">
            <div className="text-2xl font-bold text-success-color mb-1">
              {refunds.filter(r => r.status === 'processed').length}
            </div>
            <div className="text-sm text-secondary">Processed</div>
          </Card.Body>
        </Card>
        
        <Card>
          <Card.Body className="text-center">
            <div className="text-2xl font-bold text-error-color mb-1">
              {formatAmount(totalRefundAmount)}
            </div>
            <div className="text-sm text-secondary">Total Refunded</div>
          </Card.Body>
        </Card>
      </div>
      
      {/* Refunds Table */}
      <Card>
        <Card.Header 
          title={`Refund Requests (${refunds.length})`}
          actions={
            <Button variant="outline" size="sm">
              Export Report
            </Button>
          }
        />
        <Card.Body className="p-0">
          <Table
            data={refunds}
            columns={columns}
            sortable
            striped
            responsive
            emptyMessage="No refund requests found"
          />
        </Card.Body>
      </Card>
      
      {/* Process Refund Modal */}
      <Modal
        isOpen={showProcessModal}
        onClose={() => setShowProcessModal(false)}
        title="Process Refund Request"
        size="lg"
      >
        {selectedRefund && (
          <form onSubmit={submitRefundDecision} className="space-y-6">
            {/* Refund Details */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium mb-3">Refund Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-secondary">Student:</span>
                  <div className="font-medium">{selectedRefund.studentName}</div>
                </div>
                <div>
                  <span className="text-secondary">Original Payment:</span>
                  <div className="font-medium">{formatAmount(selectedRefund.originalAmount)}</div>
                </div>
                <div>
                  <span className="text-secondary">Refund Amount:</span>
                  <div className="font-medium text-error-color">{formatAmount(selectedRefund.refundAmount)}</div>
                </div>
                <div>
                  <span className="text-secondary">Request Date:</span>
                  <div className="font-medium">{formatDate(selectedRefund.requestDate)}</div>
                </div>
                <div className="col-span-2">
                  <span className="text-secondary">Reason:</span>
                  <div className="font-medium">{selectedRefund.reason}</div>
                </div>
              </div>
            </div>
            
            {/* Decision */}
            <Select
              name="action"
              label="Decision"
              value={processData.action}
              onChange={handleInputChange}
              options={[
                { value: 'approve', label: 'Approve Refund' },
                { value: 'reject', label: 'Reject Refund' }
              ]}
              required
            />
            
            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Processing Notes</label>
              <textarea
                name="notes"
                className="form-input form-textarea"
                rows="3"
                value={processData.notes}
                onChange={handleInputChange}
                placeholder="Add any notes about your decision..."
              />
            </div>
            
            {/* Warning for Approval */}
            {processData.action === 'approve' && (
              <div className="alert alert-warning">
                <strong>Confirmation Required:</strong> Approving this refund will allow it to be processed. 
                The refund amount will be deducted from your revenue totals.
              </div>
            )}
            
            {/* Rejection Warning */}
            {processData.action === 'reject' && (
              <div className="alert alert-error">
                <strong>Rejection Notice:</strong> The student will be notified that their refund request has been rejected. 
                Make sure to provide clear notes explaining the reason.
              </div>
            )}
            
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowProcessModal(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant={processData.action === 'approve' ? 'success' : 'error'}
              >
                {processData.action === 'approve' ? 'Approve Refund' : 'Reject Request'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default RefundProcessing;