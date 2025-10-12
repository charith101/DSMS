import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaLock, FaUser } from 'react-icons/fa';

const FinancialManagerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // to authenticate with the backend API
      try {
        const response = await axios.post('/api/auth/login', { email, password });
        
        // Check if user has financial manager role
        if (response.data.user.role === 'financial_manager') {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          navigate('/financial-manager');
          return;
        } else {
          setError('Access denied. You do not have financial manager privileges.');
          return;
        }
      } catch (apiError) {
        console.log('API login failed, trying mock authentication:', apiError);
        
        // If API call fails, try mock authentication
        const mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
        const user = mockUsers.find(u => u.email === email && u.password === password);
        
        if (user && user.role === 'financial_manager') {
          // Create mock response
          const mockResponse = {
            token: 'mock-jwt-token-for-financial-manager',
            user: {
              id: user.id,
              fullName: user.fullName,
              email: user.email,
              role: user.role
            }
          };
          
          // Store user data and token
          localStorage.setItem('token', mockResponse.token);
          localStorage.setItem('user', JSON.stringify(mockResponse.user));
          
          // Navigate to dashboard
          navigate('/financial-manager');
          return;
        }
        
        // If mock authentication also fails, show error
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white text-center py-3">
              <h3>Financial Manager Login</h3>
            </Card.Header>
            <Card.Body className="p-4">
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaUser className="me-2" /> Email Address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>
                    <FaLock className="me-2" /> Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    size="lg" 
                    disabled={loading}
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FinancialManagerLogin;