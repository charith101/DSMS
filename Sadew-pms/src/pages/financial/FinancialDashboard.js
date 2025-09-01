import React from 'react';
import { Card, Button } from '../../components/shared';
import { ProgressRing, BarChart, DonutChart } from '../../components/charts';

/**
 * Financial Dashboard - Comprehensive financial overview and metrics
 */
const FinancialDashboard = () => {
  return (
    <div className="space-y-6 max-w-full overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="content-header">
        <h1 className="content-title animate-slideInDown">Financial Dashboard</h1>
        <p className="content-description animate-slideInDown animation-delay-100">
          Comprehensive financial analytics and reporting for your driving school.
        </p>
      </div>
      
      {/* Key Metrics */}
      <div className="stats-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="modern-stat-card stat-card-primary transform hover:scale-105 transition-transform duration-300">
          <Card.Body>
            <div className="stat-icon">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">$45,230</div>
              <div className="stat-label">Total Revenue</div>
               <div className="stat-change stat-change-positive">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                +18% from last month
              </div>
            </div>
          </Card.Body>
        </Card>
        
        <Card className="modern-stat-card stat-card-success transform hover:scale-105 transition-transform duration-300">
          <Card.Body>
            <div className="stat-icon">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="stat-content">
             <div className="stat-value">$8,450</div>
              <div className="stat-label">This Month</div>
              <div className="stat-change stat-change-positive">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                +25% from last month
              </div>
            </div>
          </Card.Body>
        </Card>
        
        <Card className="modern-stat-card stat-card-warning transform hover:scale-105 transition-transform duration-300">
          <Card.Body>
            <div className="stat-icon">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">$2,150</div>
              <div className="stat-label">Outstanding</div>
               <div className="stat-change">
                23 pending payments
              </div>
            </div>
          </Card.Body>
        </Card>
        
        <Card className="modern-stat-card stat-card-info transform hover:scale-105 transition-transform duration-300">
          <Card.Body>
            <div className="stat-icon">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">94.2%</div>
              <div className="stat-label">Collection Rate</div>
              
              <div className="stat-change stat-change-positive">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                +2.1% from last month
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
      
      {/* Charts Section */}
      <div className="dashboard-grid grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="action-card shadow-lg hover:shadow-xl transition-shadow duration-300">
          <Card.Header 
            title="Revenue Trend (Last 6 Months)" 
            subtitle="Monthly revenue performance"
            actions={
              <div className="flex space-x-2 hidden sm:flex">
                <Button variant="outline" size="sm">Monthly</Button>
                <Button variant="ghost" size="sm">Quarterly</Button>
              </div>
            }
          />
          <Card.Body className="pt-4 px-2 sm:px-4">
            <div className="chart-container chart-animated overflow-x-auto">
              <BarChart 
                data={[
                  { label: 'Jan', value: 6500, color: 'var(--primary-500)' },
                  { label: 'Feb', value: 7200, color: 'var(--primary-500)' },
                  { label: 'Mar', value: 6800, color: 'var(--primary-500)' },
                  { label: 'Apr', value: 8100, color: 'var(--primary-500)' },
                  { label: 'May', value: 7900, color: 'var(--primary-500)' },
                  { label: 'Jun', value: 8450, color: 'var(--success-500)' }
                ]}
                height={250}
                showValues={true}
                animationDuration={800}
                responsiveWidth={true}
              />
            </div>
            <div className="mt-4 flex flex-col sm:flex-row justify-between text-sm text-secondary">
              <div className="mb-2 sm:mb-0">Total: <span className="font-semibold">$44,950</span></div>
              <div>Average: <span className="font-semibold">$7,492</span></div>
            </div>
          </Card.Body>
        </Card>
        
        <Card className="action-card shadow-lg hover:shadow-xl transition-shadow duration-300">
          <Card.Header 
            title="Payment Methods Distribution" 
            subtitle="How students are paying"
            actions={
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </Button>
            }
          />
          <Card.Body className="pt-4 flex justify-center">
            <div className="chart-container chart-animated w-full max-w-xs sm:max-w-none">
              <DonutChart 
                data={[
                  { label: 'Online Payment', value: 45, color: 'var(--primary-500)' },
                  { label: 'Cash', value: 30, color: 'var(--success-500)' },
                  { label: 'Bank Transfer', value: 20, color: 'var(--info-500)' },
                  { label: 'Check', value: 5, color: 'var(--warning-500)' }
                ]}
                size={220}
                centerLabel="Payment Methods"
                showLegend={true}
                animationDuration={1000}
                hoverEffect={true}
                responsiveSize={true}
              />
            </div>
          </Card.Body>
          <Card.Footer>
            <div className="text-xs text-secondary text-center sm:text-left">Based on transactions from the last 30 days</div>
          </Card.Footer>
        </Card>
      </div>
      
      
      {/* Recent Transactions */}
      <div>
        <Card className="modern-card transactions-card shadow-lg hover:shadow-xl transition-shadow duration-300">
          <Card.Header 
            title="Recent Transactions" 
            subtitle="Latest financial activities"
            actions={
              <div className="flex items-center space-x-2">
                <div className="relative hidden sm:block">
                  <select className="appearance-none bg-transparent border border-gray-200 rounded-md py-1 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option>All</option>
                    <option>Income</option>
                    <option>Expense</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </Button>
              </div>
            }
          />
          <Card.Body className="p-0 overflow-x-auto">
            <div className="modern-transactions-list">
              <div className="transaction-item hover:bg-gray-50 transition-colors duration-150 p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="transaction-icon bg-success-50 text-success-500 p-2 rounded-full mr-3">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 truncate">John Doe - Premium Package</div>
                    <div className="text-xs text-gray-500 flex flex-wrap items-center">
                      <span className="truncate">Credit Card • 2 hours ago</span>
                      <span className="mx-2 hidden sm:inline">•</span>
                      <span className="transaction-status text-success-500">Completed</span>
                    </div>
                  </div>
                </div>
                <div className="transaction-amount font-medium text-success-500 whitespace-nowrap ml-2">+$900.00</div>
              </div>
              
              <div className="transaction-item hover:bg-gray-50 transition-colors duration-150 p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="transaction-icon bg-success-50 text-success-500 p-2 rounded-full mr-3">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 truncate">Jane Smith - Individual Lesson</div>
                    <div className="text-xs text-gray-500 flex flex-wrap items-center">
                      <span className="truncate">Cash • 5 hours ago</span>
                      <span className="mx-2 hidden sm:inline">•</span>
                      <span className="transaction-status text-success-500">Completed</span>
                    </div>
                  </div>
                </div>
                <div className="transaction-amount font-medium text-success-500 whitespace-nowrap ml-2">+$50.00</div>
              </div>
              
              <div className="transaction-item hover:bg-gray-50 transition-colors duration-150 p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="transaction-icon bg-danger-50 text-danger-500 p-2 rounded-full mr-3">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 truncate">Refund - Mike Johnson</div>
                    <div className="text-xs text-gray-500 flex flex-wrap items-center">
                      <span className="truncate">Package cancellation • 1 day ago</span>
                      <span className="mx-2 hidden sm:inline">•</span>
                      <span className="transaction-status text-info-500">Refunded</span>
                    </div>
                  </div>
                </div>
                <div className="transaction-amount font-medium text-danger-500 whitespace-nowrap ml-2">-$200.00</div>
              </div>
            </div>
          </Card.Body>
          <Card.Footer className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-4">
            <div className="text-sm text-gray-500 mb-2 sm:mb-0">Showing 3 of 24 transactions</div>
            <Button variant="primary" size="sm" className="flex items-center">
              View All
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </Card.Footer>
        </Card>
      </div>
      
      {/* Monthly Summary */}
      <Card className="modern-card summary-card shadow-lg hover:shadow-xl transition-shadow duration-300">
        <Card.Header 
          title="Monthly Summary" 
          subtitle="Financial performance overview"
          actions={
            <div className="flex items-center space-x-2">
              <select className="appearance-none bg-transparent border border-gray-200 rounded-md py-1 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hidden sm:inline-block">
                <option>June 2023</option>
                <option>May 2023</option>
                <option>April 2023</option>
              </select>
              <Button variant="ghost" size="sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </Button>
            </div>
          }
        />
        <Card.Body className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="summary-section">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-1 sm:mb-0">Revenue Breakdown</h4>
                <span className="text-sm font-bold text-success-500">$8,000</span>
              </div>
              <div className="space-y-4">
                <div className="summary-item">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
                    <div className="flex items-center mb-1 sm:mb-0">
                      <span className="w-3 h-3 rounded-full bg-primary-500 mr-2"></span>
                      <span className="text-sm">Tuition Fees</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium">$6,240</span>
                      <span className="text-xs text-gray-500 ml-1">(78%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-primary-500 h-2 rounded-full transition-all duration-500 ease-in-out" style={{ width: '78%' }}></div>
                  </div>
                </div>
                
                <div className="summary-item">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
                    <div className="flex items-center mb-1 sm:mb-0">
                      <span className="w-3 h-3 rounded-full bg-success-500 mr-2"></span>
                      <span className="text-sm">Material Fees</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium">$1,120</span>
                      <span className="text-xs text-gray-500 ml-1">(14%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-success-500 h-2 rounded-full transition-all duration-500 ease-in-out" style={{ width: '14%' }}></div>
                  </div>
                </div>
                
                <div className="summary-item">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
                    <div className="flex items-center mb-1 sm:mb-0">
                      <span className="w-3 h-3 rounded-full bg-info-500 mr-2"></span>
                      <span className="text-sm">Registration Fees</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium">$640</span>
                      <span className="text-xs text-gray-500 ml-1">(8%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-info-500 h-2 rounded-full transition-all duration-500 ease-in-out" style={{ width: '8%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="summary-section">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-1 sm:mb-0">Expense Breakdown</h4>
                <span className="text-sm font-bold text-danger-500">$6,000</span>
              </div>
              <div className="space-y-4">
                <div className="summary-item">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
                    <div className="flex items-center mb-1 sm:mb-0">
                      <span className="w-3 h-3 rounded-full bg-warning-500 mr-2"></span>
                      <span className="text-sm">Staff Salaries</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium">$4,200</span>
                      <span className="text-xs text-gray-500 ml-1">(70%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-warning-500 h-2 rounded-full transition-all duration-500 ease-in-out" style={{ width: '70%' }}></div>
                  </div>
                </div>
                
                <div className="summary-item">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
                    <div className="flex items-center mb-1 sm:mb-0">
                      <span className="w-3 h-3 rounded-full bg-danger-500 mr-2"></span>
                      <span className="text-sm">Facilities</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium">$1,200</span>
                      <span className="text-xs text-gray-500 ml-1">(20%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-danger-500 h-2 rounded-full transition-all duration-500 ease-in-out" style={{ width: '20%' }}></div>
                  </div>
                </div>
                
                <div className="summary-item">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
                    <div className="flex items-center mb-1 sm:mb-0">
                      <span className="w-3 h-3 rounded-full bg-gray-500 mr-2"></span>
                      <span className="text-sm">Materials</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium">$600</span>
                      <span className="text-xs text-gray-500 ml-1">(10%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-gray-500 h-2 rounded-full transition-all duration-500 ease-in-out" style={{ width: '10%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          
        </Card.Body>
      </Card>
    </div>
  );
};

export default FinancialDashboard;