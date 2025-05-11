import React, { useState } from "react";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage("Please enter a valid email");
      return;
    }
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters long");
      return;
    }
    try {
      const response = await fetch("/api/auth/register", {
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
    } catch (error) {
      setMessage("Failed to register: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="neumorphic max-w-md w-full">
        <h2 className="text-2xl font-bold text-primary mb-6 text-center">Register</h2>
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
          onClick={handleRegister}
          className="neumorphic-button w-full bg-secondary text-primary"
        >
          Register
        </button>
        {message && (
          <p className="mt-4 text-center text-sm text-darkGray">{message}</p>
        )}
        <p className="mt-4 text-center text-sm text-darkGray">
          Already have an account?{" "}
          <a href="/login" className="text-secondary hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;