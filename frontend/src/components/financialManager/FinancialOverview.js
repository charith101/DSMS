import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Line, Bar, Pie } from 'react-chartjs-2';
import axios from 'axios';
import FinancialManagerNav from './FinancialManagerNav';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const FinancialOverview = () => {
  const [financialData, setFinancialData] = useState({
    monthlyRevenue: [],
    expenseCategories: [],
    paymentMethods: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'financial_manager') {
      window.location.href = '/login';
      return;
    }

    const fetchFinancialOverview = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/finance/overview');
        setFinancialData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching financial overview:', error);
        setLoading(false);
      }
    };

    fetchFinancialOverview();
  }, []);

  // Chart data for monthly revenue/expenses
  const revenueChartData = {
    labels: financialData.monthlyRevenue.map(item => item.month),
    datasets: [
      {
        label: 'Revenue',
        data: financialData.monthlyRevenue.map(item => item.revenue),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4
      },
      {
        label: 'Expenses',
        data: financialData.monthlyRevenue.map(item => item.expenses),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4
      }
    ]
  };

  // Chart data for expense categories
  const expenseCategoryData = {
    labels: financialData.expenseCategories.map(item => item.category),
    datasets: [
      {
        label: 'Expense by Category',
        data: financialData.expenseCategories.map(item => item.amount),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderWidth: 1
      }
    ]
  };

  // Chart data for payment methods
  const paymentMethodData = {
    labels: financialData.paymentMethods.map(item => item.method),
    datasets: [
      {
        label: 'Payment Methods',
        data: financialData.paymentMethods.map(item => item.count),
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)'
        ],
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="dashboard-container">
      <FinancialManagerNav />
      <Container fluid className="mt-4">
        <h2 className="mb-4">Financial Overview</h2>
        
        {loading ? (
          <p>Loading financial overview...</p>
        ) : (
          <>
            {/* Revenue and Expense Trends */}
            <Row className="mb-4">
              <Col md={12}>
                <Card>
                  <Card.Header>Revenue and Expense Trends</Card.Header>
                  <Card.Body>
                    <div style={{ height: '300px' }}>
                      <Line 
                        data={revenueChartData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            title: {
                              display: true,
                              text: 'Monthly Revenue vs Expenses'
                            }
                          }
                        }}
                      />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Expense Categories and Payment Methods */}
            <Row>
              <Col md={6}>
                <Card>
                  <Card.Header>Expense Categories</Card.Header>
                  <Card.Body>
                    <div style={{ height: '300px' }}>
                      <Bar 
                        data={expenseCategoryData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top',
                            },
                            title: {
                              display: true,
                              text: 'Expenses by Category'
                            }
                          }
                        }}
                      />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card>
                  <Card.Header>Payment Methods</Card.Header>
                  <Card.Body>
                    <div style={{ height: '300px' }}>
                      <Pie 
                        data={paymentMethodData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'right',
                            },
                            title: {
                              display: true,
                              text: 'Payment Methods Distribution'
                            }
                          }
                        }}
                      />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </div>
  );
};

export default FinancialOverview;