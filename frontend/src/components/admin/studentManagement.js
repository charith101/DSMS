import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Plus } from 'lucide-react';

const StudentManagement = () => { // Renamed to uppercase to indicate a React component
  const [students, setStudents] = useState([]); // Now valid within a component
  const [newStudent, setNewStudent] = useState({ name: '', email: '', age: '', nic: '', password: '', licenseType: [], role: 'student' });

  useEffect(() => {
    axios.get("http://localhost:3001/student")
      .then((result) => setStudents(result.data))
      .catch((err) => console.log(err));
  }, []);

  const handleAddStudent = () => {
    axios.post("http://localhost:3001/student/registerUser", newStudent)
      .then((result) => {
        setStudents([...students, result.data]);
        setNewStudent({ name: '', email: '', age: '', nic: '', password: '', licenseType: [], role: 'student' });
      })
      .catch((err) => console.log(err));
  };

  const handleDeleteStudent = (id) => {
    axios.delete(`http://localhost:3001/student/deleteUser/${id}`)
      .then(() => setStudents(students.filter(s => s._id !== id)))
      .catch((err) => console.log(err));
  };

  return React.createElement(
    'div',
    { className: 'p-4' },
    React.createElement('h2', { className: 'fw-bold mb-4' }, 'Manage Students'),
    React.createElement(
      'div',
      { className: 'card mb-4' },
      React.createElement(
        'div',
        { className: 'card-body' },
        React.createElement('h5', null, 'Add New Student'),
        React.createElement('input', { className: 'form-control mb-2', placeholder: 'Name', value: newStudent.name, onChange: (e) => setNewStudent({...newStudent, name: e.target.value}) }),
        React.createElement(
          'button',
          { className: 'btn btn-primary', onClick: handleAddStudent },
          React.createElement(Plus, null),
          ' Add'
        )
      )
    ),
    React.createElement(
      'table',
      { className: 'table table-striped' },
      React.createElement(
        'thead',
        null,
        React.createElement(
          'tr',
          null,
          React.createElement('th', null, 'Name'),
          React.createElement('th', null, 'Email'),
          React.createElement('th', null, 'Actions')
        )
      ),
      React.createElement(
        'tbody',
        null,
        students.map(student => React.createElement(
          'tr',
          { key: student._id },
          React.createElement('td', null, student.name),
          React.createElement('td', null, student.email),
          React.createElement(
            'td',
            null,
            React.createElement(
              'button',
              { className: 'btn btn-sm btn-danger', onClick: () => handleDeleteStudent(student._id) },
              React.createElement(Trash2, null)
            )
          )
        ))
      )
    )
  );
};

export default StudentManagement; // Export matches the uppercase name