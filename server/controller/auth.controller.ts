// File: EcommerceDataGuardian/server/controller/auth.controller.ts
import { Request, Response } from 'express';
import crypto from 'crypto';
import { storage } from '../storage';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { insertUserSchema } from '@shared/schema';
import admin from "firebase-admin";
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
 // Import Firebase admin SDK


// Login function
export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    console.log(`Login attempt for username: ${username}`);

    // Try to get user by username first
    let user = await storage.getUserByUsername(username);

    // If not found by username, try by email
    if (!user) {
      const users = await storage.getAllUsers();
      user = users.find(u => u?.email === username);
    }

    if (!user) {
      console.log(`User not found: ${username}`);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log(`User found: ${user.username}, checking password`);

    if (user.password !== password) {
      console.log("Password mismatch");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    const refreshToken = crypto.randomBytes(40).toString('hex');
    await storage.saveRefreshToken(user.id, refreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log(`Login successful for user: ${user.username}`);

    return res.json({
      token: accessToken,
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Signup function
export const signup = async (req: Request, res: Response) => {
  try {
    const validatedUser = insertUserSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await storage.getUserByUsername(validatedUser.username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const user = await storage.createUser(validatedUser);

    const accessToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    const refreshToken = crypto.randomBytes(40).toString('hex');
    await storage.saveRefreshToken(user.id, refreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      token: accessToken,
      message: "Account created successfully",
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid user data",
        errors: error.errors,
      });
    }
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  const snapshot = await admin.firestore().collection('users').get();
  const users = snapshot.docs.map((doc: QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() }));
  res.json(users);
};