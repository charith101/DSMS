import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import  ErrorHandle  from "./errorHandle";
import { User2, Car } from "lucide-react";

function UserLogin() {
  const[email, setEmail] = useState()
  const[password, setPassword] = useState()
  const [errorMsg, setErrorMsg] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg("")
    if (!email || !password) {
      setErrorMsg("nep:Complete all fields");
      setLoading(false);
      return;
    }
    axios.post("http://localhost:3001/auth/login",{email,password})
    .then(result => {
      if(result.data.status === "Success"){
        localStorage.setItem("isAuthenticated", "true");
        switch (result.data.role) {
          case 'student':
            navigate('/student-dashboard');
            break;
          case 'instructor':
            navigate('/instructor-dashboard');
            break;
          case 'receptionist':
            navigate('/receptionist-dashboard');
            break;
          case 'admin':
            navigate('/admin-dashboard');
            break;
          default:
            navigate('/');
        }
      }
      else {
        setErrorMsg(result.data.error);
      }
      setLoading(false);
    })
    .catch(err => {
      setErrorMsg(err.response.data)
      setLoading(false)
    });     
  }

  return (
    <div className="d-flex flex-column bg-body-tertiary justify-content-center align-items-center min-vh-100">
    <div className="mb-sm-4 mb-1 mt-3">
      <Link className="navbar-brand fw-bold fs-3 text-primary d-flex align-items-center" to="/"><Car className="me-2" size={64} />DrivePro</Link>
    </div>
    <div className="container my-4 px-sm-0 px-5" style={{ maxWidth: "400px" }}>
      <div className="card p-4 rounded-4 shadow">
        <div className="text-center">
          <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3 text-center">
            <User2 size={50} className="text-primary text-center"/>
          </div>
        </div>                
        <h4 className="mb-3 text-center">Login</h4>
        <form onSubmit={handleSubmit}>
        <input className="form-control mb-2" placeholder="Email" onChange={(e) => setEmail(e.target.value)}/>
        <ErrorHandle for="ne" error={errorMsg}/>
        <input className="form-control mb-2" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)}/>
        <ErrorHandle for="pi" error={errorMsg}/>
        <ErrorHandle for="nep" error={errorMsg}/>
        <button className="btn btn-primary w-100">{loading ? 'Loading...' : 'Login'}</button> 
        </form>
        <div className="text-center mt-3">
          <small>
            Don't have an account?{' '}
            <Link to="/register" className="btn btn-link p-0" >Register</Link>
          </small>
        </div>
        <div className="text-center mt-3">
        </div>
      </div>
    </div>
    </div>
  );
}

export default UserLogin;
