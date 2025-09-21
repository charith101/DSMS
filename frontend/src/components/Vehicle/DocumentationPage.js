import React, { useState, useEffect } from 'react';
import DocumentUploadForm from '../components/DocumentUploadForm';
import DocumentTable from '../components/DocumentTable';
import ExpiryAlerts from '../components/ExpiryAlerts';

function DocumentationPage() {
  const [documents, setDocuments] = useState([]);

  // Load from local storage on mount
  useEffect(() => {
    const storedDocs = JSON.parse(localStorage.getItem('vehicleDocuments'));
    if (storedDocs) {
      setDocuments(storedDocs);
    }
  }, []);

  // Save to local storage whenever documents change
  useEffect(() => {
    localStorage.setItem('vehicleDocuments', JSON.stringify(documents));
  }, [documents]);

  const addDocument = (newDoc) => {
    setDocuments((prevDocs) => [...prevDocs, newDoc]);
  };

  return (
    <div className="documentation-page">
      <h2>Vehicle Documentation</h2>
      <ExpiryAlerts documents={documents} />
      <DocumentUploadForm onAddDocument={addDocument} />
      <DocumentTable documents={documents} />
    </div>
  );
}

export default DocumentationPage;