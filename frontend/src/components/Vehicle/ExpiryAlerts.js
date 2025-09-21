import React, { useEffect, useState } from 'react';

function ExpiryAlerts({ documents }) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    const newAlerts = documents
      .filter(doc => {
        const expiry = new Date(doc.expiryDate);
        expiry.setHours(0, 0, 0, 0);

        // Check for documents expiring within the next 30 days or already expired
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);
        thirtyDaysFromNow.setHours(0, 0, 0, 0);

        return (expiry >= today && expiry <= thirtyDaysFromNow) || (expiry < today);
      })
      .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)) // Sort by expiry date
      .map(doc => {
        const expiry = new Date(doc.expiryDate);
        expiry.setHours(0, 0, 0, 0);

        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let message = '';
        let type = '';

        if (diffDays === 0) {
          message = `${doc.name} expires today!`;
          type = 'critical';
        } else if (diffDays > 0) {
          message = `${doc.name} expires in ${diffDays} day(s).`;
          type = 'warning';
        } else {
          message = `${doc.name} expired ${Math.abs(diffDays)} day(s) ago!`;
          type = 'expired';
        }
        return { ...doc, message, type };
      });

    setAlerts(newAlerts);
  }, [documents]);

  if (alerts.length === 0) {
    return <div className="no-alerts">No upcoming expiry alerts.</div>;
  }

  return (
    <div className="expiry-alerts-container">
      <h3>Expiry Alerts</h3>
      {alerts.map((alert) => (
        <div key={alert.id} className={`alert-item alert-${alert.type}`}>
          <strong>{alert.message}</strong> - Expiry: {alert.expiryDate}
        </div>
      ))}
    </div>
  );
}

export default ExpiryAlerts;