import React from 'react';
import { Card, Button } from '../../components/shared';
import { ProgressRing } from '../../components/charts';

/**
 * Admin Dashboard - Overview for administrators
 */
const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="content-header">
        <h1 className="content-title">Admin Dashboard</h1>
        <p className="content-description">
          Administrative overview and quick access to payment management tools.
        </p>
      </div>
      
      {/* Quick Stats */}
      <div className="stats-grid">
        <Card className="modern-stat-card stat-card-primary">
          <Card.Body>
            <div className="stat-icon">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">156</div>
              <div className="stat-label">Total Students</div>
              <div className="stat-change stat-change-positive">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                +12 this month
              </div>
            </div>
          </Card.Body>
        </Card>
        
        <Card className="modern-stat-card stat-card-success">
          <Card.Body>
            <div className="stat-icon">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">$8,450</div>
              <div className="stat-label">Monthly Revenue</div>
              <div className="stat-change stat-change-positive">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                +15% from last month
              </div>
            </div>
          </Card.Body>
        </Card>
        
        <Card className="modern-stat-card stat-card-warning">
          <Card.Body>
            <div className="stat-icon">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">23</div>
              <div className="stat-label">Pending Payments</div>
              <div className="stat-change">
                Total: $1,150
              </div>
            </div>
          </Card.Body>
        </Card>
        
        <Card className="modern-stat-card stat-card-info">
          <Card.Body>
            <div className="stat-icon">
              <ProgressRing value={75} size={48} strokeWidth={4} className="text-info" />
            </div>
            <div className="stat-content">
              <div className="stat-value">75%</div>
              <div className="stat-label">Collection Rate</div>
              <div className="stat-change">
                This month: 89 lessons
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <div className="dashboard-grid">
        <Card className="action-card">
          <Card.Header title="Record Payment" />
          <Card.Body>
            <p className="text-secondary text-sm mb-4">
              Record cash or manual payments for students who paid offline.
            </p>
            <Button variant="primary" block>
              Record New Payment
            </Button>
          </Card.Body>
        </Card>
        
        <Card className="action-card">
          <Card.Header title="Generate Invoice" />
          <Card.Body>
            <p className="text-secondary text-sm mb-4">
              Create and send invoices to students for upcoming payments.
            </p>
            <Button variant="secondary" block>
              Create Invoice
            </Button>
          </Card.Body>
        </Card>
        
        <Card className="action-card">
          <Card.Header title="Student Management" />
          <Card.Body>
            <p className="text-secondary text-sm mb-4">
              Manage student accounts, view payment history, and handle inquiries.
            </p>
            <Button variant="outline" block>
              Manage Students
            </Button>
          </Card.Body>
        </Card>
      </div>
      
      {/* Recent Activity */}
      <div className="dashboard-grid">
        <Card className="activity-card">
          <Card.Header title="Recent Payments" />
          <Card.Body>
            <div className="space-y-4">
              <div className="activity-item">
                <div className="activity-indicator success"></div>
                <div className="activity-content">
                  <p className="activity-title">John Doe - Premium Package</p>
                  <p className="activity-subtitle">Payment ID: PAY001</p>
                </div>
                <div className="activity-value">
                  <p className="activity-amount success">$900.00</p>
                  <p className="activity-time">2 hours ago</p>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-indicator success"></div>
                <div className="activity-content">
                  <p className="activity-title">Jane Smith - Individual Lesson</p>
                  <p className="activity-subtitle">Payment ID: PAY002</p>
                </div>
                <div className="activity-value">
                  <p className="activity-amount success">$50.00</p>
                  <p className="activity-time">5 hours ago</p>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-indicator warning"></div>
                <div className="activity-content">
                  <p className="activity-title">Mike Johnson - Basic Package</p>
                  <p className="activity-subtitle">Payment ID: PAY003</p>
                </div>
                <div className="activity-value">
                  <p className="activity-amount warning">$500.00</p>
                  <p className="activity-time">1 day ago</p>
                </div>
              </div>
            </div>
          </Card.Body>
          <Card.Footer>
            <Button variant="outline" size="sm">
              View All Payments
            </Button>
          </Card.Footer>
        </Card>
        
        <Card className="activity-card">
          <Card.Header title="System Alerts" />
          <Card.Body>
            <div className="space-y-3">
              <div className="alert alert-warning">
                <strong>Payment Reminder:</strong> 5 students have overdue payments totaling $750.
              </div>
              
              <div className="alert alert-info">
                <strong>System Update:</strong> Scheduled maintenance on Sunday at 2:00 AM.
              </div>
              
              <div className="alert alert-success">
                <strong>New Feature:</strong> Automated invoice generation is now available.
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;