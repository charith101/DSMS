import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaCar } from 'react-icons/fa';
import './financialManagerNav.css';

const FinancialManagerNav = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/financial-manager-login');
  };

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm py-2">
      <Container fluid>
        <Navbar.Brand as={Link} to="/financial-manager" className="d-flex align-items-center">
          <FaCar className="text-primary me-2" size={24} />
          <span className="fw-bold text-primary">DrivePro Finance</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="financial-manager-navbar" />
        <Navbar.Collapse id="financial-manager-navbar">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/financial-manager" className="px-3">
              Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/financial-manager/payments" className="px-3">
              Payments
            </Nav.Link>
            <Nav.Link as={Link} to="/financial-manager/salary" className="px-3">
              Salary 
            </Nav.Link>
            <Nav.Link as={Link} to="/financial-manager/reports" className="px-3">
              Reports
            </Nav.Link>
            <Button 
              variant="dark" 
              onClick={handleLogout} 
              className="ms-3 d-flex align-items-center"
            >
              Logout <FaSignOutAlt className="ms-2" />
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default FinancialManagerNav;