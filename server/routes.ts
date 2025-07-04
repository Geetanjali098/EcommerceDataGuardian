import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAuthenticated, isAdmin, isAnalyst, AuthenticatedRequest } from "./middleware/auth";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import type { User } from "@shared/schema";
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import admin from "firebase-admin";
import { useAuth } from '@/hooks/use-auth';
import { login, signup } from "../server/controller/auth.controller";



const router = express.Router();

router.post('/sign-up', signup);

router.post('/login',   login);

export async function registerRoutes(app: Express): Promise<Server> {
    // Validate JWT_SECRET is available
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET environment variable is not set!");
    throw new Error("JWT_SECRET environment variable is required");
  }
  try {
    await storage.initializeWithSeedData();
  } catch (error) {
    console.error("Failed to initialize storage:", error);
    throw new Error("Storage initialization failed");
  }

 
  
  // 🔐 JWT Login Route
  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    try {
      const user = await storage.getUserByUsername(username);

      if (!user || user.password !== password) {
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
  });

 // 🔐 Google Sign-In Route
  app.post("/api/auth/google", async (req, res) => {
    const { token, role } = req.body;

    if (!token || !role) {
      return res.status(400).json({ message: "Token and role are required" });
    }

    try {
      const decoded = await admin.auth().verifyIdToken(token);
      console.log("Decoded Firebase token:", decoded);
    
            // Generate a numeric ID from the Firebase UID string
      const numericId = Math.abs(decoded.uid.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0));

        console.log("Generated user ID:", numericId);
      console.log("Firebase UID:", decoded.uid);

      // Check if user already exists
      let existingUser = await storage.getUser(numericId);
      
      if (!existingUser) {
        // Create new user
        const newUser = {
          id: numericId,
          username: decoded.email || `user_${numericId}`,
          name: decoded.name || "Google User",
          email: decoded.email || "",
          role: role,
          avatarUrl: decoded.picture || "",
          password: "google-oauth",
        };

             existingUser = await storage.createUser(newUser);
      } else {
        // Update existing user's role if different
        if (existingUser.role !== role) {
          existingUser.role = role;
         await storage.createUser(existingUser);
        }
      }

      const jwtToken = jwt.sign(
        { id: existingUser.id, username: existingUser.username, role: existingUser.role },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
      );

      return res.json({
        token: jwtToken,
        user: {
          id: existingUser.id,
          username: existingUser.username,
          role: existingUser.role,
          name: existingUser.name,
          email: existingUser.email,
          avatarUrl: existingUser.avatarUrl,
        },
      });
    } catch (error) {
      console.error("Google Sign-In error:", error);
      return res.status(401).json({ 
               message: error instanceof Error ? error.message: "Invalid Google token" });
    }
  });

  // 🔐 JWT Logout Route
  app.post("/api/auth/logout", (req, res) => {
    return res.json({ message: "Logged out successfully (client-side)" });
  });

  // 🔐 Authenticated User Info
  app.get("/api/auth/me", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      console.log("Looking for user with ID:", req.user.id);
      const user = await storage.getUser(req.user.id);
      console.log("User found:", !!user);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      });
    } catch (error) {
      console.error("Get current user error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // 👥 Admin: View Users
  app.get("/api/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();

      const filteredUsers = users
        .filter((user): user is User => user !== undefined)
        .map((user) => ({
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
        }));

      return res.json(filteredUsers);
    } catch (error) {
      console.error("Get users error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // 👥 Admin: Create User
  app.post("/api/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validatedUser = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedUser);

      return res.status(201).json({
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid user data",
          errors: error.errors,
        });
      }
      console.error("Create user error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // 📊 Dashboard API Route
     app.get("/api/dashboard/quality-scores", isAuthenticated, (req, res) => {
    res.json({
      overall: 87,
      completeness: 92,
      accuracy: 89,
      freshness: 78,
      consistency: 91
    });
  });

  app.get("/api/dashboard/data-issues", isAuthenticated, (req, res) => {
    res.json([
      {
        id: 1,
        type: "Missing Data",
        severity: "high",
        description: "Product descriptions missing for 15% of items",
        affected_records: 245,
        detected_at: new Date().toISOString()
      },
      {
        id: 2,
        type: "Format Issue",
        severity: "medium",
        description: "Phone numbers in inconsistent formats",
        affected_records: 89,
        detected_at: new Date().toISOString()
      },
      {
        id: 3,
        type: "Duplicate Records",
        severity: "low",
        description: "Duplicate customer entries detected",
        affected_records: 12,
        detected_at: new Date().toISOString()
      }
    ]);
  });

  app.get("/api/dashboard/quality-trends", isAuthenticated, (req, res) => {
    const dates = [];
    const scores = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
      scores.push(Math.floor(Math.random() * 20) + 80); // Random scores between 80-100
    }

    res.json({
      dates,
      overall: scores,
      completeness: scores.map(s => s + Math.floor(Math.random() * 10) - 5),
      accuracy: scores.map(s => s + Math.floor(Math.random() * 10) - 5),
      freshness: scores.map(s => s + Math.floor(Math.random() * 10) - 5)
    });
  });

  app.get("/api/dashboard/recent-anomalies", isAuthenticated, (req, res) => {
    res.json([
      {
        id: 1,
        type: "data_spike",
        severity: "high",
        description: "Unusual spike in order volume detected",
        value: 2500,
        threshold: 1000,
        detected_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: "active"
      },
      {
        id: 2,
        type: "missing_data",
        severity: "medium",
        description: "Product image URLs missing for new items",
        value: 45,
        threshold: 10,
        detected_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        status: "investigating"
      },
      {
        id: 3,
        type: "data_drift",
        severity: "low",
        description: "Customer age distribution shifted",
        value: 0.15,
        threshold: 0.1,
        detected_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        status: "resolved"
      }
    ]);
  });

  app.get("/api/dashboard/pipeline-status", isAuthenticated, (req, res) => {
    res.json([
      {
        id: 1,
        name: "Orders ETL",
        status: "running",
        last_run: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        records_processed: 1247,
        health: "good"
      },
      {
        id: 2,
        name: "Customer Data Sync",
        status: "completed",
        last_run: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        records_processed: 892,
        health: "good"
      },
      {
        id: 3,
        name: "Product Catalog Update",
        status: "failed",
        last_run: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        records_processed: 0,
        health: "poor"
      },
      {
        id: 4,
        name: "Review Processing",
        status: "running",
        last_run: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        records_processed: 456,
        health: "good"
      }
    ]);
  });

  app.get("/api/dashboard/data-quality-by-source", isAuthenticated, (req, res) => {
    res.json([
      {
        id: 1,
        name: "Main Database",
        type: "PostgreSQL",
        status: "connected",
        quality_score: 94,
        last_updated: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        records: 125000
      },
      {
        id: 2,
        name: "Payment Gateway",
        type: "API",
        status: "connected",
        quality_score: 89,
        last_updated: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        records: 45000
      },
      {
        id: 3,
        name: "Customer Reviews",
        type: "MongoDB",
        status: "warning",
        quality_score: 76,
        last_updated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        records: 8900
      },
      {
        id: 4,
        name: "Inventory System",
        type: "REST API",
        status: "error",
        quality_score: 45,
        last_updated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        records: 0
      }
    ]);
  });

  // 📊 Quality Metrics

  // 📦 Export CSV
  app.get("/api/export/report", isAuthenticated, async (req, res) => {
    try {
      const [metrics, pipelines, issues, sources, trendData] = await Promise.all([
        storage.getLatestQualityMetrics(),
        storage.getAllDataPipelines(),
        storage.getAllDataIssues(),
        storage.getAllDataSources(),
        storage.getAllQualityTrendData(),
      ]);

      if (!metrics || !pipelines || !issues || !sources || !trendData) {
        return res.status(404).json({ message: "Data not available for export" });
      }

      let csv = "Data Quality Dashboard Export\n\n";
      csv += "QUALITY METRICS\n";
      csv += "Metric,Value,Change\n";
      csv += `Overall Quality,${metrics.overallScore}%,${metrics.trendChange}%\n`;
      csv += `Data Freshness,${metrics.dataFreshness}%,${metrics.freshnessChange}%\n`;
      csv += `Data Completeness,${metrics.dataCompleteness}%,${metrics.completenessChange}%\n`;
      csv += `Data Accuracy,${metrics.dataAccuracy}%,${metrics.accuracyChange}%\n\n`;

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=data-quality-report.csv");

      return res.send(csv);
    } catch (error) {
      console.error("Export report error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

export default router;
