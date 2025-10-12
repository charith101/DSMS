import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Toast } from 'bootstrap';
import FinancialManagerNav from './FinancialManagerNav';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../admin/adminDashboard.css';
import { DollarSign, Download, Search, TrendingUp, BarChart2 } from "lucide-react";

const FinancialManagerDashboard = () => {
  // State for financial data
  const [financialData, setFinancialData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    recentTransactions: []
  });

  // State for charts
  const [incomeByCategory, setIncomeByCategory] = useState([]);
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [monthlyFinancials, setMonthlyFinancials] = useState([]);

  // State for filters
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    transactionType: "all",
    searchQuery: ""
  });

  // State for active tab
  const [activeTab, setActiveTab] = useState("overview");
  
  // State for transaction form
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState({
    id: null,
    date: new Date().toISOString().split('T')[0],
    description: "",
    amount: "",
    type: "income",
    category: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  
  // State for delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  
  // Categories for transactions - Updated to include all desired categories
  const incomeCategories = ["Tuition Fee", "Registration Fee", "Late Fee", "Other"];
  const expenseCategories = ["Salary", "Vehicle Maintenance", "Fuel", "Office Supplies", "Insurance", "Marketing", "Maintenance", "Utilities", "Equipment", "Other"];

  // State for loading and error handling
  const [loading, setLoading] = useState({
    summary: true,
    transactions: true,
    incomeByCategory: true,
    expensesByCategory: true,
    monthlyData: true
  });
  const [error, setError] = useState({
    summary: null,
    transactions: null,
    incomeByCategory: null,
    expensesByCategory: null,
    monthlyData: null
  });

  const navigate = useNavigate();

  // API base URL - This should point to backend server
  const API_BASE_URL = "http://localhost:3005";
  
  // State for refreshing data
  const [refreshData, setRefreshData] = useState(false);

  useEffect(() => {
    // Check if user is authenticated and has financial manager role
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'financial_manager') {
      navigate('/login');
      return;
    }

    const fetchFinancialData = async () => {
      try {
        setLoading({
          summary: true,
          transactions: true,
          incomeByCategory: true,
          expensesByCategory: true,
          monthlyData: true
        });

        // Use to fetch all data concurrently for better performance
        const [
          transactionsResponse,
          incomeResponse,
          expensesResponse, 
          monthlyResponse
        ] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/finance/recent-transactions`),
          axios.get(`${API_BASE_URL}/api/finance/income-by-category`),
          axios.get(`${API_BASE_URL}/api/finance/expenses-by-category`),
          axios.get(`${API_BASE_URL}/api/finance/monthly-data`)
        ]);
        
        // Get transactions data
        const transactionsData = transactionsResponse.data || [];
        
        // Calculate totals from ALL transactions (including payroll/payments)
        const totalIncome = transactionsData
          .filter(transaction => transaction.type === 'income')
          .reduce((sum, transaction) => sum + (Number(transaction.amount) || 0), 0);
        
        const totalExpenses = transactionsData
          .filter(transaction => transaction.type === 'expense')
          .reduce((sum, transaction) => sum + (Number(transaction.amount) || 0), 0);
        
        const netProfit = totalIncome - totalExpenses;
        
        console.log('Financial Overview Calculation (All Transactions):', {
          transactionsCount: transactionsData.length,
          incomeTransactions: transactionsData.filter(t => t.type === 'income').length,
          expenseTransactions: transactionsData.filter(t => t.type === 'expense').length,
          totalIncome,
          totalExpenses,
          netProfit
        });
        
        // Update state with all transaction data
        setFinancialData({
          totalIncome,
          totalExpenses,
          netProfit,
          recentTransactions: transactionsData
        });
        
        setIncomeByCategory(incomeResponse.data);
        setExpensesByCategory(expensesResponse.data);
        
        // Format monthly data
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formattedMonthlyData = monthlyResponse.data.map(item => ({
          month: monthNames[item.month - 1],
          income: item.income,
          expenses: item.expenses
        }));
        
        // Sort monthly data chronologically
        formattedMonthlyData.sort((a, b) => {
          return monthNames.indexOf(a.month) - monthNames.indexOf(b.month);
        });
        
        setMonthlyFinancials(formattedMonthlyData);
        
      } catch (err) {
        console.error("Error fetching financial data:", err);
        const errorMessage = err.response?.data?.error || err.message || "Failed to fetch data";
        setError({
          summary: errorMessage,
          transactions: errorMessage,
          incomeByCategory: errorMessage,
          expensesByCategory: errorMessage,
          monthlyData: errorMessage
        });
        
      } finally {
        setLoading({
          summary: false,
          transactions: false,
          incomeByCategory: false,
          expensesByCategory: false,
          monthlyData: false
        });
      }
    };

    fetchFinancialData();
  }, [refreshData, navigate]);

  // Filter transactions based on filters and separate pure transactions from payment/payroll data
  const pureTransactions = financialData.recentTransactions.filter(transaction => {
    // Keep only pure transactions (not from payments or payroll)
    const isPaymentEntry = transaction.category === 'Tuition Fee' && transaction.description && transaction.description.startsWith('Payment from');
    const isPayrollEntry = transaction.category === 'Salary' && transaction.description && transaction.description.startsWith('Salary for');
    return !isPaymentEntry && !isPayrollEntry;
  });

  const paymentPayrollData = financialData.recentTransactions.filter(transaction => {
    // Keep only payment and payroll entries
    const isPaymentEntry = transaction.category === 'Tuition Fee' && transaction.description && transaction.description.startsWith('Payment from');
    const isPayrollEntry = transaction.category === 'Salary' && transaction.description && transaction.description.startsWith('Salary for');
    return isPaymentEntry || isPayrollEntry;
  });

  const filteredTransactions = pureTransactions.filter(transaction => {
    if (filters.startDate && new Date(transaction.date) < new Date(filters.startDate)) {
      return false;
    }
    if (filters.endDate && new Date(transaction.date) > new Date(filters.endDate)) {
      return false;
    }
    if (filters.transactionType !== "all" && transaction.type !== filters.transactionType) {
      return false;
    }
    if (filters.searchQuery && !transaction.description.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  // State for form validation
  const [validationErrors, setValidationErrors] = useState({});

  // Validate transaction form
  const validateTransactionForm = () => {
    const errors = {};
    if (!currentTransaction.date) errors.date = "Date is required";
    if (!currentTransaction.description) errors.description = "Description is required";
    if (!currentTransaction.category) errors.category = "Category is required";
    if (!currentTransaction.amount) {
      errors.amount = "Amount is required";
    } else if (isNaN(currentTransaction.amount) || parseFloat(currentTransaction.amount) <= 0) {
      errors.amount = "Amount must be a positive number";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle transaction form input changes
  const handleTransactionChange = (e) => {
    const { name, value } = e.target;
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
    setCurrentTransaction(prev => ({
      ...prev,
      [name]: name === "amount" ? (value === "" ? "" : parseFloat(value)) : value
    }));
  };

  // Reset transaction form
  const resetTransactionForm = () => {
    setCurrentTransaction({
      id: null,
      date: new Date().toISOString().split('T')[0],
      description: "",
      amount: "",
      type: "income",
      category: ""
    });
    setIsEditing(false);
    setShowTransactionForm(false);
    setValidationErrors({});
  };

  // Helper function to show toast notifications
  const showToast = (message, type = 'success') => {
    const toastId = `toast-${Date.now()}`;
    const toast = document.createElement('div');
    toast.className = 'position-fixed top-0 end-0 p-3';
    toast.style.zIndex = '9999';
    toast.innerHTML = `
      <div id="${toastId}" class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header bg-${type} text-white">
          <strong class="me-auto">${type === 'success' ? 'Success' : 'Error'}</strong>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          ${message}
        </div>
      </div>
    `;
    document.body.appendChild(toast);
    
    const toastElement = document.getElementById(toastId);
    const bsToast = new Toast(toastElement); // Use imported Toast class
    bsToast.show();

    setTimeout(() => {
        document.body.removeChild(toast);
    }, 5000);
  };

  // Create new transaction
  const createTransaction = async (e) => {
    e.preventDefault();
    if (!validateTransactionForm()) return;
    
    try {
      setLoading(prev => ({ ...prev, transactions: true }));
      const response = await axios.post(`${API_BASE_URL}/api/finance/transactions`, currentTransaction);
      
      if (response.data.success) {
        showToast(response.data.message || "Transaction created successfully!");
        resetTransactionForm();
        setRefreshData(prev => !prev); // Trigger data refresh
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || "Failed to create transaction.";
      showToast(errorMessage, 'danger');
      console.error("Error creating transaction:", err);
    } finally {
      setLoading(prev => ({ ...prev, transactions: false }));
    }
  };

  // Update existing transaction
  const updateTransaction = async (e) => {
    e.preventDefault();
    if (!validateTransactionForm()) return;
    
    try {
      setLoading(prev => ({ ...prev, transactions: true }));
      const response = await axios.put(`${API_BASE_URL}/api/finance/transactions/${currentTransaction.id}`, currentTransaction);
      
      if (response.data.success) {
        showToast(response.data.message || "Transaction updated successfully!");
        resetTransactionForm();
        setRefreshData(prev => !prev); // Trigger data refresh
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || "Failed to update transaction.";
      showToast(errorMessage, 'danger');
      console.error("Error updating transaction:", err);
    } finally {
      setLoading(prev => ({ ...prev, transactions: false }));
    }
  };

  // Set up transaction for editing
  const editTransaction = (transaction) => {
    setCurrentTransaction({
      ...transaction,
      id: transaction._id, // Set the id for the update request
      date: new Date(transaction.date).toISOString().split('T')[0]
    });
    setIsEditing(true);
    setShowTransactionForm(true);
  };

  //  for delete confirmation
  const deleteTransaction = (_id) => {
    setTransactionToDelete(_id);
    setShowDeleteModal(true);
  };
  
  // Confirm delete transaction
  const confirmDeleteTransaction = async () => {
    try {
      setLoading(prev => ({ ...prev, transactions: true }));
      const response = await axios.delete(`${API_BASE_URL}/api/finance/transactions/${transactionToDelete}`);
      
      if (response.data.success) {
        showToast(response.data.message || "Transaction deleted successfully!");
        setShowDeleteModal(false);
        setTransactionToDelete(null);
        setRefreshData(prev => !prev); // Trigger data refresh
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || "Failed to delete transaction.";
      showToast(errorMessage, 'danger');
      console.error("Error deleting transaction:", err);
    } finally {
      setLoading(prev => ({ ...prev, transactions: false }));
    }
  };

  // Generate financial report 
  const generateReport = () => {
    alert("Financial report generated! In a real application, this would download a PDF or Excel file.");
  };

  return (
    <div>
      <FinancialManagerNav />
      
      {/*Header section updated to match AdminDashboard style */}
      <section
        className="text-white pb-5"
        style={{
          background: `linear-gradient(90deg, rgba(13,81,253,1) 20%, rgba(10,132,202,0.3) 100%), url('https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D') center/cover no-repeat`,
          marginTop: "76px",
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div className="container py-5 mt-5">
          <h1 className="fw-bold display-5 mb-3 mx-1">Financial Dashboard</h1>
          <h6 className="fs-6 lead opacity-90">
            Track income, expenses, and generate financial reports.
          </h6>
        </div>
      </section>

      {/* Main content area restructured to match AdminDashboard layout */}
      <div className="py-5 bg-light">
        <div className="container">
          <div className="row g-4">
            
            {/* Financial Overview Card */}
            <div className="col-12">
              <div className="card border-2 shadow-sm p-3">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-4">
                    <div className="bg-primary bg-opacity-25 rounded-circle p-3 me-3">
                      <BarChart2 size={64} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="mb-1 fw-bold">Financial Overview</h3>
                      <small className="text-muted">A summary of your key financial metrics</small>
                    </div>
                  </div>
                  {/*The three summary cards are now placed inside this overview card */}
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="card bg-success bg-opacity-10 h-100">
                        <div className="card-body text-center">
                          <h6 className="text-muted mb-1">Total Income</h6>
                          <h2 className="fw-bold text-success mb-0">LKR {(financialData.totalIncome).toLocaleString(undefined, {maximumFractionDigits: 2})}</h2>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card bg-danger bg-opacity-10 h-100">
                        <div className="card-body text-center">
                          <h6 className="text-muted mb-1">Total Expenses</h6>
                          <h2 className="fw-bold text-danger mb-0">LKR {(financialData.totalExpenses).toLocaleString(undefined, {maximumFractionDigits: 2})}</h2>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card bg-primary bg-opacity-10 h-100">
                        <div className="card-body text-center">
                          <h6 className="text-muted mb-1">Net Profit</h6>
                          <h2 className="fw-bold text-primary mb-0">LKR {(financialData.netProfit).toLocaleString(undefined, {maximumFractionDigits: 2})}</h2>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions Management Card */}
            <div className="col-12">
              <div className="card border-2 shadow-sm p-3">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary bg-opacity-25 rounded-circle p-3 me-3">
                      <DollarSign size={64} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="mb-1 fw-bold">Direct Transactions</h3>
                      <small className="text-muted">Manage direct income and expense transactions</small>
                    </div>
                  </div>
                  {/* The entire transactions table and its functionality is now nested here */}
                  <div>
                    <div className="d-flex justify-content-end mb-3">
                      <button 
                        className="btn btn-primary me-2" 
                        onClick={() => setShowTransactionForm(true)}
                      >
                        Add Transaction
                      </button>
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={generateReport}
                      >
                        <Download size={16} className="me-1" />
                        Export
                      </button>
                    </div>
                    <div className="row mb-3 g-2">
                      <div className="col-md-3">
                        <input type="date" className="form-control" name="startDate" value={filters.startDate} onChange={handleFilterChange}/>
                      </div>
                      <div className="col-md-3">
                        <input type="date" className="form-control" name="endDate" value={filters.endDate} onChange={handleFilterChange}/>
                      </div>
                      <div className="col-md-2">
                        <select className="form-select" name="transactionType" value={filters.transactionType} onChange={handleFilterChange}>
                          <option value="all">All Types</option>
                          <option value="income">Income</option>
                          <option value="expense">Expense</option>
                        </select>
                      </div>
                      <div className="col-md-4">
                        <div className="input-group">
                          <span className="input-group-text"><Search size={16} /></span>
                          <input type="text" className="form-control" placeholder="Search..." name="searchQuery" value={filters.searchQuery} onChange={handleFilterChange} />
                        </div>
                      </div>
                    </div>
                    
                    {filteredTransactions.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead className="table-light">
                            <tr>
                              <th>Date</th>
                              <th>Description</th>
                              <th>Category</th>
                              <th>Amount</th>
                              <th>Type</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredTransactions.map((transaction) => (
                              <tr key={transaction._id}>
                                <td>{new Date(transaction.date).toLocaleDateString()}</td>
                                <td>{transaction.description}</td>
                                <td>{transaction.category}</td>
                                <td className={transaction.type === 'income' ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                                  LKR {transaction.amount.toLocaleString()}
                                </td>
                                <td>
                                  <span className={`badge ${transaction.type === 'income' ? 'bg-success' : 'bg-danger'}`}>{transaction.type}</span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary me-1" onClick={() => editTransaction(transaction)}>Edit</button>
                                  <button className="btn btn-sm btn-outline-danger" onClick={() => deleteTransaction(transaction._id)}>Delete</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-4"><p className="text-muted mb-0">No transactions found.</p></div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment & Payroll Data Display Card */}
            <div className="col-12">
              <div className="card border-2 shadow-sm p-3">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-info bg-opacity-25 rounded-circle p-3 me-3">
                      <TrendingUp size={64} className="text-info" />
                    </div>
                    <div>
                      <h3 className="mb-1 fw-bold">Payment & Payroll Records</h3>
                      <small className="text-muted">View-only display of payment and payroll data</small>
                    </div>
                  </div>
                  
                  {paymentPayrollData.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Amount</th>
                            <th>Type</th>
                            <th>Source</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paymentPayrollData.map((record, index) => (
                            <tr key={`payroll-payment-${index}`}>
                              <td>{new Date(record.date).toLocaleDateString()}</td>
                              <td>{record.description}</td>
                              <td>{record.category}</td>
                              <td className={record.type === 'income' ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                                LKR {record.amount.toLocaleString()}
                              </td>
                              <td>
                                <span className={`badge ${record.type === 'income' ? 'bg-success' : 'bg-danger'}`}>{record.type}</span>
                              </td>
                              <td>
                                <span className={`badge ${record.category === 'Tuition Fee' ? 'bg-info' : 'bg-warning'}`}>
                                  {record.category === 'Tuition Fee' ? 'Payment System' : 'Payroll System'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted mb-0">No payment or payroll records found.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{isEditing ? "Edit Transaction" : "Add Transaction"}</h5>
                <button type="button" className="btn-close" onClick={resetTransactionForm}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={isEditing ? updateTransaction : createTransaction}>
                  <div className="mb-3">
                    <label htmlFor="date" className="form-label">Date</label>
                    <input
                      type="date"
                      className={`form-control ${validationErrors.date ? 'is-invalid' : ''}`}
                      id="date"
                      name="date"
                      value={currentTransaction.date}
                      onChange={handleTransactionChange}
                    />
                    {validationErrors.date && <div className="invalid-feedback">{validationErrors.date}</div>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="type" className="form-label">Type</label>
                    <select
                      className="form-select"
                      id="type"
                      name="type"
                      value={currentTransaction.type}
                      onChange={handleTransactionChange}
                    >
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="category" className="form-label">Category</label>
                    <select
                      className={`form-select ${validationErrors.category ? 'is-invalid' : ''}`}
                      id="category"
                      name="category"
                      value={currentTransaction.category}
                      onChange={handleTransactionChange}
                    >
                      <option value="">Select a category</option>
                      {currentTransaction.type === "income" ? (
                        incomeCategories.map((category, index) => (
                          <option key={index} value={category}>{category}</option>
                        ))
                      ) : (
                        expenseCategories.map((category, index) => (
                          <option key={index} value={category}>{category}</option>
                        ))
                      )}
                    </select>
                    {validationErrors.category && <div className="invalid-feedback">{validationErrors.category}</div>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <input
                      type="text"
                      className={`form-control ${validationErrors.description ? 'is-invalid' : ''}`}
                      id="description"
                      name="description"
                      value={currentTransaction.description}
                      onChange={handleTransactionChange}
                    />
                    {validationErrors.description && <div className="invalid-feedback">{validationErrors.description}</div>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="amount" className="form-label">Amount</label>
                    <div className="input-group">
                      <span className="input-group-text">LKR</span>
                      <input
                        type="number"
                        step="0.01"
                        className={`form-control ${validationErrors.amount ? 'is-invalid' : ''}`}
                        id="amount"
                        name="amount"
                        value={currentTransaction.amount}
                        onChange={handleTransactionChange}
                      />
                      {validationErrors.amount && <div className="invalid-feedback">{validationErrors.amount}</div>}
                    </div>
                  </div>
                  <div className="d-flex justify-content-end">
                    <button type="button" className="btn btn-secondary me-2" onClick={resetTransactionForm}>Cancel</button>
                    <button type="submit" className="btn btn-primary">{isEditing ? "Update" : "Add"}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this transaction? This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={confirmDeleteTransaction}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialManagerDashboard;