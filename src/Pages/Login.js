import React, { useState } from "react";
import axios from "axios";
import { api } from "../config";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { useUser } from "../context/UserContext";
const Login = () => {
  // State to handle email and password inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { storeUser } = useUser();
  // Replace 'api' with the actual API endpoint variable

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent form from refreshing the page

    try {
      const response = await axios.post(`${api}login`, { email, password });

      if (response.status === 200) {
        alert("Login successful!");
        // localStorage.setItem("user", JSON.stringify(response.data));
        navigate("/projects");
        storeUser(JSON.stringify(response.data));
      }
    } catch (error) {
      console.log(error);
      setErrorMessage("Wrong Credentials. Please try again.");
    }
  };

  return (
    <div className="login-big-div">
      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit} id="loginForm">
          <input
            type="text"
            name="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Update email state
          />
          <br />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Update password state
          />
          <br />
          <input type="submit" value="Login" />
        </form>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
      </div>
    </div>
  );
};

export default Login;
