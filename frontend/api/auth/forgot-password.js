const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const resend = new Resend(process.env.RESEND_API_KEY);

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

    const { error: emailError } = await resend.emails.send({
      from: 'RoadRiders <danielguizapro@gmail.com>',
      to: email,
      subject: 'Password Reset',
      html: `
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
              <a href="https://yourapp.com/reset-password?email=${email}&token=UNIQUE_TOKEN" class="button">Reset Password</a>
              <p>If you did not request this, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>© 2025 Road Riders Inc. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (emailError) throw new Error(emailError.message);

    return res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};