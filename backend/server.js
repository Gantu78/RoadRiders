/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

const cors = require('cors');
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const app = express();
const jwt = require('jsonwebtoken'); // Asegúrate de instalarlo: npm install jsonwebtoken


app.use(cors({
  origin: ['http://localhost:3000', 'https://supreme-invention-7wjwq4grpqp2p9x9-3000.app.github.dev/'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

const supabaseUrl = 'https://ndxwvurtivgcwrieguqo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5keHd2dXJ0aXZnY3dyaWVndXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NzI3MzQsImV4cCI6MjA2MjU0ODczNH0.lpbIZSVVdWEyLx1wWfoxIVL45b6PwHyM_iU1wpFfkKI';
const supabase = createClient(supabaseUrl, supabaseKey);
const RESEND_API_KEY = 're_jRTS2MoR_MQknLTxZuKBWH1mewPPCnyd1';
const resend = new Resend(RESEND_API_KEY);
const JWT_SECRET = 'clave-secreta'; 

(async () => {
  const { data, error } = await supabase.from('users').select().limit(1);
  if (error) console.error('Supabase connection error:', error);
  else console.log('Supabase connection successful:', data);
})();

app.post('/api/auth/register', async (req, res) => {
  console.log('Request received:', req.body);
  const { email, password } = req.body;
  if (!email || !password) {
    console.log('Missing email or password');
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    const { data, error } = await supabase.from('users').insert({ email, password });
    if (error) {
      console.error('Supabase error:', error);
      return res.status(400).json({ error: error.message });
    }
    console.log('User registered:', data);
    res.json({ message: 'User registered', data });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.from('users').select().eq('email', email).eq('password', password);
  if (error || !data.length) return res.status(400).json({ error: 'Invalid credentials' });
  res.json({ message: 'Login successful', data });
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !user) {
      throw new Error('User not found');
    }

    const token = jwt.sign({ email, exp: Math.floor(Date.now() / 1000) + 3600 }, JWT_SECRET);
    const resetLink = `http://localhost:3000/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;

    const { error: emailError } = await resend.emails.send({
      from: 'RoadRiders <onboarding@resend.dev>',
      to: email,
      subject: 'Password Reset',
      html:  `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .header h1 {
          color: #333333;
        }
        .content {
          text-align: center;
          color: #555555;
        }
        .button {
          display: inline-block;
          margin-top: 20px;
          padding: 10px 20px;
          font-size: 16px;
          color: #ffffff;
          background-color: #007bff;
          text-decoration: none;
          border-radius: 5px;
        }
        .footer {
          margin-top: 20px;
          text-align: center;
          font-size: 12px;
          color: #aaaaaa;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>We received a request to reset your password. Click the button below to reset it:</p>
          <a href="${resetLink}" class="button">Reset Password</a>
          <p>If you did not request this, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Road Riders Inc. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
    });

    if (emailError) throw new Error(emailError.message);

    res.json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
  //res.json({ message: 'Password reset link sent (simulated)' });
});

app.post('/api/track', async (req, res) => {
  const { user_id, latitude, longitude } = req.body;
  const { data, error } = await supabase.from('tracks').insert({
    user_id,
    location: `POINT(${longitude} ${latitude})`
  });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Track point saved', data });
});
app.get('/', (req, res) => {
  res.send('Road-Riders Backend is running');
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { email, token, password } = req.body;

  if (!email || !token || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Verifica el token
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.email !== email) {
      return res.status(400).json({ message: 'Invalid token or email' });
    }

    // Valida la contraseña (mínimo 6 caracteres)
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Actualiza la contraseña
    const { error: updateError } = await supabase
      .from('users')
      .update({ password })
      .eq('email', email);

    if (updateError) throw new Error(updateError.message);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      res.status(400).json({ message: 'Token has expired' });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));