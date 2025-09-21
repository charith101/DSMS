import React, { useState, useEffect } from "react";
import { DollarSign, Download, Search, TrendingUp } from "lucide-react";
import AdminNav from "./AdminNav";
import axios from "axios";

function FinanceManagement() {
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
  
  // Categories for transactions
  const incomeCategories = ["Tuition Fee", "Registration Fee", "Late Fee", "Other"];
  const expenseCategories = ["Salary", "Vehicle Maintenance", "Fuel", "Office Supplies", "Other"];

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

  // API base URL - This should point to your backend server
  const API_BASE_URL = "http://localhost:3001";
  
  // State for refreshing data
  const [refreshData, setRefreshData] = useState(false);

  // Fetch data from backend
  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setLoading({
          summary: true,
          transactions: true,
          incomeByCategory: true,
          expensesByCategory: true,
          monthlyData: true
        });

        // Use Promise.all to fetch all data concurrently for better performance
        const [
          summaryResponse,
          transactionsResponse,
          incomeResponse,
          expensesResponse,
          monthlyResponse
        ] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/finance/summary`),
          axios.get(`${API_BASE_URL}/api/finance/recent-transactions`),
          axios.get(`${API_BASE_URL}/api/finance/income-by-category`),
          axios.get(`${API_BASE_URL}/api/finance/expenses-by-category`),
          axios.get(`${API_BASE_URL}/api/finance/monthly-data`)
        ]);
        
        // Update state with fetched data
        setFinancialData({
          totalIncome: summaryResponse.data.income,
          totalExpenses: summaryResponse.data.expenses,
          netProfit: summaryResponse.data.profit,
          recentTransactions: transactionsResponse.data
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
  }, [refreshData]); // Re-fetch data whenever refreshData changes

  // Filter transactions based on filters
  const filteredTransactions = financialData.recentTransactions.filter(transaction => {
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
    const bsToast = new window.bootstrap.Toast(toastElement); // Use bootstrap's toast API
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

  // Ask for delete confirmation
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

  // Generate financial report (placeholder)
  const generateReport = () => {
    alert("Financial report generated! In a real application, this would download a PDF or Excel file.");
  };

  return (
    <div>
      <AdminNav page="finance" />

      {/* Header Section */}
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
          <h1 className="fw-bold display-5 mb-3 mx-1">Financial Management</h1>
          <h6 className="fs-6 lead opacity-90">
            Track income, expenses, and generate financial reports.
          </h6>
        </div>
      </section>

      {/* Main Content */}
      <div className="py-5 bg-light">
        <div className="container">
          {/* Financial Summary Cards */}
          <div className="row g-4 mb-5">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">
                      <TrendingUp size={32} className="text-success" />
                    </div>
                    <div>
                      <h6 className="text-muted mb-1">Total Income</h6>
                      <h3 className="fw-bold mb-0">${(financialData.totalIncome).toLocaleString(undefined, {maximumFractionDigits: 2})}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-danger bg-opacity-10 rounded-circle p-3 me-3">
                      <TrendingUp size={32} className="text-danger" style={{ transform: "rotate(180deg)" }} />
                    </div>
                    <div>
                      <h6 className="text-muted mb-1">Total Expenses</h6>
                      <h3 className="fw-bold mb-0">${(financialData.totalExpenses).toLocaleString(undefined, {maximumFractionDigits: 2})}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                      <DollarSign size={32} className="text-primary" />
                    </div>
                    <div>
                      <h6 className="text-muted mb-1">Net Profit</h6>
                      <h3 className="fw-bold mb-0">${(financialData.netProfit).toLocaleString(undefined, {maximumFractionDigits: 2})}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button className={`nav-link ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>
                Overview
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${activeTab === "transactions" ? "active" : ""}`} onClick={() => setActiveTab("transactions")}>
                Transactions
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${activeTab === "reports" ? "active" : ""}`} onClick={() => setActiveTab("reports")}>
                Reports
              </button>
            </li>
          </ul>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div>
                
                {/* Category Charts */}
                <div className="row g-4 mb-4">
                  <div className="col-lg-6">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-4">
                        <h5 className="card-title fw-bold mb-4">Income by Category</h5>
                        <div className="d-flex flex-column justify-content-center h-100">
                          {incomeByCategory.map((category, index) => (
                            <div key={index} className="mb-3">
                              <div className="d-flex justify-content-between mb-1">
                                <span>{category.category}</span>
                                <span className="fw-bold">${(category.amount).toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                              </div>
                              <div className="progress" style={{ height: "10px" }}>
                                <div className="progress-bar bg-success" role="progressbar" style={{ width: `${(category.amount / financialData.totalIncome) * 100}%` }}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-4">
                        <h5 className="card-title fw-bold mb-4">Expenses by Category</h5>
                        <div className="d-flex flex-column justify-content-center h-100">
                          {expensesByCategory.map((category, index) => (
                            <div key={index} className="mb-3">
                              <div className="d-flex justify-content-between mb-1">
                                <span>{category.category}</span>
                                <span className="fw-bold">${(category.amount).toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                              </div>
                              <div className="progress" style={{ height: "10px" }}>
                                <div className="progress-bar bg-danger" role="progressbar" style={{ width: `${(category.amount / financialData.totalExpenses) * 100}%` }}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Recent Transactions */}
                <div className="row g-4">
                  <div className="col-12">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h5 className="card-title fw-bold mb-0">Recent Transactions</h5>
                          <button className="btn btn-outline-primary btn-sm" onClick={() => setActiveTab("transactions")}>
                            View All
                          </button>
                        </div>
                        <div className="table-responsive">
                          <table className="table table-hover">
                            <thead>
                              <tr><th>Date</th><th>Description</th><th>Amount</th></tr>
                            </thead>
                            <tbody>
                              {financialData.recentTransactions.slice(0, 5).map((transaction) => (
                                <tr key={transaction._id}>
                                  <td>{new Date(transaction.date).toLocaleDateString()}</td>
                                  <td>{transaction.description}</td>
                                  <td className={transaction.type === "income" ? "text-success" : "text-danger"}>
                                    {transaction.type === "income" ? "+" : "-"}${transaction.amount.toLocaleString(undefined, {maximumFractionDigits: 2})}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === "transactions" && (
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="card-title fw-bold mb-0">All Transactions</h5>
                    <button className="btn btn-primary" onClick={() => { resetTransactionForm(); setShowTransactionForm(true); }}>
                      Add New Transaction
                    </button>
                  </div>
                  
                  {/* Transaction Form */}
                  {showTransactionForm && (
                    <div className="card mb-4 border-0 shadow-sm">
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h5 className="card-title fw-bold mb-0">{isEditing ? "Edit Transaction" : "Add New Transaction"}</h5>
                          <button className="btn-close" onClick={resetTransactionForm} aria-label="Close"></button>
                        </div>
                        <form onSubmit={isEditing ? updateTransaction : createTransaction}>
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label">Date</label>
                              <input type="date" className={`form-control ${validationErrors.date ? 'is-invalid' : ''}`} name="date" value={currentTransaction.date} onChange={handleTransactionChange} required />
                              {validationErrors.date && <div className="invalid-feedback">{validationErrors.date}</div>}
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Type</label>
                              <select className="form-select" name="type" value={currentTransaction.type} onChange={handleTransactionChange} required>
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                              </select>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Amount</label>
                              <div className="input-group">
                                <span className="input-group-text">$</span>
                                <input type="number" className={`form-control ${validationErrors.amount ? 'is-invalid' : ''}`} name="amount" value={currentTransaction.amount} onChange={handleTransactionChange} min="0" step="0.01" required />
                                {validationErrors.amount && <div className="invalid-feedback">{validationErrors.amount}</div>}
                              </div>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Category</label>
                              <select className={`form-select ${validationErrors.category ? 'is-invalid' : ''}`} name="category" value={currentTransaction.category} onChange={handleTransactionChange} required>
                                <option value="">Select a category</option>
                                {currentTransaction.type === "income" ? incomeCategories.map((c, i) => <option key={i} value={c}>{c}</option>) : expenseCategories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                              </select>
                              {validationErrors.category && <div className="invalid-feedback">{validationErrors.category}</div>}
                            </div>
                            <div className="col-12">
                              <label className="form-label">Description</label>
                              <input type="text" className={`form-control ${validationErrors.description ? 'is-invalid' : ''}`} name="description" value={currentTransaction.description} onChange={handleTransactionChange} required />
                              {validationErrors.description && <div className="invalid-feedback">{validationErrors.description}</div>}
                            </div>
                            <div className="col-12 mt-4">
                              <div className="d-flex justify-content-end">
                                <button type="button" className="btn btn-outline-secondary me-2" onClick={resetTransactionForm}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={loading.transactions}>
                                  {loading.transactions && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
                                  {isEditing ? "Update Transaction" : "Create Transaction"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                  
                  {/* Filters */}
                  <div className="row g-3 mb-4">
                    <div className="col-md-3"><label className="form-label">Start Date</label><input type="date" className="form-control" name="startDate" value={filters.startDate} onChange={handleFilterChange}/></div>
                    <div className="col-md-3"><label className="form-label">End Date</label><input type="date" className="form-control" name="endDate" value={filters.endDate} onChange={handleFilterChange}/></div>
                    <div className="col-md-3"><label className="form-label">Transaction Type</label><select className="form-select" name="transactionType" value={filters.transactionType} onChange={handleFilterChange}><option value="all">All</option><option value="income">Income</option><option value="expense">Expense</option></select></div>
                    <div className="col-md-3"><label className="form-label">Search</label><div className="input-group"><span className="input-group-text"><Search size={16} /></span><input type="text" className="form-control" placeholder="Search..." name="searchQuery" value={filters.searchQuery} onChange={handleFilterChange}/></div></div>
                  </div>
                  
                  {/* Transactions Table */}
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th><th>Type</th><th>Actions</th></tr></thead>
                      <tbody>
                        {filteredTransactions.map((transaction) => (
                          <tr key={transaction._id}>
                            <td>{new Date(transaction.date).toLocaleDateString()}</td>
                            <td>{transaction.description}</td>
                            <td>{transaction.category}</td>
                            <td className={`fw-medium ${transaction.type === "income" ? "text-success" : "text-danger"}`}>{transaction.type === "income" ? "+" : "-"}${transaction.amount.toLocaleString()}</td>
                            <td><span className={`badge ${transaction.type === "income" ? "bg-success" : "bg-danger"}`}>{transaction.type}</span></td>
                            <td>
                              <div className="d-flex">
                                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => editTransaction(transaction)}>Edit</button>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => deleteTransaction(transaction._id)}>Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {filteredTransactions.length === 0 && <div className="text-center py-4"><p className="text-muted">No transactions found.</p></div>}
                  
                  {/* Delete Confirmation Modal */}
                  {showDeleteModal && (
                    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                      <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                          <div className="modal-header"><h5 className="modal-title">Confirm Delete</h5><button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button></div>
                          <div className="modal-body"><p>Are you sure you want to delete this transaction? This action cannot be undone.</p></div>
                          <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                            <button type="button" className="btn btn-danger" onClick={confirmDeleteTransaction} disabled={loading.transactions}>
                              {loading.transactions && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === "reports" && (
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h5 className="card-title fw-bold mb-4">Financial Reports</h5>
                  <div className="row g-3 mb-4">
                    <div className="col-md-4"><label className="form-label">Report Type</label><select className="form-select"><option>Income Statement</option><option>Balance Sheet</option><option>Cash Flow Statement</option></select></div>
                    <div className="col-md-4"><label className="form-label">Start Date</label><input type="date" className="form-control" /></div>
                    <div className="col-md-4"><label className="form-label">End Date</label><input type="date" className="form-control" /></div>
                  </div>
                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <button className="btn btn-primary" onClick={generateReport}><Download size={16} className="me-2" />Generate Report</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinanceManagement;