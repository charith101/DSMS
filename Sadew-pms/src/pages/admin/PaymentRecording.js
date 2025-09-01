import React, { useState } from 'react';
import { Card, Button, Input, Select } from '../../components/shared';
import { useForm } from '../../hooks/useForm';
import { ADMIN_PAYMENT_RULES } from '../../utils/validationRules';
import { usePayment } from '../../contexts/PaymentContext';

/**
 * Payment Recording Page - For administrators to record manual payments
 */
const PaymentRecording = () => {
  const [successMessage, setSuccessMessage] = useState('');
  const { recordManualPayment } = usePayment();
  
  const students = [
    { value: '1', label: 'John Doe (john@example.com)' },
    { value: '2', label: 'Jane Smith (jane@example.com)' },
    { value: '3', label: 'Mike Johnson (mike@example.com)' },
    { value: '4', label: 'Sarah Wilson (sarah@example.com)' }
  ];
  
  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'check', label: 'Check' },
    { value: 'money_order', label: 'Money Order' }
  ];
  
  const {
    values: formData,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue
  } = useForm(
    {
      studentId: '',
      studentName: '',
      amount: '',
      paymentMethod: 'cash',
      receiptNumber: '',
      description: '',
      paymentDate: new Date().toISOString().split('T')[0],
      notes: ''
    },
    ADMIN_PAYMENT_RULES,
    async (data) => {
      try {
        await recordManualPayment(data);
        setSuccessMessage('Payment recorded successfully!');
        resetForm();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Error recording payment:', error);
      }
    }
  );
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    handleChange(name, value);
    
    // Auto-fill student name when student is selected
    if (name === 'studentId') {
      const selectedStudent = students.find(s => s.value === value);
      if (selectedStudent) {
        setFieldValue('studentName', selectedStudent.label.split(' (')[0]);
      }
    }
  };
  
  const handleFieldBlur = (e) => {
    const { name } = e.target;
    handleBlur(name);
  };
  
  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit(e);
  };
  
  const generateReceiptNumber = () => {
    const timestamp = Date.now();
    const receiptNumber = `RCP-${timestamp.toString().slice(-8)}`;
    setFieldValue('receiptNumber', receiptNumber);
  };
  
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="content-header">
        <h1 className="content-title">Record Manual Payment</h1>
        <p className="content-description">
          Record cash or offline payments made by students.
        </p>
      </div>
      
      {/* Success Message */}
      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
        </div>
      )}
      
      {/* Payment Recording Form */}
      <Card>
        <Card.Header title="Payment Details" />
        <Card.Body>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Student Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                name="studentId"
                label="Select Student"
                value={formData.studentId}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                options={students}
                placeholder="Choose a student..."
                error={touched.studentId && errors.studentId}
                required
              />
              
              <Input
                name="studentName"
                label="Student Name"
                value={formData.studentName}
                onChange={handleInputChange}
                placeholder="Auto-filled when student selected"
                readOnly
              />
            </div>
            
            {/* Payment Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="amount"
                label="Payment Amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                placeholder="0.00"
                error={touched.amount && errors.amount}
                required
              />
              
              <Select
                name="paymentMethod"
                label="Payment Method"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                options={paymentMethods}
                error={touched.paymentMethod && errors.paymentMethod}
                required
              />
            </div>
            
            {/* Receipt and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  name="receiptNumber"
                  label="Receipt Number"
                  value={formData.receiptNumber}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                  placeholder="Enter receipt number"
                  error={touched.receiptNumber && errors.receiptNumber}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateReceiptNumber}
                >
                  Generate Receipt Number
                </Button>
              </div>
              
              <Input
                name="paymentDate"
                label="Payment Date"
                type="date"
                value={formData.paymentDate}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={touched.paymentDate && errors.paymentDate}
                required
              />
            </div>
            
            {/* Description */}
            <Input
              name="description"
              label="Payment Description"
              value={formData.description}
              onChange={handleInputChange}
              onBlur={handleFieldBlur}
              placeholder="e.g., Basic Package payment, Individual lesson"
              error={touched.description && errors.description}
            />
            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Additional Notes</label>
              <textarea
                name="notes"
                className={`form-input form-textarea ${
                  touched.notes && errors.notes ? 'form-input-error' : ''
                }`}
                rows="3"
                value={formData.notes}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                placeholder="Any additional information about this payment..."
              />
              {touched.notes && errors.notes && (
                <div className="form-error" role="alert">
                  {errors.notes}
                </div>
              )}
            </div>
            
            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Recording Payment...' : 'Record Payment'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
              >
                Clear Form
              </Button>
            </div>
          </form>
        </Card.Body>
      </Card>
      
      {/* Guidelines */}
      <Card>
        <Card.Header title="Recording Guidelines" />
        <Card.Body>
          <div className="space-y-3">
            <div className="alert alert-info">
              <strong>Important:</strong> Always verify the payment amount and method before recording.
            </div>
            
            <div className="space-y-2 text-sm text-secondary">
              <h4 className="font-semibold text-primary">Best Practices:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Generate a receipt number for cash payments</li>
                <li>Include detailed description of what the payment covers</li>
                <li>Double-check student information before submitting</li>
                <li>Keep physical receipts for cash payments</li>
                <li>Record payments on the same day they were received</li>
              </ul>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PaymentRecording;