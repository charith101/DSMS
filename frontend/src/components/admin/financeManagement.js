import React, { useState, useEffect } from "react";
import { DollarSign, Download, Filter, PieChart, BarChart, TrendingUp, Calendar, Search } from "lucide-react";
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

  // API base URL
  const API_BASE_URL = "http://localhost:3001";
  
  // State for refreshing data
  const [refreshData, setRefreshData] = useState(false);

  // Fetch data from backend
  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        // Fetch financial summary
        setLoading(prev => ({ ...prev, summary: true }));
        const summaryResponse = await axios.get(`${API_BASE_URL}/finance/summary`, {
          withCredentials: false // For CORS
        });
        
        // Fetch recent transactions
        setLoading(prev => ({ ...prev, transactions: true }));
        const transactionsResponse = await axios.get(`${API_BASE_URL}/finance/recent-transactions`, {
          withCredentials: false
        });
        
        // Fetch income by category
        setLoading(prev => ({ ...prev, incomeByCategory: true }));
        const incomeResponse = await axios.get(`${API_BASE_URL}/finance/income-by-category`, {
          withCredentials: false
        });
        
        // Fetch expenses by category
        setLoading(prev => ({ ...prev, expensesByCategory: true }));
        const expensesResponse = await axios.get(`${API_BASE_URL}/finance/expenses-by-category`, {
          withCredentials: false
        });
        
        // Fetch monthly financial data
        setLoading(prev => ({ ...prev, monthlyData: true }));
        const monthlyResponse = await axios.get(`${API_BASE_URL}/finance/monthly-data`, {
          withCredentials: false
        });
        
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
        
        // Clear loading states
        setLoading({
          summary: false,
          transactions: false,
          incomeByCategory: false,
          expensesByCategory: false,
          monthlyData: false
        });
        
      } catch (err) {
        console.error("Error fetching financial data:", err);
        
        // Set error states
        setError({
          summary: err.message,
          transactions: err.message,
          incomeByCategory: err.message,
          expensesByCategory: err.message,
          monthlyData: err.message
        });
        
        // Clear loading states
        setLoading({
          summary: false,
          transactions: false,
          incomeByCategory: false,
          expensesByCategory: false,
          monthlyData: false
        });
        
        // Fallback to mock data if API fails
        const mockIncome = 125000;
        const mockExpenses = 78500;
        
        const mockTransactions = [
          { id: 1, date: "2023-12-15", description: "Student Fee - John Smith", amount: 5000, type: "income", category: "Tuition Fee" },
          { id: 2, date: "2023-12-14", description: "Vehicle Maintenance - Toyota Corolla", amount: 2500, type: "expense", category: "Vehicle Maintenance" },
          { id: 3, date: "2023-12-12", description: "Student Fee - Sarah Johnson", amount: 5000, type: "income", category: "Tuition Fee" },
          { id: 4, date: "2023-12-10", description: "Fuel Expenses", amount: 3000, type: "expense", category: "Fuel" },
          { id: 5, date: "2023-11-28", description: "Registration Fee - New Students", amount: 7500, type: "income", category: "Registration Fee" },
          { id: 6, date: "2023-11-25", description: "Office Supplies", amount: 1200, type: "expense", category: "Office Supplies" },
          { id: 7, date: "2023-11-20", description: "Late Fee Collection", amount: 2000, type: "income", category: "Late Fee" },
          { id: 8, date: "2023-11-15", description: "Staff Salary", amount: 15000, type: "expense", category: "Salary" },
          { id: 9, date: "2023-10-30", description: "Bus Maintenance", amount: 3500, type: "expense", category: "Vehicle Maintenance" },
          { id: 10, date: "2023-10-25", description: "Tuition Fee - Batch 2023", amount: 25000, type: "income", category: "Tuition Fee" },
          { id: 11, date: "2023-10-20", description: "Fuel for School Buses", amount: 4000, type: "expense", category: "Fuel" },
          { id: 12, date: "2023-10-15", description: "Staff Salary", amount: 15000, type: "expense", category: "Salary" }
        ];

        const mockIncomeByCategory = [
          { category: "Tuition Fee", amount: 100000 },
          { category: "Registration Fee", amount: 15000 },
          { category: "Late Fee", amount: 5000 },
          { category: "Other", amount: 5000 }
        ];

        const mockExpensesByCategory = [
          { category: "Salary", amount: 45000 },
          { category: "Vehicle Maintenance", amount: 12500 },
          { category: "Fuel", amount: 15000 },
          { category: "Office Supplies", amount: 3000 }
        ];

        const mockMonthlyFinancials = [
          { month: "Jan", income: 95000, expenses: 65000 },
          { month: "Feb", income: 100000, expenses: 68000 },
          { month: "Mar", income: 110000, expenses: 70000 },
          { month: "Apr", income: 115000, expenses: 72000 },
          { month: "May", income: 120000, expenses: 75000 },
          { month: "Jun", income: 125000, expenses: 76000 },
          { month: "Jul", income: 130000, expenses: 78000 },
          { month: "Aug", income: 135000, expenses: 80000 },
          { month: "Sep", income: 140000, expenses: 82000 },
          { month: "Oct", income: 145000, expenses: 84000 },
          { month: "Nov", income: 150000, expenses: 86000 },
          { month: "Dec", income: 155000, expenses: 88000 }
        ];

        setFinancialData({
          totalIncome: mockIncome,
          totalExpenses: mockExpenses,
          netProfit: mockIncome - mockExpenses,
          recentTransactions: mockTransactions
        });

        setIncomeByCategory(mockIncomeByCategory);
        setExpensesByCategory(mockExpensesByCategory);
        setMonthlyFinancials(mockMonthlyFinancials);
      }
    };

    fetchFinancialData();
  }, []);

  // Filter transactions based on filters
  const filteredTransactions = financialData.recentTransactions.filter(transaction => {
    // Filter by date range
    if (filters.startDate && new Date(transaction.date) < new Date(filters.startDate)) {
      return false;
    }
    if (filters.endDate && new Date(transaction.date) > new Date(filters.endDate)) {
      return false;
    }
    
    // Filter by transaction type
    if (filters.transactionType !== "all" && transaction.type !== filters.transactionType) {
      return false;
    }
    
    // Filter by search query
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
    
    // Check required fields
    if (!currentTransaction.date) errors.date = "Date is required";
    if (!currentTransaction.description) errors.description = "Description is required";
    if (!currentTransaction.category) errors.category = "Category is required";
    
    // Validate amount
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
    
    // Clear validation error when field is edited
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
  };

  // Create new transaction
  const createTransaction = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateTransactionForm()) {
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, transactions: true }));
      
      // API call to create transaction
      const response = await axios.post(`${API_BASE_URL}/api/finance/transactions`, currentTransaction, {
        withCredentials: false
      });
      
      if (response.data.success) {
        // Update financial data with new transaction
        setFinancialData(prev => {
          const updatedTransactions = [response.data.data, ...prev.recentTransactions];
          
          // Update totals based on transaction type
          let newTotalIncome = prev.totalIncome;
          let newTotalExpenses = prev.totalExpenses;
          
          if (response.data.data.type === "income") {
            newTotalIncome += response.data.data.amount;
          } else {
            newTotalExpenses += response.data.data.amount;
          }
          
          return {
            ...prev,
            totalIncome: newTotalIncome,
            totalExpenses: newTotalExpenses,
            netProfit: newTotalIncome - newTotalExpenses,
            recentTransactions: updatedTransactions
          };
        });
        
        // Reset form
        resetTransactionForm();
        
        // Show success message with the message from the API
        const successMessage = response.data.message || "Transaction created successfully!";
        
        // Create a success toast notification
        const successToast = document.createElement('div');
        successToast.className = 'position-fixed top-0 end-0 p-3';
        successToast.style.zIndex = '9999';
        successToast.innerHTML = `
          <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header bg-success text-white">
              <strong class="me-auto">Success</strong>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
              ${successMessage}
            </div>
          </div>
        `;
        document.body.appendChild(successToast);
        
        // Remove the toast after 3 seconds
        setTimeout(() => {
          document.body.removeChild(successToast);
        }, 3000);
      } else {
        throw new Error(response.data.error || "Failed to create transaction");
      }
    } catch (err) {
      console.error("Error creating transaction:", err);
      
      // Get error message from response or use default
      const errorMessage = err.response?.data?.error || err.message || "Failed to create transaction. Please try again.";
      
      // Create an error toast notification
      const errorToast = document.createElement('div');
      errorToast.className = 'position-fixed top-0 end-0 p-3';
      errorToast.style.zIndex = '9999';
      errorToast.innerHTML = `
        <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="toast-header bg-danger text-white">
            <strong class="me-auto">Error</strong>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
          <div class="toast-body">
            ${Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage}
          </div>
        </div>
      `;
      document.body.appendChild(errorToast);
      
      // Remove the toast after 5 seconds
      setTimeout(() => {
        document.body.removeChild(errorToast);
      }, 5000);
    } finally {
      setLoading(prev => ({ ...prev, transactions: false }));
    }
  };

  // Update existing transaction
  const updateTransaction = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateTransactionForm()) {
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, transactions: true }));
      
      // API call to update transaction
      const response = await axios.put(`${API_BASE_URL}/api/finance/transactions/${currentTransaction.id}`, currentTransaction, {
        withCredentials: false
      });
      
      if (response.data.success) {
        // Update financial data with updated transaction
        setFinancialData(prev => {
          const updatedTransactions = prev.recentTransactions.map(t => 
            t._id === response.data.data._id ? response.data.data : t
          );
          
          // Recalculate totals
          const newTotalIncome = updatedTransactions
            .filter(t => t.type === "income")
            .reduce((sum, t) => sum + t.amount, 0);
            
          const newTotalExpenses = updatedTransactions
            .filter(t => t.type === "expense")
            .reduce((sum, t) => sum + t.amount, 0);
          
          return {
            ...prev,
            totalIncome: newTotalIncome,
            totalExpenses: newTotalExpenses,
            netProfit: newTotalIncome - newTotalExpenses,
            recentTransactions: updatedTransactions
          };
        });
        
        // Reset form
        resetTransactionForm();
        
        // Show success message with the message from the API
        const successMessage = response.data.message || "Transaction updated successfully!";
        
        // Create a success toast notification
        const successToast = document.createElement('div');
        successToast.className = 'position-fixed top-0 end-0 p-3';
        successToast.style.zIndex = '9999';
        successToast.innerHTML = `
          <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header bg-success text-white">
              <strong class="me-auto">Success</strong>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
              ${successMessage}
            </div>
          </div>
        `;
        document.body.appendChild(successToast);
        
        // Remove the toast after 3 seconds
        setTimeout(() => {
          document.body.removeChild(successToast);
        }, 3000);
      } else {
        throw new Error(response.data.error || "Failed to update transaction");
      }
    } catch (err) {
      console.error("Error updating transaction:", err);
      
      // Get error message from response or use default
      const errorMessage = err.response?.data?.error || err.message || "Failed to update transaction. Please try again.";
      
      // Create an error toast notification
      const errorToast = document.createElement('div');
      errorToast.className = 'position-fixed top-0 end-0 p-3';
      errorToast.style.zIndex = '9999';
      errorToast.innerHTML = `
        <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="toast-header bg-danger text-white">
            <strong class="me-auto">Error</strong>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
          <div class="toast-body">
            ${Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage}
          </div>
        </div>
      `;
      document.body.appendChild(errorToast);
      
      // Remove the toast after 5 seconds
      setTimeout(() => {
        document.body.removeChild(errorToast);
      }, 5000);
    } finally {
      setLoading(prev => ({ ...prev, transactions: false }));
    }
  };

  // Delete transaction
  const deleteTransaction = (_id) => {
    setTransactionToDelete(_id);
    setShowDeleteModal(true);
  };
  
  // Confirm delete transaction
  const confirmDeleteTransaction = async () => {
    try {
      setLoading(prev => ({ ...prev, transactions: true }));
      
      // API call to delete transaction
      const response = await axios.delete(`${API_BASE_URL}/api/finance/transactions/${transactionToDelete}`, {
        withCredentials: false
      });
      
      if (response.data.success) {
        // Update financial data by removing deleted transaction
        setFinancialData(prev => {
          const deletedTransaction = prev.recentTransactions.find(t => t._id === transactionToDelete || t._id === transactionToDelete);
          const updatedTransactions = prev.recentTransactions.filter(t => t._id !== transactionToDelete && t._id !== transactionToDelete);
          
          // Update totals based on deleted transaction type
          let newTotalIncome = prev.totalIncome;
          let newTotalExpenses = prev.totalExpenses;
          
          if (deletedTransaction && deletedTransaction.type === "income") {
            newTotalIncome -= deletedTransaction.amount;
          } else if (deletedTransaction) {
            newTotalExpenses -= deletedTransaction.amount;
          }
          
          return {
            ...prev,
            totalIncome: newTotalIncome,
            totalExpenses: newTotalExpenses,
            netProfit: newTotalIncome - newTotalExpenses,
            recentTransactions: updatedTransactions
          };
        });
        
        // Update transactions list
         //setTransactions(prev => prev.filter(t => t._id !== transactionToDelete && t._id !== transactionToDelete));
        
        // Close modal and reset
        setShowDeleteModal(false);
        setTransactionToDelete(null);
        
        // Show success message with the message from the API
        const successMessage = response.data.message || "Transaction deleted successfully!";
        
        // Create a success toast notification
        const successToast = document.createElement('div');
        successToast.className = 'position-fixed top-0 end-0 p-3';
        successToast.style.zIndex = '9999';
        successToast.innerHTML = `
          <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header bg-success text-white">
              <strong class="me-auto">Success</strong>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
              ${successMessage}
            </div>
          </div>
        `;
        document.body.appendChild(successToast);
        
        // Remove the toast after 3 seconds
        setTimeout(() => {
          document.body.removeChild(successToast);
        }, 3000);
        
        // Refresh data
        setRefreshData(prev => !prev);
      } else {
        throw new Error(response.data.error || "Failed to delete transaction");
      }
    } catch (err) {
      console.error("Error deleting transaction:", err);
      
      // Get error message from response or use default
      const errorMessage = err.response?.data?.error || err.message || "Failed to delete transaction. Please try again.";
      
      // Create an error toast notification
      const errorToast = document.createElement('div');
      errorToast.className = 'position-fixed top-0 end-0 p-3';
      errorToast.style.zIndex = '9999';
      errorToast.innerHTML = `
        <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="toast-header bg-danger text-white">
            <strong class="me-auto">Error</strong>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
          <div class="toast-body">
            ${errorMessage}
          </div>
        </div>
      `;
      document.body.appendChild(errorToast);
      
      // Remove the toast after 5 seconds
      setTimeout(() => {
        document.body.removeChild(errorToast);
      }, 5000);
    } finally {
      setLoading(prev => ({ ...prev, transactions: false }));
    }
  };

  // Edit transaction
  const editTransaction = (transaction) => {
    setCurrentTransaction({
      ...transaction,
      date: new Date(transaction.date).toISOString().split('T')[0]
    });
    setIsEditing(true);
    setShowTransactionForm(true);
  };

  // Generate financial report
  const generateReport = () => {
    // In a real application, this would generate a PDF or Excel file
    alert("Financial report generated! In a real application, this would download a PDF or Excel file.");
  };

  return (
    <div>
      {/* Navbar */}
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
                      <h3 className="fw-bold mb-0">${(financialData.totalIncome / 83).toLocaleString(undefined, {maximumFractionDigits: 2})}</h3>
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
                      <h3 className="fw-bold mb-0">${(financialData.totalExpenses / 83).toLocaleString(undefined, {maximumFractionDigits: 2})}</h3>
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
                      <h3 className="fw-bold mb-0">${(financialData.netProfit / 83).toLocaleString(undefined, {maximumFractionDigits: 2})}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === "overview" ? "active" : ""}`}
                onClick={() => setActiveTab("overview")}
              >
                Overview
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === "transactions" ? "active" : ""}`}
                onClick={() => setActiveTab("transactions")}
              >
                Transactions
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === "reports" ? "active" : ""}`}
                onClick={() => setActiveTab("reports")}
              >
                Reports
              </button>
            </li>
          </ul>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div>
                <div className="row g-4 mb-4">
                  {/* Monthly Income & Expenses Chart - Full Width */}
                  <div className="col-12">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body p-4">
                        <h5 className="card-title fw-bold mb-4">Monthly Income & Expenses</h5>
                        <div className="chart-container" style={{ height: "350px", position: "relative" }}>
                          {/* In a real application, this would be a chart component */}
                          <div className="d-flex justify-content-between" style={{ height: "100%" }}>
                            {monthlyFinancials.map((month, index) => (
                              <div key={index} className="d-flex flex-column justify-content-end align-items-center" style={{ width: `${100 / monthlyFinancials.length}%` }}>
                                <div className="d-flex flex-column" style={{ width: "80%", height: "100%" }}>
                                  <div 
                                    style={{ 
                                      height: `${(month.income / 150000) * 100}%`,
                                      marginBottom: "2px",
                                      borderRadius: "2px 2px 0 0",
                                      backgroundColor: "#188752"
                                    }}
                                  ></div>
                                  <div 
                                    style={{ 
                                      height: `${(month.expenses / 150000) * 100}%`,
                                      borderRadius: "0 0 2px 2px",
                                      backgroundColor: "#D93744"
                                    }}
                                  ></div>
                                </div>
                                <small className="text-muted mt-2">{month.month}</small>
                              </div>
                            ))}
                          </div>
                          <div className="position-absolute top-0 end-0">
                            <div className="d-flex align-items-center me-3">
                              <div className="rounded-circle me-2" style={{ width: "10px", height: "10px", backgroundColor: "#188752" }}></div>
                              <small className="text-muted">Income</small>
                            </div>
                            <div className="d-flex align-items-center">
                              <div className="rounded-circle me-2" style={{ width: "10px", height: "10px", backgroundColor: "#D93744" }}></div>
                              <small className="text-muted">Expenses</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Category Charts Side by Side */}
                <div className="row g-4 mb-4">
                  {/* Income by Category */}
                  <div className="col-lg-6">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-4">
                        <h5 className="card-title fw-bold mb-4">Income by Category</h5>
                        <div className="chart-container" style={{ height: "300px", position: "relative" }}>
                          {/* In a real application, this would be a pie chart */}
                          <div className="d-flex flex-column justify-content-center h-100">
                            {incomeByCategory.map((category, index) => (
                              <div key={index} className="mb-3">
                                <div className="d-flex justify-content-between mb-1">
                                  <span>{category.category}</span>
                                  <span className="fw-bold">${(category.amount / 83).toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                                </div>
                                <div className="progress" style={{ height: "10px" }}>
                                  <div 
                                    className="progress-bar bg-success" 
                                    role="progressbar" 
                                    style={{ width: `${(category.amount / financialData.totalIncome) * 100}%` }}
                                    aria-valuenow={(category.amount / financialData.totalIncome) * 100}
                                    aria-valuemin="0" 
                                    aria-valuemax="100"
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expenses by Category */}
                  <div className="col-lg-6">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-4">
                        <h5 className="card-title fw-bold mb-4">Expenses by Category</h5>
                        <div className="chart-container" style={{ height: "300px", position: "relative" }}>
                          {/* In a real application, this would be a pie chart */}
                          <div className="d-flex flex-column justify-content-center h-100">
                            {expensesByCategory.map((category, index) => (
                              <div key={index} className="mb-3">
                                <div className="d-flex justify-content-between mb-1">
                                  <span>{category.category}</span>
                                  <span className="fw-bold">${(category.amount / 83).toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                                </div>
                                <div className="progress" style={{ height: "10px" }}>
                                  <div 
                                    className="progress-bar bg-danger" 
                                    role="progressbar" 
                                    style={{ width: `${(category.amount / financialData.totalExpenses) * 100}%` }}
                                    aria-valuenow={(category.amount / financialData.totalExpenses) * 100}
                                    aria-valuemin="0" 
                                    aria-valuemax="100"
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Recent Transactions - Full Width at Bottom */}
                <div className="row g-4 mb-4">
                  <div className="col-12">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h5 className="card-title fw-bold mb-0">Recent Transactions</h5>
                          <button 
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => setActiveTab("transactions")}
                          >
                            View All
                          </button>
                        </div>
                        <div className="table-responsive">
                          <table className="table table-hover">
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {financialData.recentTransactions.slice(0, 5).map((transaction) => (
                                <tr key={transaction.id}>
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
                    <button 
                      className="btn btn-primary"
                      onClick={() => {
                        resetTransactionForm();
                        setShowTransactionForm(true);
                      }}
                    >
                      Add New Transaction
                    </button>
                  </div>
                  
                  {/* Transaction Form Modal */}
                  {showTransactionForm && (
                    <div className="card mb-4 border-0 shadow-sm">
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h5 className="card-title fw-bold mb-0">
                            {isEditing ? "Edit Transaction" : "Add New Transaction"}
                          </h5>
                          <button 
                            className="btn-close" 
                            onClick={resetTransactionForm}
                            aria-label="Close"
                          ></button>
                        </div>
                        
                        <form onSubmit={isEditing ? updateTransaction : createTransaction}>
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label">Date</label>
                              <input 
                                type="date" 
                                className={`form-control ${validationErrors.date ? 'is-invalid' : ''}`}
                                name="date"
                                value={currentTransaction.date}
                                onChange={handleTransactionChange}
                                required
                              />
                              {validationErrors.date && (
                                <div className="invalid-feedback">{validationErrors.date}</div>
                              )}
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Type</label>
                              <select 
                                className="form-select" 
                                name="type"
                                value={currentTransaction.type}
                                onChange={handleTransactionChange}
                                required
                              >
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                              </select>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Amount</label>
                              <div className="input-group">
                                <span className="input-group-text">$</span>
                                <input 
                                  type="number" 
                                  className={`form-control ${validationErrors.amount ? 'is-invalid' : ''}`}
                                  name="amount"
                                  value={currentTransaction.amount}
                                  onChange={handleTransactionChange}
                                  min="0"
                                  step="0.01"
                                  required
                                />
                                {validationErrors.amount && (
                                  <div className="invalid-feedback">{validationErrors.amount}</div>
                                )}
                              </div>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Category</label>
                              <select 
                                className={`form-select ${validationErrors.category ? 'is-invalid' : ''}`}
                                name="category"
                                value={currentTransaction.category}
                                onChange={handleTransactionChange}
                                required
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
                              {validationErrors.category && (
                                <div className="invalid-feedback">{validationErrors.category}</div>
                              )}
                            </div>
                            <div className="col-12">
                              <label className="form-label">Description</label>
                              <input 
                                type="text" 
                                className={`form-control ${validationErrors.description ? 'is-invalid' : ''}`}
                                name="description"
                                value={currentTransaction.description}
                                onChange={handleTransactionChange}
                                required
                              />
                              {validationErrors.description && (
                                <div className="invalid-feedback">{validationErrors.description}</div>
                              )}
                            </div>
                            <div className="col-12 mt-4">
                              <div className="d-flex justify-content-end">
                                <button 
                                  type="button" 
                                  className="btn btn-outline-secondary me-2"
                                  onClick={resetTransactionForm}
                                >
                                  Cancel
                                </button>
                                <button 
                                  type="submit" 
                                  className="btn btn-primary"
                                  disabled={loading.transactions}
                                >
                                  {loading.transactions ? (
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                  ) : null}
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
                    <div className="col-md-3">
                      <label className="form-label">Start Date</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">End Date</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Transaction Type</label>
                      <select 
                        className="form-select" 
                        name="transactionType"
                        value={filters.transactionType}
                        onChange={handleFilterChange}
                      >
                        <option value="all">All</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Search</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <Search size={16} />
                        </span>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Search transactions..." 
                          name="searchQuery"
                          value={filters.searchQuery}
                          onChange={handleFilterChange}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Transactions Table */}
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
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
                          <tr key={transaction.id}>
                            <td>{new Date(transaction.date).toLocaleDateString()}</td>
                            <td>{transaction.description}</td>
                            <td>{transaction.category}</td>
                            <td className={`fw-medium ${transaction.type === "income" ? "text-success" : "text-danger"}`}>
                              {transaction.type === "income" ? "+" : "-"}${transaction.amount.toLocaleString()}
                            </td>
                            <td>
                              <span className={`badge ${transaction.type === "income" ? "bg-success" : "bg-danger"}`}>
                                {transaction.type === "income" ? "Income" : "Expense"}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex">
                                <button 
                                  className="btn btn-sm btn-outline-primary me-2"
                                  onClick={() => editTransaction(transaction)}
                                >
                                  Edit
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => deleteTransaction(transaction._id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {filteredTransactions.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-muted">No transactions found matching your filters.</p>
                    </div>
                  )}
                  
                  {/* Delete Confirmation Modal */}
                  {showDeleteModal && (
                    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                      <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h5 className="modal-title">Confirm Delete</h5>
                            <button 
                              type="button" 
                              className="btn-close" 
                              onClick={() => {
                                setShowDeleteModal(false);
                                setTransactionToDelete(null);
                              }}
                            ></button>
                          </div>
                          <div className="modal-body">
                            <p>Are you sure you want to delete this transaction? This action cannot be undone.</p>
                          </div>
                          <div className="modal-footer">
                            <button 
                              type="button" 
                              className="btn btn-secondary" 
                              onClick={() => {
                                setShowDeleteModal(false);
                                setTransactionToDelete(null);
                              }}
                            >
                              Cancel
                            </button>
                            <button 
                              type="button" 
                              className="btn btn-danger"
                              onClick={confirmDeleteTransaction}
                              disabled={loading.transactions}
                            >
                              {loading.transactions ? (
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              ) : null}
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
                  
                  {/* Report Generation Form */}
                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <label className="form-label">Report Type</label>
                      <select className="form-select">
                        <option>Income Statement</option>
                        <option>Balance Sheet</option>
                        <option>Cash Flow Statement</option>
                        <option>Tax Summary</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Start Date</label>
                      <input type="date" className="form-control" />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">End Date</label>
                      <input type="date" className="form-control" />
                    </div>
                  </div>
                  
                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <button 
                      className="btn btn-primary"
                      onClick={generateReport}
                    >
                      <Download size={16} className="me-2" />
                      Generate Report
                    </button>
                  </div>
                  
                  {/* Saved Reports */}
                  <h6 className="fw-bold mt-5 mb-3">Saved Reports</h6>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Report Name</th>
                          <th>Type</th>
                          <th>Date Range</th>
                          <th>Generated On</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Q3 Income Statement</td>
                          <td>Income Statement</td>
                          <td>Jul 1, 2023 - Sep 30, 2023</td>
                          <td>Oct 5, 2023</td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary me-2">
                              <Download size={14} />
                            </button>
                          </td>
                        </tr>
                        <tr>
                          <td>Q2 Income Statement</td>
                          <td>Income Statement</td>
                          <td>Apr 1, 2023 - Jun 30, 2023</td>
                          <td>Jul 5, 2023</td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary me-2">
                              <Download size={14} />
                            </button>
                          </td>
                        </tr>
                        <tr>
                          <td>Q1 Income Statement</td>
                          <td>Income Statement</td>
                          <td>Jan 1, 2023 - Mar 31, 2023</td>
                          <td>Apr 5, 2023</td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary me-2">
                              <Download size={14} />
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
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