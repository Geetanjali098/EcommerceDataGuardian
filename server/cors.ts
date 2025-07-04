// In your Express server setup
import express from 'express';
import cors from 'cors';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5000/', // Adjust this to your frontend URL
    credentials: true, // Required for cookies/session
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);

// Your routes go here
app.get('/api/auth/me', (req, res) => {
  // Handle the request
  res.json({ message: 'Authenticated user data' });
});