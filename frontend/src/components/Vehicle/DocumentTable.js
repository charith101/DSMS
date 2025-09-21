import React from 'react';

function DocumentTable({ documents }) {
  return (
    <div className="document-table-container">
      <h3>Managed Documents</h3>
      <table>
        <thead>
          <tr>
            <th>Document Name</th>
            <th>File Name</th>
            <th>Upload Date</th>
            <th>Expiry Date</th>
            <th>Status</th>
            {/* <th>Actions</th> // For download/delete in a real app */}
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => {
            const isExpired = new Date(doc.expiryDate) < new Date();
            const statusClass = isExpired ? 'status-expired' : '';
            return (
              <tr key={doc.id} className={statusClass}>
                <td>{doc.name}</td>
                <td>{doc.fileName}</td>
                <td>{doc.uploadDate}</td>
                <td>{doc.expiryDate}</td>
                <td>{isExpired ? 'Expired' : 'Active'}</td>
                {/* <td><button>Download</button></td> */}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default DocumentTable;