import React, { useState, useEffect } from "react";
import { DollarSign, TrendingUp } from "lucide-react";
import AdminNav from "./AdminNav";
import axios from "axios";

function FinanceManagement() {
  // State for financial data
  const [financialData, setFinancialData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
  });

  // State for charts
  const [incomeByCategory, setIncomeByCategory] = useState([]);
  const [expensesByCategory, setExpensesByCategory] = useState([]);

  // State for loading and error handling
  const [loading, setLoading] = useState({
    summary: true,
    incomeByCategory: true,
    expensesByCategory: true,
  });
  const [error, setError] = useState({
    summary: null,
    incomeByCategory: null,
    expensesByCategory: null,
  });

  // API base URL
  const API_BASE_URL = "http://localhost:3001";

  // Fetch data from backend
  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setLoading({
          summary: true,
          incomeByCategory: true,
          expensesByCategory: true,
        });

        // Use Promise.all to fetch all data concurrently
        const [
          summaryResponse,
          incomeResponse,
          expensesResponse,
        ] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/finance/summary`),
          axios.get(`${API_BASE_URL}/api/finance/income-by-category`),
          axios.get(`${API_BASE_URL}/api/finance/expenses-by-category`),
        ]);
        
        // Update state with fetched data
        setFinancialData({
          totalIncome: summaryResponse.data.income,
          totalExpenses: summaryResponse.data.expenses,
          netProfit: summaryResponse.data.profit,
        });
        
        setIncomeByCategory(incomeResponse.data);
        setExpensesByCategory(expensesResponse.data);
        
      } catch (err) {
        console.error("Error fetching financial data:", err);
        const errorMessage = err.response?.data?.error || err.message || "Failed to fetch data";
        setError({
          summary: errorMessage,
          incomeByCategory: errorMessage,
          expensesByCategory: errorMessage,
        });
        
      } finally {
        setLoading({
          summary: false,
          incomeByCategory: false,
          expensesByCategory: false,
        });
      }
    };

    fetchFinancialData();
  }, []); // Effect runs once on component mount

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
          <h1 className="fw-bold display-5 mb-3 mx-1">Financial Overview</h1>
          <h6 className="fs-6 lead opacity-90">
            A summary of your income, expenses, and profitability.
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

          {/* MODIFICATION: Removed Tabs and simplified content to only show category charts */}
          {/* Category Charts */}
          <div className="row g-4 mb-4">
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <h5 className="card-title fw-bold mb-4">Income by Category</h5>
                  {loading.incomeByCategory ? (<p>Loading...</p>) : (
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
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <h5 className="card-title fw-bold mb-4">Expenses by Category</h5>
                  {loading.expensesByCategory ? (<p>Loading...</p>) : (
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
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinanceManagement;