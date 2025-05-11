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
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="neumorphic max-w-md w-full">
        <h2 className="text-2xl font-bold text-primary mb-6 text-center">
          Forgot Password
        </h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="neumorphic-input"
        />
        <button
          onClick={handleForgotPassword}
          className="neumorphic-button w-full bg-secondary text-primary"
        >
          Reset Password
        </button>
        {message && (
          <p className="mt-4 text-center text-sm text-darkGray">{message}</p>
        )}
        <p className="mt-4 text-center text-sm text-darkGray">
          Back to{" "}
          <a href="/login" className="text-secondary hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;