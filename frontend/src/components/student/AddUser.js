import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AddUser() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [error, setError] = useState();
  const navigate = useNavigate();

  const validate = () => {
    if (!name.trim() || name.length < 2)
      return "Name is required (min 2 chars)";
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email))
      return "Valid email required";
    if (!age || isNaN(age) || age <= 0 || age > 150)
      return "Valid age required";
    return "";
  };

  const Submit = (e) => {
    e.preventDefault();
    const errMsg = validate();
    if (errMsg) {
      setError(errMsg);
      return;
    }
    axios.post("http://localhost:3001/student/createUser", { name, email, age })
      .then((result) => {
        navigate("/home");
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="container mt-4">
      <h2>Create User</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form className="row g-2" onSubmit={Submit}>
        <input type="text" className="form-control" placeholder="Name" onChange={(e) => setName(e.target.value)} />
        <input type="email" className="form-control" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input type="number" className="form-control" placeholder="Age" onChange={(e) => setAge(e.target.value)} />
        <button className="btn btn-dark mt-2">Add User</button>
      </form>
    </div>
  );
}

export default AddUser;
