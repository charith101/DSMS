import React, { useState } from 'react';
import { Card, Button, Form, Container, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function StudentCardPayment() {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardType, setCardType] = useState('Visa');
  const [name, setName] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would send card details to your backend/payment gateway
    setShowAlert(true);
    setAlertType('success');
    setAlertMessage('Payment successful!');
    setTimeout(() => {
      navigate('/Student/Payments');
    }, 1500);
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card>
            <Card.Body>
              <h3 className="mb-4">Card Payment</h3>
              {showAlert && <Alert variant={alertType}>{alertMessage}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Card Type</Form.Label>
                  <Form.Select value={cardType} onChange={e => setCardType(e.target.value)} required>
                    <option value="Visa">Visa</option>
                    <option value="MasterCard">MasterCard</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Name on Card</Form.Label>
                  <Form.Control type="text" value={name} onChange={e => setName(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Card Number</Form.Label>
                  <Form.Control type="text" maxLength={16} minLength={16} pattern="[0-9]{16}" value={cardNumber} onChange={e => setCardNumber(e.target.value)} required placeholder="Enter 16-digit card number" />
                </Form.Group>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Expiry Date</Form.Label>
                      <Form.Control type="text" placeholder="MM/YY" value={expiry} onChange={e => setExpiry(e.target.value)} required pattern="(0[1-9]|1[0-2])\/([0-9]{2})" />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>CVV</Form.Label>
                      <Form.Control type="password" maxLength={4} minLength={3} pattern="[0-9]{3,4}" value={cvv} onChange={e => setCvv(e.target.value)} required />
                    </Form.Group>
                  </Col>
                </Row>
                <Button variant="primary" type="submit" className="w-100">Pay Now</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default StudentCardPayment;
