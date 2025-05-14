import React, { useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleForgotPassword = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage("Please enter a valid email");
      return;
    }
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
      const result = await response.json();
      setMessage(result.message);
    } catch (error) {
      setMessage("Failed to reset password: " + error.message);
    }
  };

  return (
    <div className="full-screen">
      <div className="card animate-fade-in">
        <h2>Forgot Password</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={handleForgotPassword}>Send Reset Link</button>
        {message && <p>{message}</p>}
        <p>
          Back to <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;