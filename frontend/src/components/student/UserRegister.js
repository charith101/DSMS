import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import  ErrorHandle  from "../errorHandle";
import { UserPlus2, Car } from "lucide-react";

function UserRegister() {
  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [age, setAge] = useState();
  const [nic, setNic] = useState();
  const [licenseType, setLicenseType] = useState([]);
  const [password, setPassword] = useState();
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    axios.post("http://localhost:3001/student/registerUser", { name, email, age, nic,  password, role: "student", level: 1 })
      .then((result) => {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userId", result.data.id);
        setLoading(false);
        navigate("/student-dashboard");
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          setErrorMsg(err.response.data.error);
          setLoading(false);
        } else {
          console.error(err);
          setLoading(false);
          alert("Something went wrong");
        }
      });
  };

  return (
    <div className="d-flex flex-column bg-body-tertiary justify-content-center align-items-center min-vh-100" >
    <div className="mb-sm-4 mb-1 mt-3">
      <Link className="navbar-brand fw-bold fs-3 text-primary d-flex align-items-center" to="/"><Car className="me-2" size={64} />DrivePro</Link>
    </div>
    <div className="container my-4 px-sm-0 px-5" style={{ maxWidth: "500px" }}>
      <div className="card p-4 rounded-4 shadow-sm">
        <div className="text-center">
          <div className="bg-success bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3 text-center">
            <UserPlus2 size={50} className="text-success text-center"/>
          </div>
        </div> 
        <h4 className="mb-3 text-center">Register</h4>
        <form onSubmit={handleSubmit}>
          <input className="form-control mb-2" placeholder="Name" onChange={(e) => setName(e.target.value)} />
          <ErrorHandle for="name" error={errorMsg}/>
          <input className="form-control mb-2" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
          <ErrorHandle for="email" error={errorMsg}/>
          <input className="form-control mb-2" placeholder="Age" onChange={(e) => setAge(e.target.value)} />
          <ErrorHandle for="age" error={errorMsg}/>
          <input className="form-control mb-2" placeholder="NIC" onChange={(e) => setNic(e.target.value)} />
          <ErrorHandle for="nic" error={errorMsg}/>
          <div className="mb-2 border rounded-3 p-2">
            <h6>Select the license(s) type</h6>
            {['Car', 'Bike', 'Three-Wheel'].map(type => (
              <div key={type} className="form-check form-check-inline">
                <input className="form-check-input" type="checkbox" value={type}checked={licenseType.includes(type)}onChange={(e) => {
                    if (e.target.checked) {
                      setLicenseType([...licenseType, type]);
                    } else {
                      setLicenseType(licenseType.filter(t => t !== type));
                    }
                  }}/>
                <label className="form-check-label me-3">{type}</label>
              </div>
            ))}
          </div>
          <ErrorHandle for="licenseType" error={errorMsg}/>
          <input className="form-control mb-2" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
          <ErrorHandle for="password" error={errorMsg}/>
          <ErrorHandle for="caf" error={errorMsg}/>
          <button type="submit" className="btn btn-success w-100">{loading ? 'Loading...' : 'Register'}</button>
        </form>
        <div className="text-center mt-3">
          <small>Already have an account?{" "}
            <Link to="/login" className="btn btn-link text-success p-0"> Login </Link>
          </small>
        </div>
      </div>
    </div>
    </div>
  );
}

export default UserRegister;
