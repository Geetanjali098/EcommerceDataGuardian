// In your Express server setup
import express from 'express';
import cors from 'cors';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5000/', // Adjust this to your frontend URL
    credentials: true, // Required for cookies/session
    allowedHeaders: ['Authorization', 'Content-Type'],
  })
);