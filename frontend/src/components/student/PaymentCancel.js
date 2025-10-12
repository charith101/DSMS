import React from 'react';
import { useNavigate } from 'react-router-dom';

function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Payment was cancelled.</h1>
      <p>If you were charged, please contact support. Otherwise you can try again.</p>
      <div style={{ marginTop: '20px' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/Student/Payments')}>Back to Payments</button>
      </div>
    </div>
  );
}

export default PaymentCancel;
