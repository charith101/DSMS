import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
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
      
      if (transaction) {
        // Update existing transaction
        response = await axios.put(`${apiUrl}/${transaction._id}`, apiData);
      } else {
        // Create new transaction
        response = await axios.post(apiUrl, apiData);
      }
      
      setLoading(false);
      
      if (response.data.success) {
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
      setError(err.response?.data?.error || 'An error occurred while saving the transaction');
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