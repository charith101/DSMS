import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import InstructorNav from './InstructorNav';
import ErrorHandle from "../errorHandle";

const InstructorPayments = () => {
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  
  const userId = localStorage.getItem('userId'); // Assuming userId is stored after login

  useEffect(() => {
    if (userId) {
      fetchPayrollRecords();
    } else {
      setErrorMsg("User not authenticated. Please login again.");
      setLoading(false);
    }
  }, [userId, selectedYear]);

  const fetchPayrollRecords = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setErrorMsg("");
      setRefreshing(true);
      
      const params = new URLSearchParams();
      if (selectedYear) {
        params.append('year', selectedYear);
      }
      
      const response = await axios.get(
        `http://localhost:3001/employee/getMyPayroll?userId=${userId}`,
        { params }
      );
      
      setPayrollRecords(response.data);
    } catch (err) {
      console.error('Error fetching payroll records:', err);
      setErrorMsg(err.response?.data?.error || "Failed to fetch payroll records");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return 'Not paid yet';
    return new Date(date).toLocaleDateString('en-LK', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const badgeClass = status === 'Paid' ? 'bg-success' : 'bg-warning';
    return <span className={`badge ${badgeClass}`}>{status}</span>;
  };

  const handleRefresh = () => {
    fetchPayrollRecords();
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  const pluralize = (count, singular, plural) => {
    return count === 1 ? singular : plural;
  };

  const groupByYear = (records) => {
    const grouped = {};
    records.forEach(record => {
      const year = record.month.split('-')[0];
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(record);
    });

    return Object.keys(grouped).sort((a, b) => b - a).map(year => ({
      year,
      records: grouped[year].sort((a, b) => b.month.localeCompare(a.month))
    }));
  };

  const groupedRecords = groupByYear(payrollRecords);

  // Generate year options for filter (last 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div>
      {/* Navbar - Matching InstructorSchedule */}
      <InstructorNav page="payments" />

      {/* Header Section - Matching InstructorSchedule styling */}
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
          <h1 className="fw-bold display-5 mb-3 mx-1">My Payment History</h1>
          <h6 className="fs-6 lead opacity-90">
            View your payroll records and payment status
          </h6>
        </div>
      </section>

      {/* Main Content - Matching InstructorSchedule layout */}
      <div className="ms-auto" style={{ marginLeft: '250px', paddingTop: '40px' }}>
        <div className="py-5 bg-light">
          <div className="container">
            {/* Success and Error Messages */}
            {successMsg && (
              <div className="alert alert-success alert-dismissible fade show" role="alert">
                <AlertCircle size={20} className="me-2" />
                {successMsg}
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setSuccessMsg("")}
                  aria-label="Close"
                ></button>
              </div>
            )}

            {errorMsg && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <AlertCircle size={20} className="me-2" />
                {errorMsg}
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setErrorMsg("")}
                  aria-label="Close"
                ></button>
              </div>
            )}

            <div className="row g-4">
              {/* Filter Control */}
              <div className="col-12">
                <div className="card border-2 shadow-sm p-3">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center justify-content-between mb-4">
                      <div className="form-group">
                        <label className="fw-semibold me-2" htmlFor="yearFilter">Filter by Year:</label>
                        <select
                          id="yearFilter"
                          className="form-select d-inline-block w-auto"
                          value={selectedYear}
                          onChange={handleYearChange}
                        >
                          <option value="">All Years</option>
                          {yearOptions.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        className="btn btn-primary px-4 py-2"
                        onClick={handleRefresh}
                        disabled={refreshing}
                      >
                        {refreshing ? (
                          <>
                            <RefreshCw className="me-2 animate-spin" size={16} />
                            Refreshing...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="me-2" size={16} /> Refresh Records
                          </>
                        )}
                      </button>
                    </div>
                    
                    <div className="border-top pt-3">
                      <small className="text-muted">
                        Showing {payrollRecords.length} {pluralize(payrollRecords.length, 'payroll record', 'payroll records')} across {groupedRecords.length} {pluralize(groupedRecords.length, 'year', 'years')}
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payroll Records Display Card */}
              <div className="col-12">
                <div className="card border-2 shadow-sm p-3">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-4">
                      <div className="bg-info bg-opacity-10 rounded-circle p-3 me-3">
                        <span className="currency-symbol text-info">Rs.</span>
                      </div>
                      <div>
                        <h3 className="mb-1 fw-bold">Payment History</h3>
                        <small className="text-muted">
                          {loading ? 'Loading...' : 
                            `${payrollRecords.length} total ${pluralize(payrollRecords.length, 'payroll record', 'payroll records')} across ${groupedRecords.length} ${pluralize(groupedRecords.length, 'year', 'years')}`}
                        </small>
                      </div>
                    </div>
                    
                    {loading ? (
                      <div className="text-center py-5">
                        <RefreshCw className="animate-spin text-primary mb-3" size={64} />
                        <h5 className="text-muted">Loading your payment history...</h5>
                        <p className="text-muted">Please wait while we fetch all your payroll records</p>
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : payrollRecords.length === 0 ? (
                      <div className="text-center py-5">
                        <span className="currency-symbol text-muted mb-4">Rs.</span>
                        <h5 className="text-muted mb-4">No payroll records found</h5>
                        <p className="text-muted mb-4">
                          No payroll records available for {selectedYear || 'the selected period'}. Contact administration for assistance.
                        </p>
                        <button
                          className="btn btn-primary px-4 py-2"
                          onClick={handleRefresh}
                          disabled={refreshing}
                        >
                          {refreshing ? (
                            <>
                              <RefreshCw className="me-2 animate-spin" size={16} />
                              Refreshing...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="me-2" size={16} /> Refresh Records
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="payroll-container">
                        {groupedRecords.map((yearGroup) => (
                          <div key={yearGroup.year} className="mb-4">
                            {/* Year Header */}
                            <div className="year-header mb-3 p-3 rounded bg-light border">
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center">
                                  <Calendar size={20} className="me-2 text-primary" />
                                  <div>
                                    <h5 className="mb-0 fw-bold">{yearGroup.year}</h5>
                                    <small className="text-muted">
                                      {yearGroup.records.length} {pluralize(yearGroup.records.length, 'payroll record', 'payroll records')}
                                    </small>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Payroll records for this year */}
                            <div className="table-responsive">
                              <table className="table table-striped table-hover perfectly-aligned">
                                <thead className="table-light">
                                  <tr>
                                    <th scope="col" className="month-col">
                                      <div className="column-header">
                                        <Calendar size={16} className="me-2 header-icon" />
                                        <span className="header-text">Month</span>
                                      </div>
                                    </th>
                                    <th scope="col" className="hours-col text-center">
                                      <div className="column-header">
                                        <span className="header-text duration-header">Hours</span>
                                      </div>
                                    </th>
                                    <th scope="col" className="rate-col text-center">
                                      <div className="column-header">
                                        <span className="currency-symbol header-icon text-success">Rs.</span>
                                        <span className="header-text rate-header">Hourly Rate</span>
                                      </div>
                                    </th>
                                    <th scope="col" className="salary-col text-center">
                                      <div className="column-header">
                                        <span className="currency-symbol header-icon text-info">Rs.</span>
                                        <span className="header-text salary-header">Total Salary</span>
                                      </div>
                                    </th>
                                    <th scope="col" className="paid-date-col">
                                      <div className="column-header">
                                        <Calendar size={16} className="me-2 header-icon" />
                                        <span className="header-text">Paid Date</span>
                                      </div>
                                    </th>
                                    <th scope="col" className="status-col text-center">
                                      <div className="column-header">
                                        <AlertCircle size={16} className="me-1 header-icon" />
                                        <span className="header-text status-header">Status</span>
                                      </div>
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {yearGroup.records.map((record) => (
                                    <tr key={record._id} className="align-middle">
                                      <td className="month-col">
                                        <div className="column-content">
                                          <Calendar size={16} className="me-2 content-icon text-primary" />
                                          <div className="month-content">
                                            <div className="month-primary">
                                              {new Date(record.month + '-01').toLocaleString('en-LK', { month: 'long', year: 'numeric' })}
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="hours-col text-center">
                                        <div className="column-content hours-content">
                                          <div className="hours-value">
                                            {record.totalHours.toFixed(2)}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="rate-col text-center">
                                        <div className="column-content rate-content">
                                          <div className="rate-value">
                                            {formatCurrency(record.hourlyRate)}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="salary-col text-center">
                                        <div className="column-content salary-content">
                                          <div className="salary-value">
                                            {formatCurrency(record.salary)}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="paid-date-col">
                                        <div className="column-content">
                                          <Calendar size={16} className="me-2 content-icon text-primary" />
                                          <div className="paid-date-content">
                                            <div className="paid-date-primary">
                                              {formatDate(record.paidDate)}
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="status-col text-center">
                                        <div className="column-content status-content">
                                          <div className="status-value">
                                            {getStatusBadge(record.status)}
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payroll Summary Card */}
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-light rounded-circle p-2 me-3">
                        <AlertCircle size={24} className="text-info" />
                      </div>
                      <div>
                        <h6 className="mb-1 fw-bold text-dark">Payroll Summary</h6>
                        <small className="text-muted">Quick overview of your payment history</small>
                      </div>
                    </div>
                    
                    <div className="row text-center g-4">
                      <div className="col-md-4">
                        <div className="fw-bold text-primary fs-2">{payrollRecords.length}</div>
                        <div className="text-muted">{pluralize(payrollRecords.length, 'Total Record', 'Total Records')}</div>
                      </div>
                      <div className="col-md-4">
                        <div className="fw-bold text-success fs-2">
                          {payrollRecords.filter(r => r.status === 'Paid').length}
                        </div>
                        <div className="text-muted">{pluralize(payrollRecords.filter(r => r.status === 'Paid').length, 'Paid', 'Paid')}</div>
                      </div>
                      <div className="col-md-4">
                        <div className="fw-bold text-warning fs-2">
                          {payrollRecords.filter(r => r.status === 'Pending').length}
                        </div>
                        <div className="text-muted">{pluralize(payrollRecords.filter(r => r.status === 'Pending').length, 'Pending', 'Pending')}</div>
                      </div>
                    </div>
                    
                    <hr className="my-4" />
                    
                    <div className="row">
                      <div className="col-md-6">
                        <div className="text-muted small">
                          <h6 className="fw-bold mb-2">Payroll Guidelines</h6>
                          <ul className="mb-0 ps-3">
                            <li className="mb-1"><strong>Verification:</strong> Review hours and rates monthly</li>
                            <li className="mb-1"><strong>Discrepancies:</strong> Report issues within 7 days</li>
                            <li className="mb-1"><strong>Payments:</strong> Processed by the 5th of each month</li>
                          </ul>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="text-muted small">
                          <h6 className="fw-bold mb-2">Support</h6>
                          <ul className="mb-0 ps-3">
                            <li className="mb-1"><strong>Issues:</strong> Contact payroll department for disputes</li>
                            <li className="mb-1"><strong>Questions:</strong> Reach out to HR for payment inquiries</li>
                            <li><strong>Records:</strong> Keep personal records for reference</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .payroll-container {
          max-height: 800px;
          overflow-y: auto;
        }
        
        .year-header {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-left: 4px solid #0d6efd;
        }
        
        .table-hover tbody tr:hover {
          background-color: rgba(13, 110, 253, 0.05);
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .form-select {
          border-color: #ced4da;
          padding: 0.375rem 2.25rem 0.375rem 0.75rem;
        }
        
        .currency-symbol {
          font-size: 1rem;
          font-weight: 600;
          line-height: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        
        .currency-symbol.header-icon {
          width: 16px;
          height: 16px;
          margin-right: 0.25rem !important;
        }
        
        .bg-info .currency-symbol {
          font-size: 2rem;
          width: 64px;
          height: 64px;
        }
        
        .text-muted .currency-symbol {
          font-size: 2rem;
          width: 64px;
          height: 64px;
        }
        
        /* Perfect table alignment */
        .perfectly-aligned {
          table-layout: fixed;
          width: 100%;
          border-collapse: collapse;
        }
        
        .perfectly-aligned th,
        .perfectly-aligned td {
          vertical-align: middle !important;
          padding: 0.75rem 0.5rem !important;
          border: 1px solid #dee2e6;
          word-wrap: break-word;
        }
        
        /* Column specific widths and alignment */
        .month-col { width: 20% !important; }
        .hours-col { width: 15% !important; text-align: center !important; }
        .rate-col { width: 15% !important; text-align: center !important; }
        .salary-col { width: 20% !important; text-align: center !important; }
        .paid-date-col { width: 20% !important; }
        .status-col { width: 10% !important; text-align: center !important; }
        
        /* Header styling */
        .column-header {
          display: flex;
          align-items: center;
          min-height: 2.5rem;
          justify-content: flex-start;
        }
        
        .month-col .column-header,
        .paid-date-col .column-header {
          justify-content: flex-start;
        }
        
        .hours-col .column-header,
        .rate-col .column-header,
        .salary-col .column-header,
        .status-col .column-header {
          justify-content: center;
        }
        
        .header-icon {
          flex-shrink: 0;
          margin-right: 0.5rem !important;
        }
        
        .status-col .header-icon,
        .rate-col .header-icon,
        .salary-col .header-icon {
          margin-right: 0.25rem !important;
        }
        
        .header-text {
          font-size: 0.875rem;
          font-weight: 600;
          color: #495057;
          white-space: nowrap;
        }
        
        .duration-header,
        .rate-header,
        .salary-header,
        .status-header {
          font-size: 0.8rem;
        }
        
        /* Content styling */
        .column-content {
          display: flex;
          align-items: center;
          min-height: 3rem;
          width: 100%;
        }
        
        .month-col .column-content,
        .paid-date-col .column-content {
          justify-content: flex-start;
        }
        
        .hours-col .column-content,
        .rate-col .column-content,
        .salary-col .column-content,
        .status-col .column-content {
          justify-content: center;
        }
        
        .content-icon {
          flex-shrink: 0;
          margin-right: 0.5rem !important;
          width: 16px !important;
          height: 16px !important;
        }
        
        /* Month column content */
        .month-content {
          flex-grow: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }
        
        .month-primary {
          font-weight: 600;
          font-size: 0.9rem;
          color: #212529;
          line-height: 1.2;
        }
        
        /* Hours column content */
        .hours-content {
          padding: 0 !important;
        }
        
        .hours-value {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 2.5rem;
          width: 100%;
          font-size: 0.95rem;
          font-weight: 700;
          color: #0d6efd;
          line-height: 1.2;
          text-align: center;
        }
        
        /* Rate column content */
        .rate-content {
          padding: 0 !important;
        }
        
        .rate-value {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 2.5rem;
          width: 100%;
          font-size: 0.95rem;
          font-weight: 600;
          color: #198754;
          line-height: 1.2;
          text-align: center;
        }
        
        /* Salary column content */
        .salary-content {
          padding: 0 !important;
        }
        
        .salary-value {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 2.5rem;
          width: 100%;
          font-size: 0.95rem;
          font-weight: 700;
          color: #0dcaf0;
          line-height: 1.2;
          text-align: center;
        }
        
        /* Paid Date column content */
        .paid-date-content {
          flex-grow: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }
        
        .paid-date-primary {
          font-weight: 500;
          font-size: 0.85rem;
          color: #212529;
          line-height: 1.2;
        }
        
        /* Status column content */
        .status-content {
          padding: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          min-height: 2.5rem;
        }
        
        .status-value .badge {
          font-size: 0.75rem;
          padding: 0.375rem 0.5rem;
          min-width: 70px;
          text-align: center;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .payroll-container {
            max-height: 600px;
          }
          
          .year-header {
            margin: -1rem -1rem 1rem -1rem;
          }
          
          .perfectly-aligned th,
          .perfectly-aligned td {
            padding: 0.5rem 0.25rem !important;
          }
          
          /* Mobile column widths */
          .month-col { width: 25% !important; }
          .hours-col { width: 15% !important; }
          .rate-col { width: 15% !important; }
          .salary-col { width: 15% !important; }
          .paid-date-col { width: 20% !important; }
          .status-col { width: 10% !important; }
          
          .header-text {
            font-size: 0.75rem;
          }
          
          .duration-header,
          .rate-header,
          .salary-header,
          .status-header {
            font-size: 0.7rem;
          }
          
          .content-icon {
            width: 14px !important;
            height: 14px !important;
            margin-right: 0.375rem !important;
          }
          
          .currency-symbol.header-icon {
            font-size: 0.875rem;
          }
          
          .month-primary,
          .paid-date-primary {
            font-size: 0.85rem;
          }
          
          .hours-value,
          .rate-value,
          .salary-value {
            font-size: 0.85rem;
          }
          
          .status-value .badge {
            font-size: 0.7rem;
            padding: 0.25rem 0.375rem;
            min-width: 60px;
          }
        }
        
        @media (max-width: 576px) {
          .perfectly-aligned th,
          .perfectly-aligned td {
            padding: 0.375rem 0.125rem !important;
          }
          
          .column-header,
          .column-content {
            min-height: 2.25rem;
          }
          
          .month-col { width: 30% !important; }
          .hours-col { width: 15% !important; }
          .rate-col { width: 15% !important; }
          .salary-col { width: 15% !important; }
          .paid-date-col { width: 15% !important; }
          .status-col { width: 10% !important; }
          
          .form-select {
            font-size: 0.875rem;
            padding: 0.25rem 2rem 0.25rem 0.5rem;
          }
          
          .currency-symbol.header-icon {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default InstructorPayments;