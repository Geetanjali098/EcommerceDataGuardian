import admin from 'firebase-admin'; // Import admin directly
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/user'; // Import User model from the correct path
 // Adjust the import path as necessary
import jwt from 'jsonwebtoken';


dotenv.config();

//signup handler
// This function handles user registration, including email and username checks, password hashing, and JWT token

export const signup = async (req: Request, res: Response) => {
  try {
    const body = req.body as any;
    const { name, email, username, password, role } = req.body;

    // Check if email or username already exists
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(400).json({ message: 'User already exists with this email or username' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed password:", hashedPassword);

    // Validate required fields
    if (!name || !email || !username || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    // Save user
    const user = new User({
      name,
      email,
      username,
      password: hashedPassword,
      role,
    });
    await user.save();


    // Create JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, {
      expiresIn: '7d',
    });

    // Return response
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error: any) {
    res.status(500).json({ message: 'Signup failed', error: error.message });
  }
};



// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Middleware to verify Firebase ID token
const verifyToken = async (req: Request, res: Response, next: Function) => {
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Attach user info to request
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};
//  login handler
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
     console.log("Received login:", { username, password });
//find user by email or username
    const user = await User.findOne({
      $or: [{ email:username }, { username: username }],
    });

    console.log("User found in DB:", user);

    if (!user || !user.password) {
      console.log("User not found or missing password!");
  return res.status(401).json({ message: 'User password is missing in database' });
}
console.log("Login Attempt:", { username, password });
console.log("Request body:", req.body);
console.log("User found:", user);
console.log("Password stored:", user?.password);
console.log("Password entered:", password); 

const isMatch = await bcrypt.compare(password, user.password);
 console.log("Password match result:", isMatch);
    // Check if password matches
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
// Create JWT token
    console.log("Creating JWT token for user:", user._id);
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, {
      expiresIn: '7d',
    });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};


// Updated getUsers function with token verification
export const getUsers = async (req: Request, res: Response) => {
  const snapshot = await admin.firestore().collection('users').get();
  const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(users);
};



