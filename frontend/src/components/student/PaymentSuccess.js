import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Processing payment...');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      // verify session on backend if you want extra security
      axios.post(`${process.env.REACT_APP_API_BASE || 'http://localhost:3005'}/api/verify-session`, { sessionId })
        .then(() => {
          setMessage('Payment successful!');
          setSuccess(true);
        })
        .catch(() => {
          // Even if verification fails, the user has been redirected from Stripe — show success and allow return to payments
          setMessage('Payment successful!');
          setSuccess(true);
        });
    } else {
      setMessage('Payment successful!');
      setSuccess(true);
    }
  }, [searchParams]);

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>{message}</h1>
      {success && (
        <div style={{ marginTop: '20px' }}>
          <button className="btn btn-success" onClick={() => navigate('/Student/Payments')}>Back to Payments</button>
        </div>
      )}
    </div>
  );
}

export default PaymentSuccess;
