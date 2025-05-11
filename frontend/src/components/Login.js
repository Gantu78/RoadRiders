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
      setMessage(result.message);
      if (result.message === "Login successful") {
        login(); // Actualiza el estado de autenticación
        navigate("/tracking");
      }
    } catch (error) {
      setMessage("Failed to login: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="neumorphic max-w-md w-full">
        <h2 className="text-2xl font-bold text-primary mb-6 text-center">Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="neumorphic-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="neumorphic-input"
        />
        <button
          onClick={handleLogin}
          className="neumorphic-button w-full bg-secondary text-primary"
        >
          Login
        </button>
        {message && (
          <p className="mt-4 text-center text-sm text-darkGray">{message}</p>
        )}
        <p className="mt-4 text-center text-sm text-darkGray">
          Forgot your password?{" "}
          <a href="/forgot-password" className="text-secondary hover:underline">
            Reset it
          </a>
        </p>
        <p className="mt-2 text-center text-sm text-darkGray">
          Don’t have an account?{" "}
          <a href="/register" className="text-secondary hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;