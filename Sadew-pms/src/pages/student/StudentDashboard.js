import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../../components/shared';

/**
 * Student Dashboard - Overview of student's account and quick actions
 */
const StudentDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="content-header">
        <h1 className="content-title">Student Dashboard</h1>
        <p className="content-description">
          Welcome back! Here's an overview of your account and recent activity.
        </p>
      </div>
      
      {/* Quick Stats - Modern Redesign */}
      <div className="modern-stats-grid">
        <Card className="modern-stat-card stat-card-primary">
          <Card.Body className="modern-stat-body">
            <div className="stat-icon-wrapper">
              <div className="stat-icon stat-icon-primary">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="stat-content">
              <div className="stat-value">$500</div>
              <div className="stat-label">Account Balance</div>
              <div className="stat-change stat-change-warning">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                $100 pending
              </div>
            </div>
          </Card.Body>
        </Card>
        
        <Card className="modern-stat-card stat-card-success">
          <Card.Body className="modern-stat-body">
            <div className="stat-icon-wrapper">
              <div className="stat-icon stat-icon-success">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <div className="stat-content">
              <div className="stat-value"> 8 </div>
              <div className="stat-label">Lessons Remaining</div>
              <div className="stat-change stat-change-positive">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                2 scheduled
              </div>
            </div>
          </Card.Body>
        </Card>
        
        <Card className="modern-stat-card stat-card-info">
          <Card.Body className="modern-stat-body">
            <div className="stat-icon-wrapper">
              <div className="stat-icon stat-icon-info">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="stat-content">
              <div className="stat-value">3</div>
              <div className="stat-label">Completed Payments</div>
              <div className="stat-change stat-change-neutral">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Last payment: Jan 15
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
      
      
 
      
      {/* Recent Activity */}
      <Card>
        <Card.Header title="Recent Activity" />
        <Card.Body>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-success-color rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">Payment completed for Basic Package</p>
                <p className="text-xs text-secondary">January 15, 2024 at 2:30 PM</p>
              </div>
              <div className="text-sm font-medium text-success-color">$500.00</div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary-color rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">Invoice generated for Additional Lessons</p>
                <p className="text-xs text-secondary">January 12, 2024 at 10:15 AM</p>
              </div>
              <div className="text-sm font-medium text-primary-color">$100.00</div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-warning-color rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">Package purchased - Basic Driving Lessons</p>
                <p className="text-xs text-secondary">January 10, 2024 at 4:45 PM</p>
              </div>
              <div className="text-sm font-medium text-warning-color">$500.00</div>
            </div>
          </div>
        </Card.Body>
        <Card.Footer>
          <Link to="/student/history" className="link text-sm">
            View all activity →
          </Link>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default StudentDashboard;