import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage("Please enter a valid email");
      return;
    }
    if (!password) {
      setMessage("Please enter a password");
      return;
    }
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
      const result = await response.json();
      setMessage(result.message && result.data && result.data.length > 0);
      if (result.message === "Login successful") {
        login(result.data[0]); // Pass the user data to the context
        navigate("/tracking");
      }
    } catch (error) {
      setMessage("Failed to login: " + error.message);
    }
  };

  return (
    <div className="full-screen">
      <div className="card animate-fade-in">
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
        {message && <p>{message}</p>}
        <p>
          Forgot your password?{" "}
          <a href="/forgot-password">Reset it</a>
        </p>
        <p>
          Don’t have an account?{" "}
          <a href="/register">Register</a>
        </p>
      </div>
    </div>
  );
};

export default Login;