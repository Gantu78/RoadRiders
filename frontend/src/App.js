import React, { useState } from 'react';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

const API_URL = 'https://supreme-invention-7wjwq4grpqp2p9x9-5000.app.github.dev/'; // Cambia esto si el backend tiene una URL pública


const handleRegister = async () => {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    const result = await response.json();
    console.log('Response:', result); // Agrega esto para depuración
    alert(result.message);
  } catch (error) {
    console.error('Fetch error:', error);
    alert('Failed to register: ' + error.message);
  }
};
  const handleLogin = async () => {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const result = await response.json();
    alert(result.message);
  };

  const handleForgotPassword = async () => {
    const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const result = await response.json();
    alert(result.message);
  };

  const handleTrack = () => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      setLatitude(latitude);
      setLongitude(longitude);
      const response = await fetch('http://localhost:5000/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 1, latitude, longitude })
      });
      const result = await response.json();
      alert(result.message);
    });
  };

  return (
    <div>
      <h1>Road-Riders</h1>
      <h2>Register</h2>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <button onClick={handleRegister}>Register</button>
      <h2>Login</h2>
      <button onClick={handleLogin}>Login</button>
      <h2>Forgot Password</h2>
      <button onClick={handleForgotPassword}>Forgot Password</button>
      <h2>Track</h2>
      <button onClick={handleTrack}>Start Tracking</button>
      {latitude && longitude && (
        <p>Latitude: {latitude}, Longitude: {longitude}</p>
      )}
    </div>
  );
}

export default App;