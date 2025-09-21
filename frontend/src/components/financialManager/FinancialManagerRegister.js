import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaIdCard } from 'react-icons/fa';

const FinancialManagerRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: 'John Smith',
    email: 'john.smith@example.com',
    phone: '0712345678',
    password: 'password123',
    confirmPassword: 'password123',
    financialDetails: 'CPA Certified, 5 years experience'
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Validate phone
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Validate financial details
    if (!formData.financialDetails.trim()) {
      newErrors.financialDetails = 'Financial details are required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendVerificationCode = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // In a real application, this would call an API endpoint to send a verification code
      // For demo purposes, we'll generate a random code
      const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
      setVerificationCode(randomCode);
      setVerificationSent(true);
      
      // Simulate API call
      console.log(`Verification code ${randomCode} sent to ${formData.email}`);
      alert(`For demo purposes, your verification code is: ${randomCode}`);
    } catch (err) {
      setServerError('Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (verificationSent) {
      if (enteredCode !== verificationCode) {
        setServerError('Invalid verification code. Please try again.');
        return;
      }
      
      setLoading(true);
      try {
        // For demo purposes, we'll skip the actual API call
        // and simulate a successful registration
        console.log('Registration data:', {
          ...formData,
          role: 'financial_manager'
        });
        
        // Mock response data
        const mockResponse = {
          token: 'mock-jwt-token-for-financial-manager',
          user: {
            id: 'fm-' + Math.random().toString(36).substr(2, 9),
            fullName: formData.fullName,
            email: formData.email,
            role: 'financial_manager'
          }
        };
        
        // Store user data and token
        localStorage.setItem('token', mockResponse.token);
        localStorage.setItem('user', JSON.stringify(mockResponse.user));
        
        // Show success message
        alert('Registration successful! Redirecting to dashboard...');
        
        // Redirect to dashboard
        navigate('/financial-manager');
      } catch (err) {
        setServerError('Registration failed. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      sendVerificationCode();
    }
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow">
            <Card.Header className="bg-primary text-white text-center py-3">
              <h2>Financial Manager Registration</h2>
            </Card.Header>
            <Card.Body className="p-4">
              {serverError && <Alert variant="danger">{serverError}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                {!verificationSent ? (
                  <>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <FaUser className="me-2" /> Full Name
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            isInvalid={!!errors.fullName}
                            placeholder="Enter your full name"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.fullName}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <FaEnvelope className="me-2" /> Email Address
                          </Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            isInvalid={!!errors.email}
                            placeholder="Enter your email"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.email}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <FaPhone className="me-2" /> Phone Number
                          </Form.Label>
                          <Form.Control
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            isInvalid={!!errors.phone}
                            placeholder="Enter your phone number"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.phone}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <FaIdCard className="me-2" /> Financial Details
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="financialDetails"
                            value={formData.financialDetails}
                            onChange={handleChange}
                            isInvalid={!!errors.financialDetails}
                            placeholder="Enter your financial details"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.financialDetails}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <FaLock className="me-2" /> Password
                          </Form.Label>
                          <Form.Control
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            isInvalid={!!errors.password}
                            placeholder="Create a password"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.password}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <FaLock className="me-2" /> Confirm Password
                          </Form.Label>
                          <Form.Control
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            isInvalid={!!errors.confirmPassword}
                            placeholder="Confirm your password"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.confirmPassword}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                  </>
                ) : (
                  <Form.Group className="mb-4">
                    <Form.Label>Verification Code</Form.Label>
                    <Form.Control
                      type="text"
                      value={enteredCode}
                      onChange={(e) => setEnteredCode(e.target.value)}
                      placeholder="Enter the verification code sent to your email/phone"
                      required
                    />
                    <Form.Text className="text-muted">
                      We've sent a verification code to your email and phone. Please enter it here.
                    </Form.Text>
                  </Form.Group>
                )}
                
                <div className="d-grid gap-2">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    size="lg" 
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : verificationSent ? 'Complete Registration' : 'Verify & Continue'}
                  </Button>
                  
                  {verificationSent && (
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => sendVerificationCode()} 
                      disabled={loading}
                    >
                      Resend Verification Code
                    </Button>
                  )}
                </div>
              </Form>
              
              <div className="text-center mt-4">
                <p>
                  Already have an account?{' '}
                  <Link to="/financial-manager-login">Login here</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FinancialManagerRegister;