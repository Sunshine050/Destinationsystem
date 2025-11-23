const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = 3002;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Allow Frontend
  credentials: true
}));
app.use(express.json());

// Supabase Client (Service Role for Admin tasks, or Anon for public)
// Note: For exchanging auth code, we just need the URL and Anon Key usually, 
// but strictly speaking we call the token endpoint.
// Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Route: Exchange Code for Session
app.post('/api/auth/google', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Missing code' });
  }

  try {
    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Supabase Auth Error:', error);
      return res.status(400).json({ error: error.message });
    }

    const { session, user } = data;

    // In a real app, you would set an HTTP-only cookie here
    // res.cookie('access_token', session.access_token, { httpOnly: true, ... });

    // For this temporary setup, we return the data to frontend
    return res.json({
      message: 'Login successful',
      user: user,
      session: session
    });

  } catch (err) {
    console.error('Server Error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Temp Auth Server running on http://localhost:${PORT}`);
});
