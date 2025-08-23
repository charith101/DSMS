import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ErrorHandle from "../errorHandle";

function Updateuser() {
  const { id } = useParams();
  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [age, setAge] = useState();
  const [nic, setNic] = useState();
  const [password, setPassword] = useState();
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    if (isAuth !== "true") {
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    axios.get("http://localhost:3001/student/getUser/" + id)
      .then((result) => {
        setName(result.data.name);
        setEmail(result.data.email);
        setAge(result.data.age);
        setNic(result.data.nic);
        setPassword(result.data.password);
      })
      .catch((err) => console.log(err));
  }, []);

  const Update = (e) => {
    e.preventDefault();
    axios.put("http://localhost:3001/student/updateUser/" + id, { name, email, age, nic, password })
      .then((result) => {
        navigate("/student-dashboard");
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          setErrorMsg(err.response.data.error);
        } else {
          console.error(err);
          alert("Something went wrong");
        }
      });
  };

  return (
    <div className="container mt-4">
      <h2>Update User</h2>
      <form className="row g-2" onSubmit={Update}>
        <input type="text" className="form-control" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <ErrorHandle for="name" error={errorMsg}/>
        <input type="email" className="form-control" placeholder="Email"  value={email} onChange={(e) => setEmail(e.target.value)} />
        <ErrorHandle for="email" error={errorMsg}/>
        <input type="text" className="form-control" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} />
        <ErrorHandle for="age" error={errorMsg}/>
        <input type="text" className="form-control" placeholder="NIC" value={nic} onChange={(e) => setNic(e.target.value)} />
        <ErrorHandle for="nic" error={errorMsg}/>
        <input type="text" className="form-control" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <ErrorHandle for="password" error={errorMsg}/>
        <button className="btn btn-dark mt-2">Update</button>
      </form>
    </div>
  );
}

export default Updateuser;
