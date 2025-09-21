import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TransactionForm = ({ transaction = null, onSubmitSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    type: 'income',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [authToken] = useState(localStorage.getItem('token'));
  
  // If transaction is provided, populate form (for edit mode)
  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category,
        type: transaction.type,
        date: new Date(transaction.date).toISOString().split('T')[0]
      });
    }
  }, [transaction]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Validate form data
  const validateForm = () => {
    const errors = {};
    
    // Required fields
    if (!formData.date) errors.date = "Date is required";
    if (!formData.description) errors.description = "Description is required";
    if (!formData.category) errors.category = "Category is required";
    
    // Amount validation
    if (!formData.amount) {
      errors.amount = "Amount is required";
    } else if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      errors.amount = "Amount must be a positive number";
    }
    
    // Description length
    if (formData.description && formData.description.length > 200) {
      errors.description = "Description must be less than 200 characters";
    }
    
    // Date validation
    if (formData.date && new Date(formData.date) > new Date()) {
      errors.date = "Date cannot be in the future";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      // Show validation errors toast
      toast.error("Please correct the errors in the form");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const apiUrl = 'http://localhost:3001/api/finance/transactions';
      let response;
      
      // Format data for API
      const apiData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };
      
      // Configure axios with authentication
      const axiosConfig = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      };
      
      if (transaction) {
        // Update existing transaction
        response = await axios.put(`${apiUrl}/${transaction._id}`, apiData, axiosConfig);
      } else {
        // Create new transaction
        response = await axios.post(apiUrl, apiData, axiosConfig);
      }
      
      setLoading(false);
      
      if (response.data.success) {
        // Show success toast
        toast.success(transaction ? "Transaction updated successfully" : "Transaction created successfully");
        
        // Reset form if it's a new transaction
        if (!transaction) {
          setFormData({
            amount: '',
            description: '',
            category: '',
            type: 'income',
            date: new Date().toISOString().split('T')[0]
          });
        }
        
        // Notify parent component
        onSubmitSuccess(response.data.data);
      }
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.error || 'An error occurred while saving the transaction';
      setError(errorMessage);
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
      console.error('Transaction save error:', err);
    }
  };
  
  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <h5 className="card-title fw-bold mb-4">
          {transaction ? 'Edit Transaction' : 'Add New Transaction'}
        </h5>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {Array.isArray(error) ? error.join(', ') : error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="type" className="form-label">Transaction Type</label>
            <select 
              className="form-select" 
              id="type" 
              name="type" 
              value={formData.type} 
              onChange={handleChange}
              required
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          
          <div className="mb-3">
            <label htmlFor="amount" className="form-label">Amount (USD)</label>
            <input 
              type="number" 
              className="form-control" 
              id="amount" 
              name="amount" 
              value={formData.amount} 
              onChange={handleChange}
              step="0.01"
              min="0.01"
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="category" className="form-label">Category</label>
            <select 
              className="form-select" 
              id="category" 
              name="category" 
              value={formData.category} 
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              {formData.type === 'income' ? (
                <>
                  <option value="Tuition Fee">Tuition Fee</option>
                  <option value="Other Income">Other Income</option>
                </>
              ) : (
                <>
                  <option value="Salary">Salary</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Other Expense">Other Expense</option>
                </>
              )}
            </select>
          </div>
          
          <div className="mb-3">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea 
              className="form-control" 
              id="description" 
              name="description" 
              value={formData.description} 
              onChange={handleChange}
              rows="2"
              required
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label htmlFor="date" className="form-label">Date</label>
            <input 
              type="date" 
              className="form-control" 
              id="date" 
              name="date" 
              value={formData.date} 
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="d-flex justify-content-end">
            <button 
              type="button" 
              className="btn btn-outline-secondary me-2" 
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              ) : null}
              {transaction ? 'Update Transaction' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;