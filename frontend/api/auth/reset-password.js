const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const JWT_SECRET = 'clave-secreta'; // Debe ser el mismo que en forgot-password.js

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

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

    // Verifica si el usuario existe
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !user) throw new Error('User not found');

    // Actualiza la contraseña
    const { error: updateError } = await supabase
      .from('users')
      .update({ password })
      .eq('email', email);

    if (updateError) throw new Error(updateError.message);

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Token has expired' });
    }
    return res.status(400).json({ message: error.message });
  }
};