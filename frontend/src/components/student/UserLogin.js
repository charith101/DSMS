import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function UserLogin() {

  const[email, setEmail] = useState()
  const[password, setPassword] = useState()
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrorMsg("")
    axios.post("http://localhost:3001/login",{email,password})
    .then(result => {
      if(result.data === "Success"){
        localStorage.setItem("isAuthenticated", "true");
        navigate('/home')
      }
      else if(email == null){
        setErrorMsg("Enter an email and password");
      }
      else {
        setErrorMsg(result.data);
      }
    })
    .catch(err => console.log(err))
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
    <div className="container" style={{ maxWidth: "400px" }}>
      <div className="card p-4 shadow-sm">
        <h4 className="mb-3 text-center">Login</h4>
        <form onSubmit={handleSubmit}>
        <input className="form-control mb-2" placeholder="Email" onChange={(e) => setEmail(e.target.value)}/>
        <input className="form-control mb-2" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)}/>
        <button className="btn btn-primary w-100">Login</button>
        </form>
        <div className="text-center mt-3">
          <small>
            Don't have an account?{' '}
            <Link to="/register" className="btn btn-link p-0" >
              Register
            </Link>
          </small>
        </div>
        <div className="text-center mt-3">
        {errorMsg && (<div className="alert alert-danger mt-3 text-center p-2">{errorMsg}</div>)}
        </div>
      </div>
    </div>
    </div>
  );
}

export default UserLogin;
