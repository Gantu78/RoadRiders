// frontend/api/register.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    const { data, error } = await supabase.from('users').insert({ email, password });
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json({ message: 'User registered', data });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};