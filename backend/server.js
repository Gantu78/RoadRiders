/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

const cors = require('cors');
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const app = express();


app.use(cors({
  origin: ['http://localhost:3000', 'https://supreme-invention-7wjwq4grpqp2p9x9-3000.app.github.dev/'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

const supabaseUrl = 'https://ndxwvurtivgcwrieguqo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5keHd2dXJ0aXZnY3dyaWVndXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NzI3MzQsImV4cCI6MjA2MjU0ODczNH0.lpbIZSVVdWEyLx1wWfoxIVL45b6PwHyM_iU1wpFfkKI';
const supabase = createClient(supabaseUrl, supabaseKey);

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

app.post('/api/auth/forgot-password', (req, res) => {
  res.json({ message: 'Password reset link sent (simulated)' });
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

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));