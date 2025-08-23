import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function StudentDashboard() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate()

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    if (isAuth !== "true") {
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    axios.get("http://localhost:3001/student")
      .then((result) => setUsers(result.data))
      .catch((err) => console.log(err));
  }, []);
  
  const handleDelete = (id) => {
    axios.delete("http://localhost:3001/student/deleteUser/" + id)
      .then((result) => window.location.reload())
      .catch((err) => console.log(err));
  }
  
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
  }; 

  return (
    <div class="container mt-4">
      <Link to="/create" className="btn btn-dark m-2">
        Add User
      </Link>
      <button className="btn btn-dark m-2" onClick={() => {handleLogout(); navigate("/login");}}>Logout</button>
      <table class="table table-bordered table-hover">
        <thead class="table-dark">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Age</th>
            <th>Password</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            return (
              <tr>
                <td>{user._id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.age}</td>
                <td>{user.password}</td>
                <tr>
                  <td>
                    <Link to={`/update/${user._id}`} className="btn btn-sm btn-dark me-2">
                      Edit
                    </Link>
                    <button className="btn btn-sm btn-dark" onClick={(e) => handleDelete(user._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default StudentDashboard;
