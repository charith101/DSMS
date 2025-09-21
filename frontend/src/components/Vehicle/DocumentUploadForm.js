import React, { useState } from 'react';

function DocumentUploadForm({ onAddDocument }) {
  const [documentName, setDocumentName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    const newDocument = {
      id: Date.now(),
      name: documentName || file.name,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      uploadDate: new Date().toISOString().slice(0, 10),
      expiryDate,
      // In a real app, you'd store a URL to the uploaded file
      // fileUrl: `/uploads/${file.name}`
    };
    onAddDocument(newDocument);
    setDocumentName('');
    setExpiryDate('');
    setFile(null);
    e.target.reset(); // Clear file input
  };

  return (
    <form onSubmit={handleSubmit} className="document-upload-form">
      <h3>Upload New Document</h3>
      <label>
        Document Type/Name:
        <input
          type="text"
          value={documentName}
          onChange={(e) => setDocumentName(e.target.value)}
          placeholder="e.g., Insurance Policy, Registration"
          required
        />
      </label>
      <label>
        Expiry Date:
        <input
          type="date"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
          required
        />
      </label>
      <label>
        Select File:
        <input type="file" onChange={handleFileChange} required />
      </label>
      <button type="submit" disabled={!file}>Upload Document</button>
    </form>
  );
}

export default DocumentUploadForm;