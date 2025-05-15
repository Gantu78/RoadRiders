import React, { useState } from "react";

const ResetPassword = () => {
  const params = new URLSearchParams(window.location.search);
  const email = params.get("email");
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async () => {
    if (!password || password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setMessage("Password reset successful. You can now log in.");
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  return (
    <div className="full-screen">
      <div className="card animate-fade-in">
        <h2>Reset Password</h2>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <button onClick={handleReset}>Reset Password</button>
        {message && <p>{message}</p>}
        <p>
          Back to <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;