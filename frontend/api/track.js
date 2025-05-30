const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id, latitude, longitude } = req.body;
if (action === 'finalize') {
    const { route_data, distance, duration } = req.body;
    const { data, error } = await supabase.from('completed_routes').insert({
      user_id,
      route_data,
      distance,
      duration,
    });
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ message: 'Route saved', data });
  }

  const { data, error } = await supabase.from('tracks').insert({
    user_id,
    location: `POINT(${longitude} ${latitude})`,
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({ message: 'Track point saved', data });
};